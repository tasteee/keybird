import appConfig from '#/configuration/app.config.json'
import { numbers } from './numbers'

export const createProgression = (overrides: Partial<ProgressionT> = {}): ProgressionT => {
	return {
		id: overrides.id || '',
		lengthBars: overrides.lengthBars || 4,
		steps: overrides.steps || [],
		bpm: overrides.bpm || 93
	}
}

export const createPattern = (overrides: Partial<PatternT> = {}): PatternT => {
	return {
		id: overrides.id || '',
		title: overrides.title || '',
		description: overrides.description || '',
		tags: overrides.tags || [],
		strategy: overrides.strategy || 'cycling',
		lengthBars: overrides.lengthBars || 4,
		signals: overrides.signals || {},
		tones: overrides.tones || {}
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

type PartialStepT = Partial<ProgressionStepT> & { id?: string }

export const createStep = (overrides: PartialStepT = {}): ProgressionStepT => {
	const durationBeats = overrides.durationBeats || 4
	const color = overrides.color || appConfig.rootNoteColors[overrides.tonic] || ''

	return {
		id: overrides.id || (crypto.randomUUID() as string),
		isRest: overrides.isRest || false,
		inversion: overrides.inversion || 0,
		voicing: overrides.voicing || 'closed',
		octave: overrides.octave || 0,
		notes: overrides.notes || [],
		tonic: overrides.tonic || '',
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
