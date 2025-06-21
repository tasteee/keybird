import appConfig from '#/configuration/app.config.json'
import { datass } from 'datass'

const createProject = () => {
	return {
		id: crypto.randomUUID(),
		name: '',
		description: '',
		artworkUrl: '',
		bpm: 93,
		scaleRootNote: 'F#',
		scaleType: 'minor',
		scaleSymbol: 'F# minor',
		ppqResolution: 96,
		timeingNumerator: 4,
		timeingDenominator: 4,
		customPerformancePatterns: [],
		baseOctave: 3,
		defaultChordVoicing: null,
		defaultChordInversion: null,
		defaultMaxVelocity: 95,
		defaultMinVelocity: 75,
		defaultSpeedMultiplier: 1,
		defaultPerformanceId: 'once'
	}
}

const initialProject = createProject()
export const $project = datass.object(initialProject)
