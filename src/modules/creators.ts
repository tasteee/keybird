import appConfig from '#/configuration/app.config.json'
import { numbers } from './numbers'

export const createProgression = (overrides: Partial<ProgressionT> = {}): ProgressionT => {
	const steps = overrides.steps ?? []
	const totalLength = steps.reduce((sum, step) => sum + (step.durationBeats || 4), 0)
	const lengthBars = Math.ceil(totalLength / 4)

	return {
		steps,
		bpm: overrides.bpm || 93,
		id: overrides.id || crypto.randomUUID(),
		lengthBars: overrides.lengthBars || lengthBars
	}
}

export const createPattern = (overrides: Partial<PatternT> = {}): PatternT => {
	return {
		id: overrides.id || '',
		lengthBars: overrides.lengthBars || 4,
		signalMap: overrides.signalMap || {},
		toneMap: overrides.toneMap || {}
	}
}

export const createSignal = (overrides: Partial<SignalT> = {}): SignalT => {
	const id = overrides.id || (crypto.randomUUID() as string)
	const startDivision = numbers.clamp.StartDivision(overrides.startDivision || 0)
	const endDivision = numbers.clamp.endDivision(overrides.endDivision || 0)
	const duration = endDivision - startDivision
	const durationDivisions = numbers.clamp.durationDivisions(duration || 0)
	const isMuted = overrides.isMuted ?? false

	if (!overrides.toneId) console.error('createSignal: no toneId provided')
	if (durationDivisions < 1) console.error('createSignal: durationDivisions must be at least 1')
	if (startDivision < 0) console.error('createSignal: startDivision must be 0 or greater')
	if (endDivision < startDivision) console.error('createSignal: endDivisions must be greater than or equal to startDivision')

	return {
		id,
		toneId: overrides.toneId || '',
		minVelocity: overrides.minVelocity || 70,
		maxVelocity: overrides.maxVelocity || 90,
		startDivision,
		endDivision,
		durationDivisions,
		updatedDate: Date.now(),
		isMuted
	}
}

export const createRest = (overrides: Partial<ProgressionRestT> = {}): ProgressionRestT => {
	return {
		id: overrides.id || (crypto.randomUUID() as string),
		isRest: true,
		symbol: 'Rest',
		color: 'gray',
		durationBeats: overrides.durationBeats || 2,
		inversion: overrides.inversion || 0,
		voicing: overrides.voicing || 'closed',
		octaveOffset: overrides.octaveOffset || 0,
		notes: overrides.notes || [],
		rootNote: overrides.rootNote || 'Rest',
		bassNote: overrides.bassNote || '',
		minVelocity: overrides.minVelocity || 70,
		maxVelocity: overrides.maxVelocity || 90
	}
}

type PartialStepT = Partial<ProgressionStepT> & { id?: string }

export const createStep = (overrides: PartialStepT = {}): ProgressionStepT => {
	const durationBeats = overrides.durationBeats || 4
	const color = overrides.color || appConfig.rootNoteColors[overrides.rootNote] || ''

	return {
		id: overrides.id || (crypto.randomUUID() as string),
		isRest: overrides.isRest || false,
		inversion: overrides.inversion || 0,
		voicing: overrides.voicing || 'closed',
		octaveOffset: overrides.octaveOffset || 0,
		notes: overrides.notes || [],
		rootNote: overrides.rootNote || '',
		symbol: overrides.symbol || '',
		bassNote: overrides.bassNote || '',
		minVelocity: overrides.minVelocity || 70,
		maxVelocity: overrides.maxVelocity || 90,
		color,
		durationBeats
	}
}

// export const createToneRow = (overrides: Partial<ToneT> = {}): ToneT => {
// 	return {
// 		id: overrides.id || '',
// 		index: overrides.index || 0,
// 		octave: overrides.octave || 0,
// 		totalIndex: overrides.totalIndex as number,
// 		signalIds: overrides.signalIds || []
// 	}
// }

// export const createTone = (overrides: Partial<ToneT> = {}): ToneT => {
// 	return {
// 		id: overrides.id || '',
// 		index: overrides.index || 0,
// 		octave: overrides.octave || 0,
// 		totalIndex: overrides.totalIndex as number,
// 		signalIds: overrides.signalIds || []
// 	}
// }

// export const createToneMap = (): ToneMapT => {
// 	return TONE_IDS.reduce((final, id, totalIndex) => {
// 		const index = tones.getIdIndex(id) - 1
// 		const octave = tones.getIdOctave(id)
// 		const tone = createTone({ id, index, octave, totalIndex })
// 		final[id] = tone
// 		return final
// 	}, {} as ToneMapT)
// }

export const createChord = (overrides: Partial<TonalChordT> = {}): TonalChordT => {
	const color = overrides.tonic ? appConfig.rootNoteColors[overrides.tonic] : ''

	return {
		id: overrides.id || '',
		symbol: overrides.symbol || '',
		bassNote: overrides.bassNote || '',
		inversion: overrides.inversion || 0,
		tonic: overrides.tonic || '',
		voicing: overrides.voicing || 'closed',
		octave: overrides.octave || 0,
		notes: overrides.notes || [],
		minVelocity: overrides.minVelocity || 60,
		maxVelocity: overrides.maxVelocity || 85,
		color
	}
}

export const createPerformedNote = (signal: SignalT, note: string | null, project: ProjectT): PerformedNoteT => {
	const velocity = numbers.randomInt(signal.minVelocity, signal.maxVelocity)
	const startTicks = 32 * signal.startDivision
	const endTicks = 32 * signal.endDivision
	const startMs = (startTicks * (60000 / project.bpm)) / project.ppq
	const endMs = (endTicks * (60000 / project.bpm)) / project.ppq

	return {
		note,
		toneId: signal.toneId,
		signalId: signal.id,
		startMs,
		endMs,
		velocity: 110,
		startDivision: signal.startDivision,
		endDivision: signal.endDivision,
		startTicks: 32 * signal.startDivision,
		endTicks: 32 * signal.endDivision,
		absoluteEndMs: endMs,
		absoluteStartMs: startMs,
		absoluteStartTicks: startTicks,
		absoluteEndTicks: endMs
	}
}
