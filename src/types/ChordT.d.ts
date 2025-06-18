type Note = string
type Inversion = number
type Voicing = Note[]

type ChordT = TonalChord.Chord

type CustomChordT = {
	octaveOffset: number
	rootNote: string // "C", "D#", "F", etc.
	symbol: string // e.g., "C", "Dm7", "G7#9"
	degree: string // Roman numeral or Nashville notation.
	voicing: string // e.g., "closed", "open", etc.
	inversion: number // 0 for root position, 1 for first inversion, etc.
	durationBeats: number // e.g., 4 for a whole note, 2 for a half note, etc.
	bassNote: string // e.g., "C", "D#", "F", etc.
	notes: string[] // Array of notes in the chord
	id: string
}
