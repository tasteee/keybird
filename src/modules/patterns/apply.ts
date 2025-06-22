import { Note, Scale, Interval, Chord } from 'tonal'

// Constants
const HARMONIC_INTERVALS = [
	'1P', // Fundamental (unison)
	'8P', // 2nd harmonic (octave)
	'12P', // 3rd harmonic (octave + fifth)
	'15P', // 4th harmonic (2 octaves)
	'17M', // 5th harmonic (2 octaves + major third)
	'19P', // 6th harmonic (2 octaves + fifth)
	'21m', // 7th harmonic (2 octaves + minor seventh)
	'22P', // 8th harmonic (3 octaves)
	'24M', // 9th harmonic (3 octaves + major second)
	'26M', // 10th harmonic (3 octaves + major third)
	'27A', // 11th harmonic (3 octaves + augmented fourth)
	'28P' // 12th harmonic (3 octaves + fifth)
] as const

const OCTAVE_RANGE_MIN = 0
const OCTAVE_RANGE_MAX = 9
const DEFAULT_OCTAVE = 4
const MAX_EXTENSION_NOTES = 50
const MAX_HARMONIC_INDEX = 20
const SAFETY_LOOP_LIMIT = 50

// Types
type ExtensionStrategyT = 'cycling' | 'scaleBased' | 'intervalBased' | 'harmonicSeries'

type ParsedSignalIdT = {
	noteIndex: number
	octaveOffset: number
}

type ExtensionContextT = {
	chord: CustomChordT
	project: ProjectT
	noteIndex: number
	octaveOffset: number
}

type MappingResultT = {
	signal: SignalT
	note: string | null
}

type PerformedNoteT = {
	rowId: string
	signalId: string
	note: string | null
	startDivision: number
	endDivision: number
}

type ApplyOptionsT = {
	signalRows: SignalRowsT
	chord: CustomChordT
	project: ProjectT
	strategy: ExtensionStrategyT
}

// Strategy definitions
const STRATEGIES = {
	cycling: {
		label: 'Cycling',
		description: 'Cycles through chord notes, adding octaves as needed',
		function: mapWithCycling
	},
	scaleBased: {
		label: 'Scale-based',
		description: "Extends using notes from the project's scale",
		function: mapWithScale
	},
	intervalBased: {
		label: 'Interval-based',
		description: 'Stacks thirds to build extended chord tones',
		function: mapWithIntervals
	},
	harmonicSeries: {
		label: 'Harmonic Series',
		description: 'Uses natural harmonic overtones from the chord root',
		function: mapWithHarmonicSeries
	}
} as const

// Pure utility functions
const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value))
const clampOctave = (octave: number): number => clamp(octave, OCTAVE_RANGE_MIN, OCTAVE_RANGE_MAX)
const getNoteOctave = (note: string): number => Note.get(note).oct || DEFAULT_OCTAVE
const getNotePitchClass = (note: string): string => Note.get(note).pc
const buildNoteString = (pitchClass: string, octave: number): string => Note.simplify(`${pitchClass}${clampOctave(octave)}`)
const isValidSignalId = (signalId: string): boolean => signalIdRegex.test(signalId)
const isNonEmptyArray = (target: any) => Array.isArray(target) && target.length > 0
const isNoteIndexWithinChord = (noteIndex: number, chordSize: number): boolean => noteIndex < chordSize
const hasValidChordNotes = (chord: CustomChordT): boolean => isNonEmptyArray(chord.notes)
const hasValidScale = (scale: any): boolean => isNonEmptyArray(scale.notes)

const signalIdRegex = /^N(\d+)([+-]\d+)?$/

const parseSignalId = (signalId: string): ParsedSignalIdT => {
	const match = signalId.match(signalIdRegex)!
	const noteIndex = parseInt(match[1])
	const octaveOffset = match[2] ? parseInt(match[2]) : 0
	return { noteIndex, octaveOffset }
}

// Direct chord note mapping
const mapDirectChordNote = (noteIndex: number, octaveOffset: number, chord: CustomChordT): string => {
	const targetNote = chord.notes[noteIndex]
	const currentOctave = getNoteOctave(targetNote)
	const newOctave = currentOctave + octaveOffset
	const pitchClass = getNotePitchClass(targetNote)
	return buildNoteString(pitchClass, newOctave)
}

function mapWithCycling(context: ExtensionContextT): string {
	const chordSize = context.chord.notes.length
	const wrappedIndex = context.noteIndex % chordSize
	const cycleOctaveBoost = Math.floor(context.noteIndex / chordSize)
	const baseNote = context.chord.notes[wrappedIndex]
	const currentOctave = getNoteOctave(baseNote)
	const finalOctave = currentOctave + cycleOctaveBoost + context.octaveOffset
	const pitchClass = getNotePitchClass(baseNote)
	return buildNoteString(pitchClass, finalOctave)
}

// Strategy 2: Scale-based extension
const buildScaleKey = (project: ProjectT): string => `${project.scaleRootNote} ${project.scaleType}`
const getBaseOctave = (project: ProjectT, chord: CustomChordT): number => project.baseOctave + chord.octaveOffset

const checkNoteInCollection = (candidateNote: string, existingNotes: string[]): boolean => {
	const candidatePC = getNotePitchClass(candidateNote)
	return existingNotes.some((note) => getNotePitchClass(note) === candidatePC)
}

const buildExtendedNotesFromScale = (
	chord: CustomChordT,
	scale: any,
	baseOctave: number,
	targetLength: number
): string[] => {
	const extendedNotes: string[] = [...chord.notes]
	let scaleIndex = 0

	while (extendedNotes.length <= targetLength && scaleIndex < SAFETY_LOOP_LIMIT) {
		const scaleDegree = scale.notes[scaleIndex % scale.notes.length]
		const octaveBoost = Math.floor(scaleIndex / scale.notes.length)
		const candidateNote = `${scaleDegree}${baseOctave + octaveBoost}`
		const shouldAddNote = !checkNoteInCollection(candidateNote, extendedNotes)
		if (shouldAddNote) extendedNotes.push(candidateNote)
		scaleIndex++
	}

	return extendedNotes
}

function mapWithScale(context: ExtensionContextT): string {
	const scaleKey = buildScaleKey(context.project)
	const scale = Scale.get(scaleKey)
	if (!hasValidScale(scale)) return mapWithCycling(context)
	const baseOctave = getBaseOctave(context.project, context.chord)
	const extendedNotes = buildExtendedNotesFromScale(context.chord, scale, baseOctave, context.noteIndex)
	const hasEnoughNotes = context.noteIndex < extendedNotes.length
	if (!hasEnoughNotes) return mapWithCycling(context)
	const targetNote = extendedNotes[context.noteIndex]
	const currentOctave = getNoteOctave(targetNote)
	const newOctave = currentOctave + context.octaveOffset
	const pitchClass = getNotePitchClass(targetNote)
	return buildNoteString(pitchClass, newOctave)
}

const determineThirdInterval = (lastNote: string, scale: any): string => {
	if (!hasValidScale(scale)) return '3M'
	const lastNotePC = getNotePitchClass(lastNote)
	const scaleIndex = scale.notes.indexOf(lastNotePC)
	if (scaleIndex === -1) return '3M'
	const nextScaleIndex = (scaleIndex + 2) % scale.notes.length
	const intervalFromRoot = Interval.distance(lastNotePC, scale.notes[nextScaleIndex])
	return intervalFromRoot || '3M'
}

const calculateThirdAbove = (lastNote: string, scale: any): string => {
	const thirdInterval = determineThirdInterval(lastNote, scale)
	const nextNote = Note.transpose(lastNote, thirdInterval)
	const nextNoteObj = Note.get(nextNote)
	const lastNoteObj = Note.get(lastNote)
	let finalOctave = nextNoteObj.oct || lastNoteObj.oct || DEFAULT_OCTAVE
	const didWrapDown = Note.get(nextNoteObj.pc).height < Note.get(lastNoteObj.pc).height
	if (didWrapDown) finalOctave += 1
	return `${nextNoteObj.pc}${finalOctave}`
}

const buildExtendedNotesWithThirds = (chord: CustomChordT, project: ProjectT, targetLength: number): string[] => {
	const scaleKey = buildScaleKey(project)
	const scale = Scale.get(scaleKey)
	const extendedNotes: string[] = [...chord.notes]
	let lastNote = extendedNotes[extendedNotes.length - 1]

	while (extendedNotes.length <= targetLength && extendedNotes.length < MAX_EXTENSION_NOTES) {
		try {
			const nextNote = calculateThirdAbove(lastNote, scale)
			extendedNotes.push(nextNote)
			lastNote = nextNote
		} catch (error) {
			break
		}
	}

	return extendedNotes
}

function mapWithIntervals(context: ExtensionContextT): string {
	const { chord, project, noteIndex, octaveOffset } = context

	try {
		const extendedNotes = buildExtendedNotesWithThirds(chord, project, noteIndex)

		const hasEnoughNotes = noteIndex < extendedNotes.length
		if (!hasEnoughNotes) {
			return mapWithCycling(context)
		}

		const targetNote = extendedNotes[noteIndex]
		const currentOctave = getNoteOctave(targetNote)
		const newOctave = currentOctave + octaveOffset
		const pitchClass = getNotePitchClass(targetNote)

		return buildNoteString(pitchClass, newOctave)
	} catch (error) {
		return mapWithCycling(context)
	}
}

// Strategy 4: Harmonic series extension
const buildFundamentalNote = (chord: CustomChordT, project: ProjectT): string => {
	const baseOctave = getBaseOctave(project, chord)
	return `${chord.rootNote}${baseOctave}`
}

const buildExtendedNotesFromHarmonics = (chord: CustomChordT, fundamentalNote: string, targetLength: number): string[] => {
	const extendedNotes: string[] = [...chord.notes]
	let harmonicIndex = 1

	while (extendedNotes.length <= targetLength && harmonicIndex < HARMONIC_INTERVALS.length) {
		try {
			const interval = HARMONIC_INTERVALS[harmonicIndex]
			const harmonicNote = Note.transpose(fundamentalNote, interval)

			const shouldAddHarmonic = !checkNoteInCollection(harmonicNote, extendedNotes)
			if (shouldAddHarmonic) {
				extendedNotes.push(harmonicNote)
			}
		} catch (error) {
			// Skip invalid intervals
		}

		harmonicIndex++

		if (harmonicIndex > MAX_HARMONIC_INDEX) break
	}

	return extendedNotes
}

const fillRemainingWithCycling = (extendedNotes: string[], chordNotes: string[], targetLength: number): string[] => {
	const result = [...extendedNotes]
	const chordSize = chordNotes.length

	while (result.length <= targetLength) {
		const cycleIndex = (result.length - chordSize) % chordSize
		const cycleOctaveBoost = Math.floor((result.length - chordSize) / chordSize) + 1
		const baseNote = chordNotes[cycleIndex]
		const currentOctave = getNoteOctave(baseNote)
		const boostedOctave = currentOctave + cycleOctaveBoost
		const pitchClass = getNotePitchClass(baseNote)

		result.push(`${pitchClass}${boostedOctave}`)
	}

	return result
}

function mapWithHarmonicSeries(context: ExtensionContextT): string {
	const { chord, project, noteIndex, octaveOffset } = context

	const fundamentalNote = buildFundamentalNote(chord, project)
	let extendedNotes = buildExtendedNotesFromHarmonics(chord, fundamentalNote, noteIndex)

	const needsMoreNotes = extendedNotes.length <= noteIndex
	if (needsMoreNotes) {
		extendedNotes = fillRemainingWithCycling(extendedNotes, chord.notes, noteIndex)
	}

	const hasEnoughNotes = noteIndex < extendedNotes.length
	if (!hasEnoughNotes) {
		return mapWithCycling(context)
	}

	const targetNote = extendedNotes[noteIndex]
	const currentOctave = getNoteOctave(targetNote)
	const newOctave = currentOctave + octaveOffset
	const pitchClass = getNotePitchClass(targetNote)

	return buildNoteString(pitchClass, newOctave)
}

// Main mapping function
const mapSignalToNote = (
	signalId: string,
	chord: CustomChordT,
	project: ProjectT,
	strategy: ExtensionStrategyT
): string | null => {
	try {
		if (!hasValidChordNotes(chord)) return null

		const { noteIndex, octaveOffset } = parseSignalId(signalId)
		const isDirectMapping = isNoteIndexWithinChord(noteIndex, chord.notes.length)

		if (isDirectMapping) {
			return mapDirectChordNote(noteIndex, octaveOffset, chord)
		}

		const context: ExtensionContextT = { chord, project, noteIndex, octaveOffset }
		const strategyFunction = STRATEGIES[strategy]?.function || mapWithCycling

		return strategyFunction(context)
	} catch (error) {
		console.error('Error mapping signal to note:', error)
		return null
	}
}

// Batch operations
const mapSignalsToNotes = (
	signals: SignalT[],
	chord: CustomChordT,
	project: ProjectT,
	strategy: ExtensionStrategyT
): MappingResultT[] =>
	signals.map((signal) => ({
		signal,
		note: mapSignalToNote(signal.id, chord, project, strategy)
	}))

const createPerformedNote = (signal: SignalT, note: string | null): PerformedNoteT => ({
	note,
	rowId: signal.rowId,
	signalId: signal.id,
	startDivision: signal.startDivision,
	endDivision: signal.endDivision
})

const applyPatternToChord = (options: ApplyOptionsT): PerformedNoteT[] => {
	const { signalRows, chord, project, strategy } = options
	const result: PerformedNoteT[] = []

	Object.values(signalRows).forEach((row) => {
		row.signals.forEach((signal) => {
			const note = mapSignalToNote(signal.id, chord, project, strategy)
			result.push(createPerformedNote(signal, note))
		})
	})

	return result
}

// Demo function
const createTestProject = (): ProjectT => ({
	id: 'proj1',
	name: 'Test Project',
	description: 'Test',
	artworkUrl: '',
	bpm: 120,
	scaleRootNote: 'C',
	scaleType: 'major',
	scaleSymbol: 'C',
	ppqResolution: 480,
	timeingNumerator: 4,
	timeingDenominator: 4,
	baseOctave: 4,
	defaultChordVoicing: 'closed',
	defaultChordInversion: 0,
	defaultMaxVelocity: 127,
	defaultMinVelocity: 1,
	defaultSpeedMultiplier: 1.0
})

const createTestChord = (): CustomChordT => ({
	id: 'chord1',
	octaveOffset: 0,
	rootNote: 'D',
	symbol: 'Dm7',
	degree: 'ii',
	voicing: 'closed',
	inversion: 0,
	durationBeats: 4,
	bassNote: 'D',
	notes: ['D4', 'F4', 'A4', 'C5'],
	minVelocity: 60,
	maxVelocity: 100
})

const demonstrateStrategies = (): void => {
	const project = createTestProject()
	const chord = createTestChord()

	console.log('=== Strategy Comparison for Dm7 chord ===')
	console.log('Chord notes:', chord.notes)
	console.log('')

	const testIndices = [
		'N0',
		'N1',
		'N2',
		'N3',
		'N4',
		'N5',
		'N6',
		'N7',
		'N8',
		'N0+1',
		'N1+1',
		'N2+1',
		'N3+1',
		'N4+1',
		'N5+1',
		'N6+1',
		'N7+1',
		'N8+1'
	]

	const strategyKeys = Object.keys(STRATEGIES) as ExtensionStrategyT[]

	strategyKeys.forEach((strategy) => {
		console.log(`--- ${strategy.toUpperCase()} Strategy ---`)
		testIndices.forEach((index) => {
			const result = mapSignalToNote(index, chord, project, strategy)
			console.log(`${index} -> ${result}`)
		})
		console.log('')
	})
}

// Exports
export { mapSignalToNote, mapSignalsToNotes, applyPatternToChord, demonstrateStrategies, STRATEGIES }
export type {
	ExtensionStrategyT as ExtensionStrategy,
	MappingResultT as MappingResult,
	PerformedNoteT as PerformedNote,
	ApplyOptionsT as ApplyOptions
}
