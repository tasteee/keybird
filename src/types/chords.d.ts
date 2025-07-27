// Notes because I dont know fuck about music theory:
// inversions: +1 would mean rotated notes up one, so the bassNote would now be the 2nd note of the chord, rather than the first. When you go up X amount of inversions as there are notes in your chord, you wind up back at the same original notes, but an octave up.
// voicings: ways to arrange chord notes, from closed (standard, close as possible) to spread wide across octaves. can be useful for eliminating mud. makes interesting sounds of same chords.

type VoicingT =
	| 'open'
	| 'closed'
	| 'drop2'
	| 'drop3'
	| 'drop2and4'
	| 'rootless'
	| 'spread'
	| 'cluster'
	| 'shell'
	| 'pianistic'
	| 'guitaristic'
	| 'orchestral'

// A ChordT is a wild, un-commited-to chord that the user can preview,
// modify, and optionally add to their progression if they like it.
// When a ChordT is added to a progression, it just evolves into a
// ProgressionChordT, which is a more concrete version of the chord
// that has a duration and is marked as not a rest.
// type ChordT = {
// 	id: string
// 	symbol: string
// 	bassNote: string
// 	tonic: string
// 	inversion: number
// 	voicing: VoicingT | string
// 	octave: number
// 	color?: string
// 	notes: string[]
// 	adjustedNotes: string[]
// 	minVelocity: number
// 	maxVelocity: number
// }

type TonalChordT = TonalChord.Chord

// Derived from a tonal chord, but with additional properties
// for use in the app.
type ChordT = {
	id: string
	color: string // e.g., "red", "blue", etc.
	adjustedNotes?: string[] // Notes adjusted for the project's base octave
	octaveOffset: number // offset from projects base octave
	rootNote: string // "C", "D#", "F", etc.
	symbol: string // e.g., "C", "Dm7", "G7#9"
	// degree: string // Roman numeral or Nashville notation.
	voicing: string // e.g., "closed", "open", etc.
	inversion: number // 0 for root position, 1 for first inversion, etc.
	durationBeats: number // e.g., 4 for a whole note, 2 for a half note, etc.
	bassNote: string // e.g., "C", "D#", "F", etc.
	notes: string[] // Array of notes in the chord
	minVelocity: number // Minimum velocity for MIDI playback
	maxVelocity: number // Maximum velocity for MIDI playback
}
