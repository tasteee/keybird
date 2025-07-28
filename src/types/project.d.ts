type ProjectT = {
	id: string
	name: string
	description: string
	artworkUrl: string
	userId: string
	bpm: number
	scaleRootNote: string
	scaleType: string
	ppq: number
	timeingNumerator: number
	timeingDenominator: number
	baseOctave: number
	defaultBassOctave: number
	defaultChordVoicing: string
	defaultChordInversion: number
	defaultMaxVelocity: number
	defaultMinVelocity: number
	defaultSpeedMultiplier: number
	isSaved: boolean
	isPublic: boolean
	createdDate: string
	updatedDate: string
	scaleSymbol: string
}

interface ProjectStoreT extends ProjectT {
	setName: (name: string) => void
	setDescription: (description: string) => void
	setArtworkUrl: (artworkUrl: string) => void
	setBpm: (bpm: number) => void
	setScaleRootNote: (scaleRootNote: string) => void
	setScaleType: (scaleType: string) => void
	setppq: (ppq: number) => void
	setTimeingNumerator: (timeingNumerator: number) => void
	setTimeingDenominator: (timeingDenominator: number) => void
	setBaseOctave: (baseOctave: number) => void
	setDefaultChordVoicing: (defaultChordVoicing: string) => void
	setDefaultChordInversion: (defaultChordInversion: number) => void
	setDefaultMaxVelocity: (defaultMaxVelocity: number) => void
	setDefaultMinVelocity: (defaultMinVelocity: number) => void
	setDefaultSpeedMultiplier: (defaultSpeedMultiplier: number) => void
	setIsSaved: (isSaved: boolean) => void
	setIsPublic: (isPublic: boolean) => void
	setCreatedDate: (createdDate: string) => void
	setUpdatedDate: (updatedDate: string) => void
}
