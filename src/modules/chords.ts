const applyNoteBaseOctaveOffset = (note: string, baseOctaveOffset: number): string => {
	// Split the note wherever it finds a digit.
	const [pitch, octave] = note.split(/(\d+)/)
	const newOctave = Number(octave) + baseOctaveOffset
	return `${pitch}${newOctave}`
}

// chord.adjustedNotes is like [C3, E3, G3] and baseOctave is 4
// since default baseOctave is 3, we need to get difference from
// default baseOctave and baseOctave current, which would be 1
// and then we apply that to each note in adjustedNotes.
const applyBaseOctave = (chord: TonalChordT, baseOctave: number): TonalChordT => {
	const octaveOffset = baseOctave - 3

	const adjustedNotes = chord.adjustedNotes.map((note) => {
		const newNote = applyNoteBaseOctaveOffset(note, octaveOffset)
		return newNote
	})

	return { ...chord, adjustedNotes }
}
