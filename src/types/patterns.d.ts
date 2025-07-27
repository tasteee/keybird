type MappingStrategyT =
	| 'direct' // N0->chord[0], N1->chord[1], etc.
	| 'cyclic' // Wrap around: if chord has 3 notes, N3->chord[0]
	| 'octave-cycle' // N3 in 3-note chord -> chord[0] + octave
	| 'voice-leading' // Choose closest available chord tone

type NoteRoleT =
	| 'root'
	| 'third'
	| 'fifth'
	| 'seventh'
	| 'tension9'
	| 'tension11'
	| 'tension13'
	| 'bass'
	| 'melody'
	| 'inner'

type StrategicEntityT = {
	mappingStrategy?: MappingStrategyT
	fallbackBehavior?: 'skip' | 'transpose' | 'substitute'
	voicePreference?: 'low' | 'mid' | 'high' | 'any'
	minVelocity?: number // 0-127
	maxVelocity?: number // 0-127
}

// A tone is a placeholder for a note that is not known at this time.
// (It manifests in the app by being a ROW of the pattern editor.)
// T1 will map to the 1st note of a chord when the pattern is applied
// to that chord. T1-2 will map to the 1st note of a chord, 2 octaves down.
// T1+1 will map to the 1st note of a chord, 1 octave up. Tones go from
// T1-2 to T8+2, 8 tones per octave, 5 octaves total. T1-2 to T8-2,
// T1-1 to T8-1, T1 to T8, T1+1 to T8+1, and T1+2 to T8+2.
type ToneT = {
	id: string
	index: number
	octave: number
	totalIndex: number
	signalIds: string[]
}

// A signal is like a midi note, and it corresponds to a toneId rather
// than a specific note. So like T4+1 (4th note of a chord, 1 octave up)
// rather than like C#5, because the pattern is being created to be applied
// to any chord a user could throw at it in the future. Signals are sent
// to the midi engine, along with the progression, and the midi engine
// derives actual midi notes by mapping the signal's toneId to the
// corresponding note of the chord in the progression.
type SignalT = {
	id: string
	toneId: string
	startDivision: number
	endDivision: number
	durationDivisions: number
	updatedDate: number
	isMuted: boolean
	minVelocity: number
	maxVelocity: number
}

type PartialSignalWithIdT = Partial<SignalT> & { id: string }

type PatternT = {
	id: string
	title: string
	description: string
	tags: string[]
	strategy: 'cycling'
	lengthBars: number
	signals: Record<string, SignalT>
	tones: Record<string, ToneT>
}

type SignalMapT = Record<string, SignalT>
type ToneMapT = Record<string, ToneT>
