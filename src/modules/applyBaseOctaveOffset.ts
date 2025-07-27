import { $project } from '../stores/$project'
import { Note } from 'tonal'

// Apply base octave offset from project settings
export const applyBaseOctaveOffset = (notes: string[]): string[] => {
	const baseOctave = $project.baseOctave
	if (baseOctave === 3) return notes
	const baseOffset = baseOctave - 3

	return notes.map((note) => {
		const noteObj = Note.get(note)
		const currentOctave = noteObj.oct || 3
		const newOctave = Math.max(1, Math.min(8, currentOctave + baseOffset)) // Clamp to valid range
		return noteObj.pc + newOctave
	})
}
