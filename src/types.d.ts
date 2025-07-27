type PlaybackNoteT = {
	name: string
	startTicks: number
	endTicks: number
	velocity: number
	rootNote?: string
	duration?: number
	octave?: number
	ticks?: number
	midi?: number
	time?: number
}

type SignalRowT = {
	id: string
	label: string
	index: number
	signals: SignalT[]
	isEnabled: boolean
	color: string
	hint: string
	accessory: string
}

type TonalChordT = TonalChord.Chord

type PerformedNoteT = {
	toneId: string
	signalId: string
	note: string | null
	startDivision: number
	endDivision: number
	startTicks: number
	endTicks: number
	velocity: number
	startMs: number
	endMs: number
	absoluteStartTicks?: number
	absoluteEndTicks?: number
	absoluteStartMs?: number
	absoluteEndMs?: number
}

type WithoutT<T, K extends keyof T> = {
	[P in keyof T as P extends K ? never : P]: T[P]
}
