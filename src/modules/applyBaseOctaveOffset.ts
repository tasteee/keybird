import { $project } from '#/stores/$project'

export const applyBaseOctaveOffset = (notes: string[]): string[] => {
	const baseOctave = $project.baseOctave
	const hasNoNotes = !notes || notes.length === 0
	if (hasNoNotes) return []

	return notes.map((note) => {
		// Validate note format
		const noteMatch = note.match(/^([A-G]#?)(\d+)$/)
		const isInvalidFormat = !noteMatch
		if (isInvalidFormat) {
			console.warn(`Invalid note format in applyBaseOctaveOffset: ${note}`)
			return note
		}

		const noteName = noteMatch[1]
		const octave = parseInt(noteMatch[2])

		// Apply base octave offset
		const newOctave = octave + (baseOctave - 3) // Assuming base octave 3 is the default

		// Clamp to valid range
		const clampedOctave = Math.max(0, Math.min(8, newOctave))
		const adjustedNote = `${noteName}${clampedOctave}`

		return adjustedNote
	})
}
