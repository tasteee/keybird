import store from 'store'
import { observable, action, computed, toJS } from 'mobx'
import { TONE_ROWS } from '#/constants/state'
import { buildToneRows } from '#/constants/state/toneRows'

const initialValues = {
	signalMap: store.get('signalMap') || {},
	toneMap: store.get('rowMap') || TONE_ROWS,
	selectedSignalId: store.get('selectedSignalId') || '',
	beatsLength: store.get('beatsLength') || 32,
	cellWidth: store.get('cellWidth') || 20
}

const toneIndexSort = (a: ToneT, b: ToneT) => a.index - b.index
const setTool = (tool: string) => ($patternEditor.tool = tool)
const goUpOctave = () => ($patternEditor.octave += 1)
const goDownOctave = () => ($patternEditor.octave -= 1)
const getSignal = (id: string): SignalT => $patternEditor.signalMap[id]

type MoveSignalParamsT = {
	id: string
	toneId: string
	startDivision?: number
	endDivision?: number
}

class PatternEditorStore {
	@observable accessor octave: number = 0
	@observable accessor tool: string = 'paint'
	@observable accessor signalMap: SignalMapT = initialValues.signalMap
	@observable accessor toneMap: ToneMapT = initialValues.toneMap
	@observable accessor selectedSignalId: string = initialValues.selectedSignalId
	@observable accessor beatsLength: number = initialValues.beatsLength
	@observable accessor cellWidth: number = initialValues.cellWidth

	@computed get signalRows() {
		return this.getSignalRows()
	}

	// Derived list of all tones of the active octave.
	@computed get activeTones() {
		const list = Object.values($patternEditor.toneMap) as ToneT[]
		const filter = (tone: ToneT) => tone.octave === $patternEditor.octave
		return list.filter(filter).sort(toneIndexSort)
	}

	// Derived list of all tone ids of tones in the active octave.
	@computed get activeToneIds() {
		const getId = (tone: ToneT) => tone.id
		const sorted = $patternEditor.activeTones.sort(toneIndexSort)
		const ids = sorted.map(getId)
		return ids
	}

	@action resetEditor = () => {
		this.signalMap = {}
		this.toneMap = buildToneRows()
		this.selectedSignalId = ''
		this.beatsLength = 32
		this.cellWidth = 20
	}

	@action toggleRowSignalId = (toneId: string, signalId: string) => {
		const row = this.toneMap[toneId]
		const hasSignal = row.signalIds.includes(signalId)
		const idFilter = (id: string) => id !== signalId
		const newSignals = hasSignal ? row.signalIds.filter(idFilter) : [...row.signalIds, signalId]
		const updatedRow = { ...row, signalIds: newSignals }
		this.toneMap[toneId] = updatedRow
	}

	@action addSignal = (signal: Partial<SignalT>) => {
		const id = signal.id || crypto.randomUUID()
		const updatedDate = Date.now()
		const toneId = signal.toneId || ''

		const finalSignal: SignalT = {
			isMuted: false,
			startDivision: 0,
			endDivision: 1,
			durationDivisions: 1,
			minVelocity: 50,
			maxVelocity: 75,
			...signal,
			toneId,
			updatedDate,
			id
		}

		this.signalMap[id] = finalSignal
		this.toggleRowSignalId(signal.toneId, id)
	}

	@action removeSignal = (signalId: string) => {
		const signal = this.signalMap[signalId]
		delete this.signalMap[signalId]
		this.toggleRowSignalId(signal.toneId, signalId)
	}

	@action moveSignal = (params: MoveSignalParamsT) => {
		const updatedDate = Date.now()
		const signal = { ...this.signalMap[params.id] }
		const oldRowId = signal.toneId
		const newRowId = params.toneId
		const shouldMoveRows = oldRowId !== newRowId

		const updates: Partial<SignalT> = {
			id: params.id,
			toneId: newRowId,
			startDivision: params.startDivision ?? signal.startDivision,
			endDivision: params.endDivision ?? signal.endDivision,
			updatedDate
		}

		if (shouldMoveRows) {
			this.toggleRowSignalId(oldRowId, signal.id)
			this.toggleRowSignalId(newRowId, params.id)
		}

		this.updateSignal(updates)
	}

	@action updateSignal = (updates: Partial<SignalT>) => {
		const id = updates.id!
		const signal = this.signalMap[id]
		if (!signal) return // Guard against missing signal

		const updatedSignal = {
			...signal,
			...updates,
			updatedDate: Date.now()
		}
		this.signalMap[id] = updatedSignal
	}

	@action toggleMuteSignal = (id: string) => {
		const signal = this.signalMap[id]
		if (!signal) return
		this.updateSignal({ id, isMuted: !signal.isMuted })
	}

	@action duplicateSignal = (signalId: string) => {
		const original = this.signalMap[signalId]
		if (!original) return

		const newSignal: Partial<SignalT> = {
			...original,
			id: crypto.randomUUID(),
			updatedDate: Date.now()
		}

		this.addSignal(newSignal as SignalT)
	}

	getSortedRowSignals = (toneId: string): SignalT[] => {
		const row = this.toneMap[toneId]
		if (!row) return []
		const rowSignals = row.signalIds.map((id) => this.signalMap[id]).filter(Boolean) as SignalT[]
		return rowSignals.sort((a, b) => a.updatedDate - b.updatedDate)
	}

	@action correctSignalOverlaps = (toneId: string) => {
		const sortedSignals = this.getSortedRowSignals(toneId)
		const row = this.toneMap[toneId]
		if (!row) return // Exit if row doesn't exist

		// IMPROVEMENT: Use a dynamic but capped division length. 4096 is a generous max (1024 bars at 4 divisions/beat).
		const MAX_DIVISIONS = 4096
		const divisionMap: (string | null)[] = new Array(MAX_DIVISIONS).fill(null)

		// Fill division map with signal IDs. Because signals are sorted by updatedDate,
		// newer signals will correctly overwrite older ones. This is the core of your "cutting" logic.
		for (const signal of sortedSignals) {
			// Ensure start/end are within bounds
			const start = Math.max(0, signal.startDivision)
			const end = Math.min(divisionMap.length - 1, signal.endDivision)
			for (let i = start; i < end; i++) {
				divisionMap[i] = signal.id
			}
		}

		// Detect contiguous ranges of the same signal ID from the map
		const ranges = new Map<string, Array<{ start: number; end: number }>>()
		let currentId: string | null = null
		let currentStart = 0

		for (let i = 0; i < divisionMap.length; i++) {
			if (divisionMap[i] !== currentId) {
				if (currentId) {
					const existingRanges = ranges.get(currentId) || []
					const newRange = { start: currentStart, end: i }
					ranges.set(currentId, [...existingRanges, newRange])
				}
				currentId = divisionMap[i]
				currentStart = i
			}
		}
		// Add the last detected range
		if (currentId) {
			const existingRanges = ranges.get(currentId) || []
			const newRange = { start: currentStart, end: divisionMap.length }
			ranges.set(currentId, [...existingRanges, newRange])
		}

		// --- BUG FIX: Correctly rebuild state from the calculated ranges ---

		const finalSignals: SignalT[] = []
		const originalSignalMap = new Map(sortedSignals.map((s) => [s.id, s]))

		// Iterate over the ranges to build the new, corrected signals
		for (const [signalId, signalRanges] of ranges.entries()) {
			const originalSignal = originalSignalMap.get(signalId)
			if (!originalSignal) continue // Should not happen, but a good safeguard

			signalRanges.forEach((range, index) => {
				// The first segment keeps the original signal ID.
				// Any subsequent segments (from a split) get a new ID.
				const isFirstSegment = index === 0
				const newSignal: SignalT = {
					...originalSignal,
					startDivision: range.start,
					endDivision: range.end,
					id: isFirstSegment ? originalSignal.id : crypto.randomUUID()
				}
				finalSignals.push(newSignal)
			})
		}

		// --- BUG FIX: Update the global state stores correctly ---

		// 1. Reconcile the global signal map
		const updatedGlobalSignalMap = { ...this.signalMap }
		const finalSignalIds = new Set(finalSignals.map((s) => s.id))
		const originalSignalIds = new Set(sortedSignals.map((s) => s.id))

		// Delete signals that were completely overwritten
		for (const oldId of originalSignalIds) {
			if (!finalSignalIds.has(oldId)) {
				delete updatedGlobalSignalMap[oldId]
			}
		}

		// Add new (split) signals and update existing (trimmed) ones
		for (const finalSignal of finalSignals) {
			updatedGlobalSignalMap[finalSignal.id] = finalSignal
		}

		this.signalMap = updatedGlobalSignalMap

		// 2. Update the row's signalIds array to match the final state
		this.toneMap[toneId] = {
			...row,
			signalIds: Array.from(finalSignalIds)
		}
	}

	getSignalRows = () => {
		const keys = Object.keys(this.toneMap)
		const rowsMap = {} as any

		for (const key of keys) {
			const original = this.toneMap[key]
			const row = { ...original, signalIds: undefined } as any
			row.signals = this.getSortedRowSignals(row.id)
			rowsMap[key] = row
		}

		return rowsMap
	}

	toJson = () => {
		return toJS({
			octave: this.octave,
			tool: this.tool,
			signalRows: this.signalRows,
			signalMap: this.signalMap,
			rowMap: this.toneMap,
			selectedSignalId: this.selectedSignalId,
			beatsLength: this.beatsLength,
			cellWidth: this.cellWidth
		})
	}
}

export const $patternEditor = new PatternEditorStore()
globalThis.$patternEditor = $patternEditor
