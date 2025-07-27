import { makeAutoObservable, runInAction, action, computed, observable } from 'mobx'

// Types
export type ProjectT = {
	id: string
	userId: string
	name: string
	description: string
	baseOctave: number
	bpm: number
	rootNote: string
	scaleType: string
	instrument: string
	volume: number
	isPublic: boolean
	likesCount: number
	arrangements: ArrangementChordT[]
	pattern?: PatternT
}

export type ArrangementChordT = {
	id: string
	chordId: string
	position: number
	duration: number
	octave: number
	inversion: number
	bassNote?: string
	voicing: string
	minVelocity: number
	maxVelocity: number
}

export type PatternT = {
	id: string
	projectId: string
	name: string
	signals: PatternSignalT[]
}

export type PatternSignalT = {
	id: string
	toneIndex: number // 1-7 for T1-T7
	octaveOffset: number // -2 to +2
	startTime: number
	duration: number
	velocity: number
}

export type RootStoreT = {
	chordStore: any // Define proper type
	patternStore: PatternStore
}

// Project Store
export class ProjectStore {
	rootStore: RootStoreT

	@observable accessor projects: ProjectT[] = []
	@observable accessor currentProject: ProjectT | null = null
	@observable accessor selectedChordIds: string[] = []
	@observable accessor isPlaying: boolean = false
	@observable accessor currentPlayPosition: number = 0

	constructor(args: { rootStore: RootStoreT }) {
		this.rootStore = args.rootStore
		makeAutoObservable(this)
	}

	@action
	setCurrentProject = (args: { project: ProjectT | null }) => {
		this.currentProject = args.project
		if (!args.project) return

		this.rootStore.chordStore.loadProjectChords(args.project.id)
		this.rootStore.patternStore.loadProjectPattern({ projectId: args.project.id })
	}

	@action
	updateProject = (args: { updates: Partial<ProjectT> }) => {
		if (!this.currentProject) return
		Object.assign(this.currentProject, args.updates)
	}

	@action
	addChordToArrangement = (args: { chordId: string; position?: number }) => {
		if (!this.currentProject) return

		const newPosition = args.position ?? this.currentProject.arrangements.length
		const newArrangement: ArrangementChordT = {
			id: this.generateId(),
			chordId: args.chordId,
			position: newPosition,
			duration: 1,
			octave: this.currentProject.baseOctave,
			inversion: 0,
			voicing: 'close',
			minVelocity: 60,
			maxVelocity: 100
		}

		this.currentProject.arrangements.push(newArrangement)
	}

	@action
	removeChordFromArrangement = (args: { arrangementId: string }) => {
		if (!this.currentProject) return

		this.currentProject.arrangements = this.currentProject.arrangements.filter(
			(arrangement) => arrangement.id !== args.arrangementId
		)
	}

	@action
	moveChord = (args: { fromIndex: number; toIndex: number }) => {
		if (!this.currentProject) return

		const arrangements = this.currentProject.arrangements
		const [moved] = arrangements.splice(args.fromIndex, 1)
		arrangements.splice(args.toIndex, 0, moved)

		// Update positions
		arrangements.forEach((arrangement, index) => {
			arrangement.position = index
		})
	}

	@action
	selectChords = (args: { chordIds: string[] }) => {
		this.selectedChordIds = args.chordIds
	}

	@computed
	get selectedArrangements() {
		if (!this.currentProject) return []
		return this.currentProject.arrangements.filter((arrangement) => this.selectedChordIds.includes(arrangement.id))
	}

	@computed
	get totalDuration() {
		if (!this.currentProject) return 0
		return this.currentProject.arrangements.reduce((sum, arrangement) => sum + arrangement.duration, 0)
	}

	@computed
	get currentScale() {
		if (!this.currentProject) return []
		return this.rootStore.chordStore.getScaleNotes(this.currentProject.rootNote, this.currentProject.scaleType)
	}

	private generateId = (): string => {
		return Math.random().toString(36).substr(2, 9)
	}
}

// Pattern Store
export class PatternStore {
	rootStore: RootStoreT

	@observable accessor currentPattern: PatternT | null = null
	@observable accessor selectedSignalIds: string[] = []
	@observable accessor isEditing: boolean = false
	@observable accessor gridResolution: number = 0.25 // 16th notes

	constructor(args: { rootStore: RootStoreT }) {
		this.rootStore = args.rootStore
		makeAutoObservable(this)
	}

	@action
	loadProjectPattern = (args: { projectId: string }) => {
		// Implementation would load pattern from storage/API
		// For now, create empty pattern
		this.currentPattern = {
			id: this.generateId(),
			projectId: args.projectId,
			name: 'Default Pattern',
			signals: []
		}
	}

	@action
	addSignal = (args: { toneIndex: number; octaveOffset: number; startTime: number; duration?: number }) => {
		if (!this.currentPattern) return

		const signalDuration = args.duration ?? 0.5
		const newSignal: PatternSignalT = {
			id: this.generateId(),
			toneIndex: args.toneIndex,
			octaveOffset: args.octaveOffset,
			startTime: args.startTime,
			duration: signalDuration,
			velocity: 100
		}

		this.currentPattern.signals.push(newSignal)
	}

	@action
	moveSignal = (args: { signalId: string; newStartTime: number; newToneIndex?: number; newOctaveOffset?: number }) => {
		const signal = this.currentPattern?.signals.find((s) => s.id === args.signalId)
		if (!signal) return

		signal.startTime = this.snapToGrid({ value: args.newStartTime })
		if (args.newToneIndex !== undefined) signal.toneIndex = args.newToneIndex
		if (args.newOctaveOffset !== undefined) signal.octaveOffset = args.newOctaveOffset
	}

	@action
	resizeSignal = (args: { signalId: string; newDuration: number }) => {
		const signal = this.currentPattern?.signals.find((s) => s.id === args.signalId)
		if (!signal) return

		const snappedDuration = this.snapToGrid({ value: args.newDuration })
		signal.duration = Math.max(this.gridResolution, snappedDuration)
	}

	@action
	deleteSignals = (args: { signalIds: string[] }) => {
		if (!this.currentPattern) return

		this.currentPattern.signals = this.currentPattern.signals.filter((signal) => !args.signalIds.includes(signal.id))
	}

	@action
	selectSignals = (args: { signalIds: string[] }) => {
		this.selectedSignalIds = args.signalIds
	}

	@computed
	get selectedSignals() {
		if (!this.currentPattern) return []
		return this.currentPattern.signals.filter((signal) => this.selectedSignalIds.includes(signal.id))
	}

	private snapToGrid = (args: { value: number }): number => {
		return Math.round(args.value / this.gridResolution) * this.gridResolution
	}

	private generateId = (): string => {
		return Math.random().toString(36).substr(2, 9)
	}
}

// UI Store
export class UIStore {
	rootStore: RootStoreT

	@observable accessor isPatternEditorOpen: boolean = false
	@observable accessor selectedChordForPattern: string | null = null
	@observable accessor currentView: 'projects' | 'editor' | 'browser' = 'projects'
	@observable accessor isChordContextMenuVisible: boolean = false
	@observable accessor contextMenuPosition: { x: number; y: number } | null = null
	@observable accessor contextMenuTarget: string | null = null

	constructor(args: { rootStore: RootStoreT }) {
		this.rootStore = args.rootStore
		makeAutoObservable(this)
	}

	@action
	openPatternEditor = () => {
		this.isPatternEditorOpen = true

		// Auto-select first chord if none selected
		const hasNoSelectedChord = !this.selectedChordForPattern
		const hasArrangements = this.rootStore.projectStore.currentProject?.arrangements.length
		if (hasNoSelectedChord && hasArrangements) {
			const firstChordId = this.rootStore.projectStore.currentProject.arrangements[0].chordId
			this.selectedChordForPattern = firstChordId
		}
	}

	@action
	closePatternEditor = () => {
		this.isPatternEditorOpen = false
	}

	@action
	setSelectedChordForPattern = (args: { chordId: string }) => {
		this.selectedChordForPattern = args.chordId
	}

	@action
	showChordMenu = (args: { x: number; y: number; targetId: string }) => {
		this.isChordContextMenuVisible = true
		this.contextMenuPosition = { x: args.x, y: args.y }
		this.contextMenuTarget = args.targetId
	}

	@action
	hideChordMenu = () => {
		this.isChordContextMenuVisible = false
		this.contextMenuPosition = null
		this.contextMenuTarget = null
	}
}
