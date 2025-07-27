import { Note, Scale, Interval, Chord } from 'tonal'
import random from 'random'

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

type ExtensionStrategyT = 'cycling' | 'scaleBased' | 'intervalBased' | 'harmonicSeries'

type ParsedSignalIdT = {
	noteIndex: number
	octaveOffset: number
}

type ExtensionContextT = {
	chord: ChordT
	project: ProjectT
	noteIndex: number
	octaveOffset: number
}

type MappingResultT = {
	signal: SignalT
	note: string | null
}

type PerformedNoteT = {
	toneId: string
	signalId: string
	note: string | null
	startDivision: number
	endDivision: number
	startMs: number
	endMs: number
	startTicks: number
	endTicks: number
	velocity: number
}

type ToneWithSignalsT = ToneT & { signals: SignalT[] }

type ApplyOptionsT = {
	toneMap: Record<string, ToneWithSignalsT>
	chord: ChordT
	project: ProjectT
	strategy: ExtensionStrategyT
}

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

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value))
const clampOctave = (octave: number): number => clamp(octave, OCTAVE_RANGE_MIN, OCTAVE_RANGE_MAX)
const getNoteOctave = (note: string): number => Note.get(note).oct || DEFAULT_OCTAVE
const getNotePitchClass = (note: string): string => Note.get(note).pc
const buildNoteString = (pitchClass: string, octave: number): string => Note.simplify(`${pitchClass}${clampOctave(octave)}`)
const isValidSignalId = (signalId: string): boolean => signalIdRegex.test(signalId)
const isNonEmptyArray = (target: any) => Array.isArray(target) && target.length > 0
const isNoteIndexWithinChord = (noteIndex: number, chordSize: number): boolean => noteIndex < chordSize
const hasValidChordNotes = (chord: ChordT): boolean => isNonEmptyArray(chord.notes)
const hasValidScale = (scale: any): boolean => isNonEmptyArray(scale.notes)
const buildScaleKey = (project: ProjectT): string => `${project.scaleRootNote} ${project.scaleType}`
const getBaseOctave = (project: ProjectT, chord: ChordT): number => project.baseOctave + chord.octaveOffset

const signalIdRegex = /^N(\d+)([+-]\d+)?$/

const parseSignalId = (signalId: string): ParsedSignalIdT => {
	const match = signalId.match(signalIdRegex)!
	const noteIndex = parseInt(match[1]) // Uncaught TypeError: Cannot read properties of null (reading '1')
	const octaveOffset = match[2] ? parseInt(match[2]) : 0
	return { noteIndex, octaveOffset }
}

const mapDirectChordNote = (noteIndex: number, octaveOffset: number, chord: ChordT): string => {
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

const checkNoteInCollection = (candidateNote: string, existingNotes: string[]): boolean => {
	const candidatePC = getNotePitchClass(candidateNote)
	return existingNotes.some((note) => getNotePitchClass(note) === candidatePC)
}

const buildExtendedNotesFromScale = (chord: ChordT, scale: any, defaultOctave: number, targetLength: number): string[] => {
	const extendedNotes: string[] = [...chord.notes]
	let scaleIndex = 0

	while (extendedNotes.length <= targetLength && scaleIndex < SAFETY_LOOP_LIMIT) {
		const scaleDegree = scale.notes[scaleIndex % scale.notes.length]
		const octaveBoost = Math.floor(scaleIndex / scale.notes.length)
		const candidateNote = `${scaleDegree}${defaultOctave + octaveBoost}`
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
	const defaultOctave = getBaseOctave(context.project, context.chord)
	const extendedNotes = buildExtendedNotesFromScale(context.chord, scale, defaultOctave, context.noteIndex)
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
	const nextNoteHeight = Note.get(nextNoteObj.pc).height
	const lastNoteHeight = Note.get(lastNoteObj.pc).height
	const didWrapDown = nextNoteHeight < lastNoteHeight
	if (didWrapDown) finalOctave += 1
	return `${nextNoteObj.pc}${finalOctave}`
}

const buildExtendedNotesWithThirds = (chord: ChordT, project: ProjectT, targetLength: number): string[] => {
	const scaleKey = buildScaleKey(project)
	const scale = Scale.get(scaleKey)
	const extendedNotes: string[] = [...chord.notes]
	let lastNote = extendedNotes[extendedNotes.length - 1]

	while (extendedNotes.length <= targetLength && extendedNotes.length < MAX_EXTENSION_NOTES) {
		const nextNote = calculateThirdAbove(lastNote, scale)
		extendedNotes.push(nextNote)
		lastNote = nextNote
	}

	return extendedNotes
}

function mapWithIntervals(context: ExtensionContextT): string {
	try {
		const extendedNotes = buildExtendedNotesWithThirds(context.chord, context.project, context.noteIndex)
		const hasEnoughNotes = context.noteIndex < extendedNotes.length
		if (!hasEnoughNotes) return mapWithCycling(context)
		const targetNote = extendedNotes[context.noteIndex]
		const currentOctave = getNoteOctave(targetNote)
		const newOctave = currentOctave + context.octaveOffset
		const pitchClass = getNotePitchClass(targetNote)
		return buildNoteString(pitchClass, newOctave)
	} catch (error) {
		return mapWithCycling(context)
	}
}

const buildFundamentalNote = (chord: ChordT, project: ProjectT): string => {
	const defaultOctave = getBaseOctave(project, chord)
	return `${chord.rootNote}${defaultOctave}`
}

const buildExtendedNotesFromHarmonics = (chord: ChordT, fundamentalNote: string, targetLength: number): string[] => {
	const extendedNotes: string[] = [...chord.notes]
	let harmonicIndex = 1

	while (extendedNotes.length <= targetLength && harmonicIndex < HARMONIC_INTERVALS.length) {
		try {
			const interval = HARMONIC_INTERVALS[harmonicIndex]
			const harmonicNote = Note.transpose(fundamentalNote, interval)
			const shouldAddHarmonic = !checkNoteInCollection(harmonicNote, extendedNotes)
			if (shouldAddHarmonic) extendedNotes.push(harmonicNote)
		} catch (error) {}

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
	const fundamentalNote = buildFundamentalNote(context.chord, context.project)
	let extendedNotes = buildExtendedNotesFromHarmonics(context.chord, fundamentalNote, context.noteIndex)
	const needsMoreNotes = extendedNotes.length <= context.noteIndex
	const hasEnoughNotes = context.noteIndex < extendedNotes.length

	if (needsMoreNotes) {
		extendedNotes = fillRemainingWithCycling(extendedNotes, context.chord.notes, context.noteIndex)
	}

	if (!hasEnoughNotes) return mapWithCycling(context)
	const targetNote = extendedNotes[context.noteIndex]
	const currentOctave = getNoteOctave(targetNote)
	const newOctave = currentOctave + context.octaveOffset
	const pitchClass = getNotePitchClass(targetNote)
	return buildNoteString(pitchClass, newOctave)
}

type MapSignalToNoteOptionsT = {
	signalId: string
	chord: ChordT
	project: ProjectT
	strategy: ExtensionStrategyT
}

const mapSignalToNote = (options: MapSignalToNoteOptionsT): string => {
	const { signalId, chord, project, strategy } = options
	const { noteIndex, octaveOffset } = parseSignalId(signalId)
	const isDirectMapping = isNoteIndexWithinChord(noteIndex, chord.notes.length)
	if (isDirectMapping) return mapDirectChordNote(noteIndex, octaveOffset, chord)
	const context: ExtensionContextT = { chord, project, noteIndex, octaveOffset }
	const strategyFunction = STRATEGIES[strategy]?.function || mapWithCycling
	return strategyFunction(context)
}

const mapSignalsToNotes = (
	signals: SignalT[],
	chord: ChordT,
	project: ProjectT,
	strategy: ExtensionStrategyT
): MappingResultT[] => {
	return signals.map((signal) => ({
		note: mapSignalToNote({
			signalId: signal.id,
			chord,
			project,
			strategy
		}),
		signal
	}))
}

const createPerformedNote = (signal: SignalT, note: string | null, project: ProjectT): PerformedNoteT => {
	const velocity = random.int(signal.minVelocity, signal.maxVelocity)
	const startTicks = 32 * signal.startDivision
	const endTicks = 32 * signal.endDivision
	const startMs = (startTicks * (60000 / project.bpm)) / project.ppqResolution
	const endMs = (endTicks * (60000 / project.bpm)) / project.ppqResolution

	return {
		note,
		toneId: signal.toneId,
		signalId: signal.id,
		startMs,
		endMs,
		startDivision: signal.startDivision,
		endDivision: signal.endDivision,
		startTicks: 32 * signal.startDivision,
		endTicks: 32 * signal.endDivision,
		velocity: 110
	}
}

const applyPatternToChord = (options: ApplyOptionsT): PerformedNoteT[] => {
	const { toneMap, chord, project, strategy } = options
	const result: PerformedNoteT[] = []

	Object.values(toneMap).forEach((tone) => {
		tone.signals.forEach((signal) => {
			const note = mapSignalToNote({
				signalId: signal.id,
				chord,
				project,
				strategy
			})

			const performance = createPerformedNote(signal, note, project)
			result.push(performance)
		})
	})

	console.log({ chord, result })
	return result
}

export { mapSignalToNote, mapSignalsToNotes, applyPatternToChord, STRATEGIES }

export type { ExtensionStrategyT, MappingResultT, PerformedNoteT, ApplyOptionsT }
