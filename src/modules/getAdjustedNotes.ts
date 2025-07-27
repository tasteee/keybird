import { toJS } from 'mobx'
import * as Tonal from 'tonal'

// Utility: Remove the root note for rootless voicing
function getRootlessNotes(notes: string[]): string[] {
	return notes.slice(1)
}

// Utility: Rotate notes for inversions (positive = up, negative = down)
function getInvertedNotes(notes: string[], inversion: number): string[] {
	const noteCount = notes.length
	if (noteCount === 0) return []
	const rotation = ((inversion % noteCount) + noteCount) % noteCount
	return notes.slice(rotation).concat(notes.slice(0, rotation))
}

// Utility: Assign octaves so notes are strictly ascending
function assignAscendingOctaves(notes: string[], startingOctave: number): string[] {
	let currentOctave = startingOctave
	let lastMidi = -Infinity
	return notes.map((note) => {
		let candidate = `${note}${currentOctave}`
		let midiValue = Tonal.Midi.toMidi(candidate)!
		while (midiValue <= lastMidi) {
			currentOctave += 1
			candidate = `${note}${currentOctave}`
			midiValue = Tonal.Midi.toMidi(candidate)!
		}
		lastMidi = midiValue
		return candidate
	})
}

// Utility: Spread voicing - space notes by an octave each
function applySpreadVoicing(notes: string[]): string[] {
	return notes.map((noteWithOctave, index) => {
		const midiValue = Tonal.Midi.toMidi(noteWithOctave)!
		const newMidiValue = midiValue + index * 12
		return Tonal.Midi.midiToNoteName(newMidiValue)
	})
}

// Utility: Drop voicing (drop2, drop3, drop2and4)
function applyDropVoicing(notes: string[], voicing: ChordT['voicing']): string[] {
	const midiValues = notes.map(Tonal.Midi.toMidi) as number[]
	const indicesToDrop: number[] = []
	const is2and4 = voicing === 'drop2and4'

	const sortedIndices = midiValues
		.map((midi, index) => ({ midi, index }))
		.sort((a, b) => b.midi - a.midi)
		.map((obj) => obj.index)

	if (voicing === 'drop2' || is2and4) indicesToDrop.push(sortedIndices[1])
	if (voicing === 'drop3' || is2and4) indicesToDrop.push(sortedIndices[2])

	return notes.map((note, index) => {
		if (!indicesToDrop.includes(index)) return note
		const midi = Tonal.Midi.toMidi(note)! - 12
		return Tonal.Midi.midiToNoteName(midi)
	})
}

// function ensureStrictlyAscending(notes: string[]): string[] {
//     const result: string[] = []
//     let lastMidi = -Infinity
//     for (const note of notes) {
//         let midi = Tonal.Midi.toMidi(note)!
//         while (midi <= lastMidi) {
//             midi += 12
//         }
//         result.push(Tonal.Midi.midiToNoteName(midi))
//         lastMidi = midi
//     }
//     return result
// }

export function getAdjustedNotes(chord: ChordT): string[] {
	const chordNotes = chord.voicing === 'rootless' ? getRootlessNotes(chord.notes) : [...chord.notes]
	const invertedNotes = getInvertedNotes(chordNotes, chord.inversion)
	let notesWithOctave = assignAscendingOctaves(invertedNotes, 4 + chord.octaveOffset)

	if (chord.voicing === 'spread') console.log('before apply voicing:', toJS({ notesWithOctave, chord }))
	if (chord.voicing === 'spread') notesWithOctave = applySpreadVoicing(notesWithOctave)
	if (chord.voicing === 'drop2') notesWithOctave = applyDropVoicing(notesWithOctave, chord.voicing)
	if (chord.voicing === 'drop3') notesWithOctave = applyDropVoicing(notesWithOctave, chord.voicing)
	if (chord.voicing === 'drop2and4') notesWithOctave = applyDropVoicing(notesWithOctave, chord.voicing)

	if (chord.voicing === 'spread') {
		console.log('Applying spread voicing:', toJS({ notesWithOctave, chord }))
	}

	// const final = ensureStrictlyAscending(notesWithOctave)
	return notesWithOctave
}
