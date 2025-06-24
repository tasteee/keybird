import { numberify } from '#/modules/numbers'
import { getChordNotes } from '#/modules/playInstrument'
import { theory } from '#/utilities/toner'

export const createChord = (symbol: string, overrides = {} as Partial<CustomChordT>): CustomChordT => {
	const tonalChord = theory.getChord(symbol)
	const rootNote = tonalChord.tonic
	const degree = '' // TonalChord does not provide this; set as empty or infer elsewhere
	const octaveOffset = numberify(overrides.octaveOffset ?? 0) // Default to no transposition
	const voicing = overrides.voicing ?? 'closed' // TonalChord does not provide voicing; default to "closed"
	const inversion = numberify(overrides.inversion ?? 0) // Default to root position
	const durationBeats = numberify(overrides.durationBeats ?? 4) // Default to whole bar (4 beats)
	const bassNote = tonalChord.bass || rootNote
	const notes = tonalChord.notes || []

	const chord = {
		id: crypto.randomUUID(),
		notes,
		rootNote,
		symbol,
		degree,
		octaveOffset,
		voicing,
		inversion,
		durationBeats,
		bassNote,
		minVelocity: 70,
		maxVelocity: 85
	}

	chord.notes = getChordNotes(chord)
	return chord as CustomChordT
}
