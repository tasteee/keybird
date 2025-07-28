import { numbers } from './numbers'
import isEmpty from 'is-empty'

// Converts divisions (1/4 beat segments) to actual beat values
export const convertDivisionsToBeats = (divisions: number): number => {
	const divisionsPerBeat = 4
	const beats = divisions / divisionsPerBeat
	return beats
}

type ConvertBeatsToTicksOptionsT = {
	beats: number
	ppq: number
}

// Converts beats to MIDI ticks based on PPQ resolution
export const convertBeatsToTicks = (options: ConvertBeatsToTicksOptionsT): number => {
	const ticks = options.beats * options.ppq
	return ticks
}

type ConvertBeatsToMsArgsT = {
	beats: number
	bpm: number
}

// Converts beats to milliseconds based on BPM
export const convertBeatsToMs = (args: ConvertBeatsToMsArgsT): number => {
	const msPerMinute = 60000
	const msPerBeat = msPerMinute / args.bpm
	const totalMs = args.beats * msPerBeat
	return totalMs
}

type MapToneToNoteArgsT = {
	toneId: string
	chord: ChordT
}

// Maps a tone ID to a specific note from a chord using cycling strategy
export const mapToneToNote = (args: MapToneToNoteArgsT): string | null => {
	const hasNoNotes = !args.chord.adjustedNotes || args.chord.adjustedNotes.length === 0
	if (hasNoNotes) return null

	// Parse tone ID like "T3+1" into base index and octave offset
	const tonePattern = /^T(\d+)([-+]\d+)?$/
	const match = args.toneId.match(tonePattern)
	const hasInvalidFormat = !match
	if (hasInvalidFormat) return null

	const baseIndex = parseInt(match[1]) - 1 // Convert to 0-based
	const octaveOffsetString = match[2] || '+0'
	const octaveOffset = parseInt(octaveOffsetString)

	const chordNoteCount = args.chord.adjustedNotes.length
	const cycleCount = Math.floor(baseIndex / chordNoteCount)
	const noteIndex = baseIndex % chordNoteCount
	const totalOctaveShift = octaveOffset + cycleCount

	const baseNote = args.chord.adjustedNotes[noteIndex]
	const hasNoOctaveShift = totalOctaveShift === 0
	if (hasNoOctaveShift) return baseNote

	// Apply octave shift to the note (e.g., "C3" + 1 octave = "C4")
	const noteMatch = baseNote.match(/^([A-G]#?)(\d+)$/)
	const hasInvalidNoteFormat = !noteMatch
	if (hasInvalidNoteFormat) return baseNote

	const noteName = noteMatch[1]
	const noteOctave = parseInt(noteMatch[2])
	const shiftedOctave = noteOctave + totalOctaveShift
	const shiftedNote = `${noteName}${shiftedOctave}`

	return shiftedNote
}

type FindStepAtBeatArgsT = {
	beatPosition: number
	progression: ProgressionT
}

// Finds the progression step (chord or rest) active at a given beat position
export const findStepAtBeat = (args: FindStepAtBeatArgsT): ProgressionStepT | null => {
	let accumulatedBeats = 0

	for (const step of args.progression.steps) {
		const stepStartBeat = accumulatedBeats
		const stepEndBeat = accumulatedBeats + step.durationBeats
		const isWithinStep = args.beatPosition >= stepStartBeat && args.beatPosition < stepEndBeat
		if (isWithinStep) return step
		accumulatedBeats += step.durationBeats
	}

	return null
}

type CalculatePatternRepetitionsArgsT = {
	progression: ProgressionT
	patternLengthBeats: number
}

// Calculates how many times a pattern needs to repeat to cover the progression
export const calculatePatternRepetitions = (args: CalculatePatternRepetitionsArgsT): number => {
	const totalProgressionBeats = args.progression.steps.reduce((sum, step) => sum + step.durationBeats, 0)
	const repetitions = Math.ceil(totalProgressionBeats / args.patternLengthBeats)
	return repetitions
}

type CreatePerformedNoteArgsT = {
	signal: SignalT
	chord: ChordT
	note: string
	beatOffset: number
	project: ProjectT
	progression: ProgressionT
}

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
	absoluteStartTicks: number
	absoluteEndTicks: number
	absoluteStartMs: number
	absoluteEndMs: number
}

// Generates a single performed note from a signal and its context
export const createPerformedNote = (options: CreatePerformedNoteArgsT): PerformedNoteT => {
	const signalStartBeats = convertDivisionsToBeats(options.signal.startDivision)
	const signalEndBeats = convertDivisionsToBeats(options.signal.endDivision)

	const absoluteStartBeats = options.beatOffset + signalStartBeats
	const absoluteEndBeats = options.beatOffset + signalEndBeats

	const startTicks = convertBeatsToTicks({
		beats: signalStartBeats,
		ppq: options.project.ppq
	})

	const endTicks = convertBeatsToTicks({
		beats: signalEndBeats,
		ppq: options.project.ppq
	})

	const absoluteStartTicks = convertBeatsToTicks({
		beats: absoluteStartBeats,
		ppq: options.project.ppq
	})

	const absoluteEndTicks = convertBeatsToTicks({
		beats: absoluteEndBeats,
		ppq: options.project.ppq
	})

	const startMs = convertBeatsToMs({
		beats: signalStartBeats,
		bpm: options.project.bpm
	})

	const endMs = convertBeatsToMs({
		beats: signalEndBeats,
		bpm: options.project.bpm
	})

	const absoluteStartMs = convertBeatsToMs({
		beats: absoluteStartBeats,
		bpm: options.project.bpm
	})

	const absoluteEndMs = convertBeatsToMs({
		beats: absoluteEndBeats,
		bpm: options.project.bpm
	})

	const useChordVelocity = options.signal.minVelocity === 0 && options.signal.maxVelocity === 0
	const minVelocity = useChordVelocity ? options.chord.minVelocity : options.signal.minVelocity
	const maxVelocity = useChordVelocity ? options.chord.maxVelocity : options.signal.maxVelocity

	const velocity = numbers.randomInt({
		min: minVelocity,
		max: maxVelocity
	})

	const performedNote: PerformedNoteT = {
		note: options.note,
		toneId: options.signal.toneId,
		signalId: options.signal.id,
		startDivision: options.signal.startDivision,
		endDivision: options.signal.endDivision,
		startTicks,
		endTicks,
		velocity,
		startMs,
		endMs,
		absoluteStartTicks,
		absoluteEndTicks,
		absoluteStartMs,
		absoluteEndMs
	}

	return performedNote
}

type ApplyPatternArgsT = {
	progression: ProgressionT
	project: ProjectT
	pattern: PatternT
}

export const applyPatternToChords = (args: ApplyPatternArgsT): PerformedNoteT[] => {
	console.log('applyPatternToChords.....', args)
	const hasNoSteps = args.progression.steps.length === 0
	if (hasNoSteps) return []

	const hasNoSignals = isEmpty(args.pattern.signalMap)
	if (hasNoSignals) return []

	const performedNotes: PerformedNoteT[] = []
	// TODO: Use properties from project to determine time signature.
	const patternLengthBeats = args.pattern.lengthBeats
	const patternRepetitions = calculatePatternRepetitions({
		progression: args.progression,
		patternLengthBeats
	})

	// Process each pattern repetition
	for (let repetitionIndex = 0; repetitionIndex < patternRepetitions; repetitionIndex++) {
		const patternBeatOffset = repetitionIndex * patternLengthBeats

		// Process each signal in the pattern
		for (const signalId in args.pattern.signalMap) {
			const signal = args.pattern.signalMap[signalId]
			const isMuted = signal.isMuted
			if (isMuted) continue

			const signalStartBeats = convertDivisionsToBeats(signal.startDivision)
			const absoluteSignalStartBeats = patternBeatOffset + signalStartBeats

			// Find which step (chord or rest) is active when this signal starts
			const activeStep = findStepAtBeat({
				beatPosition: absoluteSignalStartBeats,
				progression: args.progression
			})

			const hasNoActiveStep = !activeStep
			if (hasNoActiveStep) continue

			// Skip if this is a rest
			const isRest = activeStep.isRest
			if (isRest) continue

			const mappedNote = mapToneToNote({
				toneId: signal.toneId,
				chord: activeStep
			})

			const hasNoMappedNote = !mappedNote
			if (hasNoMappedNote) continue

			const performedNote = createPerformedNote({
				signal,
				chord: activeStep,
				note: mappedNote,
				beatOffset: patternBeatOffset,
				project: args.project,
				progression: args.progression
			})

			performedNotes.push(performedNote)
		}
	}

	return performedNotes
}
