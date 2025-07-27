import { getAdjustedNotes } from '#/modules/getAdjustedNotes'
import { numbers } from '#/modules/numbers'
import { theory } from '#/utilities/toner'
import { action, computed, observable } from 'mobx'
import { useMemo } from 'react'
import { $project } from '../$project'
import appConfig from '#/configuration/app.config.json'

export class ChordStore {
	@observable accessor id = crypto.randomUUID() as string
	@observable accessor notes: string[] = []
	@observable accessor rootNote: string = ''
	@observable accessor symbol: string = ''
	@observable accessor degree: string = ''
	@observable accessor octaveOffset: number = 0
	@observable accessor voicing: string = 'closed'
	@observable accessor inversion: number = 0
	@observable accessor durationBeats: number = 4
	@observable accessor bassNote: string = ''
	@observable accessor minVelocity: number = 55
	@observable accessor maxVelocity: number = 85
	@observable accessor color: string = appConfig.rootNoteColors[this.rootNote] || ''

	@computed get adjustedNotes(): string[] {
		return getAdjustedNotes(this)
	}

	constructor(symbol: string, overrides: Partial<ChordT> = {}) {
		const tonalChord = theory.getChord(symbol)
		const base = { ...tonalChord, ...overrides }
		this.rootNote = base.tonic
		this.color = appConfig.rootNoteColors[base.tonic]
		this.symbol = base.symbol || symbol
		this.degree = '' // TonalChord does not provide this; set as empty or infer elsewhere
		this.octaveOffset = numbers.toNumber(base.octaveOffset ?? 0) // Default to no transposition
		this.voicing = base.voicing ?? 'closed' // TonalChord does not provide voicing; default to "closed"
		this.inversion = numbers.toNumber(base.inversion ?? 0) // Default to root position
		this.durationBeats = numbers.toNumber(base.durationBeats ?? 4) // Default to whole bar (4 beats)
		this.bassNote = base.bass || this.rootNote
		this.notes = base.notes || []
	}

	@action setOctaveOffset = (value: number) => {
		this.octaveOffset = value
	}

	@action setInversion = (value: number) => {
		this.inversion = value
	}

	@action setDurationBeats = (value: number) => {
		this.durationBeats = value
	}

	@action setVoicing = (value: string) => {
		this.voicing = value
	}

	@action setMinVelocity = (value: number) => {
		this.minVelocity = value
	}

	@action setMaxVelocity = (value: number) => {
		this.maxVelocity = value
	}
}

export const useObservableChord = (symbol: string, overrides = {} as Partial<ChordT>): ChordT => {
	return useMemo(() => {
		const chordStore = new ChordStore(symbol, overrides)
		return chordStore
	}, [])
}
