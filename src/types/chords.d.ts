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
type TonalChordT = TonalChord.Chord

type ChordT = {
	id: string
	color: string
	adjustedNotes?: string[]
	octaveOffset: number
	rootNote: string
	symbol: string
	voicing: string
	inversion: number
	durationBeats: number
	bassNote: string
	notes: string[]
	minVelocity: number
	maxVelocity: number
}
