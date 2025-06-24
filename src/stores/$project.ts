import { datass } from 'datass'

const createProject = () => {
	return {
		id: crypto.randomUUID(),
		name: '',
		description: '',
		artworkUrl: '',
		bpm: 123,
		scaleRootNote: 'F#',
		scaleType: 'minor',
		scaleSymbol: 'F# minor',
		ppqResolution: 128,
		timeingNumerator: 4,
		timeingDenominator: 4,
		defaultOctave: 3,
		defaultBassOctave: 2,
		defaultChordVoicing: 'closed',
		defaultChordInversion: 0,
		defaultMaxVelocity: 95,
		defaultMinVelocity: 75,
		defaultSpeedMultiplier: 1
	}
}

const initialProject = createProject()
export const $project = datass.object(initialProject)
