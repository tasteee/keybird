import { theory } from '#/modules/theory'
import { action, computed, observable, toJS, autorun } from 'mobx'
import { observer } from 'mobx-react-lite'
import { computedFn } from 'mobx-utils'
import { $project } from './$project'

// This store powers the chord browser.
class ChordsStore {
	// The chords for the specifically chosen scale.
	// Not a computed because we need to be able to
	// modify these chords.
	@observable accessor chords = [] as ChordT[]

	// User can pin chords to create a collection
	// of ones they specifically like for this project.
	@observable accessor pinnedChordIds = []

	@computed get scale() {
		const scaleSymbol = $project.scaleSymbol
		const scale = theory.getScale(scaleSymbol)
		const color = theory.getTonicColor(scale.tonic)
		return { color, ...scale }
	}

	@computed get scaleChords() {
		const scaleSymbol = $project.scaleSymbol
		return theory.getVastScaleChords(scaleSymbol)
	}

	checkChordPinned = computedFn((id) => {
		return this.pinnedChordIds.includes(id)
	})

	@action togglePinnedChordId = (id) => {
		const isPinned = this.pinnedChordIds.includes(id)
		if (!isPinned) return this.pinnedChordIds.push(id)
		const index = this.pinnedChordIds.indexOf(id)
		this.pinnedChordIds.splice(index, 1)
	}

	@action reset = () => {
		// Reset is no longer needed for scale properties
		// as they are managed by $project
	}

	@action shuffleChords = () => {
		const shuffledChords = [...this.chords].sort(() => Math.random() - 0.5)
		this.chords = shuffledChords
	}

	@action updateChords = () => {
		// chords already have adjustedNotes applied.
		const scaleSymbol = $project.scaleSymbol
		const chords = theory.getVastScaleChords(scaleSymbol)
		console.log('[updateChords]', { chords })
		this.chords = chords
	}

	@action updateChord = (updates: PartialStepWithIdT) => {
		for (const chord of this.chords) {
			if (chord.id !== updates.id) continue
			Object.assign(chord, updates)
			const baseOctave = $project.baseOctave
			chord.adjustedNotes = theory.getAdjustedNotes(chord)
			break
		}
	}

	useChord = computedFn((id: string) => {
		const chord = this.chords.find((chord) => chord.id === id)
		return chord as ChordT
	})

	getChord = (id: string): ChordT => {
		const chord = this.chords.find((chord) => chord.id === id)
		return chord as ChordT
	}

	constructor() {
		this.updateChords()

		// Auto-update chords when project scale changes
		autorun(() => {
			const scaleSymbol = $project.scaleSymbol
			this.updateChords()
		})
	}
}

export const $chords = new ChordsStore()
