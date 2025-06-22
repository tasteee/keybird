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

type ScaleChordsT = {
	[key: string]: string[]
}

type KeyConfigT = {
	keyCode: string
	color: string
	variant: string
	label: string
	width: number
	isFunctional: boolean
	isPlayable: boolean
	function: string
}

type PlayableKeyMappingT = KeyConfigT & {
	note: string
	rootNote: string
	alternateLabel: string
	chordName: string
	chordRootNote: string
}

type FunctionalKeyMappingT = KeyConfigT & {
	alternateLabel: string
}

type KeyMappingT = FunctionalKeyMappingT | PlayableKeyMappingT

type KeyConfigMapT = {
	[keyCode: string]: KeyConfigT
}

type KeyMapT = {
	[keyCode: string]: KeyMappingT
}

type LogConfigT = {
	level: 'info' | 'warn' | 'error' | 'success'
	title: string
	message: string
	data: AnyObjectT
}

type LogsConfigT = {
	[key: string]: LogConfigT
}

type MidiTempoT = {
	bpm: number
	time: number
}

type MidiTimeSignatureT = {
	timeSignature: number
	ticks: number
	measures: number
}

type MidiHeaderT = {
	PPQ: number
	tempos: MidiTempoT[]
	timeSignatures: MidiTimeSignatureT[]
}

type JsonMidiT = {
	header: MidiHeaderT
	tracks: MidiTrackT[]
}

type MidiTrackT = {
	id: number
	channel: number
	instrument: Instrument
	name: string
	notes: MidiNoteT[]
	endOfTrackTicks: number
}

type MidiInstrumentT = {
	family: string
	number: number
	name: string
}

type MidiNoteT = {
	duration: number
	durationTicks: number
	midi: number
	name: string
	ticks: number
	time: number
	velocity: number
}

// ####################### old below

type VboardRootNoteT = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B'

type VboardLayoutKeyT = {
	function: string
	label: string
	code: string
	width: number
}

type VboardLayoutT = {
	id: string
	rows: VboardRowT[]
}

type VboardRowT = {
	id: string
	keys: VboardLayoutKeyT[]
}

type VboardKeyT = {
	function: string
	label: string
	code: string
	width: number
	className?: string
	variant?: string
	color?: string
}

type VboardChordT = {
	rootNote: string
	name: string
	notes: string[]
	scaleNames?: string[]
}

type VboardScaleT = {
	rootNote: VboardRootNoteT
	notes: string[]
	chordNames: string[]
	scaleType: string
}

type VboardSymbolT = {
	name: string
	symbols: string[]
	example: string
}

type VboardAllScalesT = {
	[key: VboardScaleNameT]: VboardScaleT
}

namespace VboardT {
	export type RootNote = VboardRootNoteT
	export type ScaleType = VboardScaleTypeT
	export type ScaleName = VboardScaleNameT
	export type Layout = VboardLayoutT
	export type Row = VboardRowT
	export type Key = VboardKeyT
	export type Chord = VboardChordT
	export type Scale = VboardScaleT
	export type Symbol = VboardSymbolT
	export type AllScales = VboardAllScalesT
}

type KeyEventT = Partial<KeyboardEvent> & {
	key: string // 'a', 'A', '1', 'Enter', 'Shift', 'ArrowUp', etc
	code: string // 'KeyA', 'Digit1', 'Enter', 'ShiftRight', 'ArrowUp', etc
	type: string // 'keydown', 'keyup', 'keypress'
	altKey: boolean // Is the alt key pressed?
	shiftKey: boolean // Is the shift key pressed?
	ctrlKey: boolean // Is the control key pressed?
	metaKey: boolean // Is Windows / Command key pressed?
	repeat: boolean // Is the key being held down?
	location: number // 0 standard, 1 left, 2 right, 3 numpad, 4 mobile, 5 joystick
	currentTarget: HTMLElement // To reference the key.
}

type QwertyKeyT = {
	// So that we can keep specific keys maintained
	// and configued in the qwertyKeys.config but
	// not have them rendering to the DOM.
	isIgnored: boolean

	// Each quertyKey specifies the row it will
	// be rendered in. This is to simplify complexity
	// related to having nested objects in state.
	row: number
	keyCode: string
	label: string
	width: number
	altLabel: string
	isPressed: boolean
	isRelated: boolean
	isPlayable: boolean
	isFunctional: boolean
	isDisabled: boolean
	isConfigurable: boolean
	function: string
	variant: string
	color: string
	midi: number
	velocity: number
	pattern: string
	rhythm: string
	inversion: number
	voicing: string
	humanize: number
	note: string
	rootNote: string
}

type KeyCodeAndRowT = {
	keyCode: string
	row: number
}

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

type SignalT = StrategicEntityT & {
	id: string
	rowId: string
	startDivision: number
	endDivision: number
	updatedTime: number
	isMuted: boolean
}

type SignalRowT = StrategicEntityT & {
	id: string
	label: string
	index: number
	signals: SignalT[]
	isEnabled: boolean
	color: string
	hint: string
	accessory: string
}

type SignalRowsT = Record<string, SignalRowT>

type Note = string
type Inversion = number
type Voicing = Note[]

type ChordT = TonalChord.Chord

type CustomChordT = {
	id: string
	octaveOffset: number // offset from projects base octave
	rootNote: string // "C", "D#", "F", etc.
	symbol: string // e.g., "C", "Dm7", "G7#9"
	degree: string // Roman numeral or Nashville notation.
	voicing: string // e.g., "closed", "open", etc.
	inversion: number // 0 for root position, 1 for first inversion, etc.
	durationBeats: number // e.g., 4 for a whole note, 2 for a half note, etc.
	bassNote: string // e.g., "C", "D#", "F", etc.
	notes: string[] // Array of notes in the chord
	minVelocity: number // Minimum velocity for MIDI playback
	maxVelocity: number // Maximum velocity for MIDI playback
}

type ProjectT = {
	id: string
	name: string
	description: string
	artworkUrl: string
	bpm: number
	scaleRootNote: string
	scaleType: string
	scaleSymbol: string
	ppqResolution: number
	timeingNumerator: number
	timeingDenominator: number
	baseOctave: number
	defaultChordVoicing: string
	defaultChordInversion: number
	defaultMaxVelocity: number
	defaultMinVelocity: number
	defaultSpeedMultiplier: number
}
