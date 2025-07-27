import { action, autorun, computed, observable } from 'mobx'
import { mdsa } from '#/modules/mdsa'
import { midiEngine } from '#/modules/midiEngine'
import { $pattern } from './$pattern'

const dsa = mdsa(() => $project)

export class ProjectStore implements ProjectStoreT {
	@observable accessor id = crypto.randomUUID() as string
	@observable accessor name = 'lorem ipsum dolor sit amet'
	@observable accessor description = 'lorem ipsum dolor sit amet'
	@observable accessor artworkUrl = ''
	@observable accessor userId = ''
	@observable accessor bpm = 93
	@observable accessor scaleRootNote = 'F#'
	@observable accessor scaleType = 'minor'
	@observable accessor ppqResolution = 96
	@observable accessor timeingNumerator = 4
	@observable accessor timeingDenominator = 4
	@observable accessor baseOctave = 3
	@observable accessor defaultBassOctave = 2
	@observable accessor defaultChordVoicing = 'closed'
	@observable accessor defaultChordInversion = 0
	@observable accessor defaultMaxVelocity = 85
	@observable accessor defaultMinVelocity = 36
	@observable accessor defaultSpeedMultiplier = 1
	@observable accessor isSaved = false
	@observable accessor isPublic = false
	@observable accessor createdDate = new Date().toISOString()
	@observable accessor updatedDate = new Date().toISOString()

	@computed get scaleSymbol() {
		return `${this.scaleRootNote} ${this.scaleType}`
	}

	@action setName = dsa('name')
	@action setDescription = dsa('description')
	@action setArtworkUrl = dsa('artworkUrl')
	@action setBpm = dsa('bpm')
	@action setScaleRootNote = dsa('scaleRootNote')
	@action setScaleType = dsa('scaleType')
	@action setPpqResolution = dsa('ppqResolution')
	@action setTimeingNumerator = dsa('timeingNumerator')
	@action setTimeingDenominator = dsa('timeingDenominator')
	@action setBaseOctave = dsa('baseOctave')
	@action setDefaultChordVoicing = dsa('defaultChordVoicing')
	@action setDefaultChordInversion = dsa('defaultChordInversion')
	@action setDefaultMaxVelocity = dsa('defaultMaxVelocity')
	@action setDefaultMinVelocity = dsa('defaultMinVelocity')
	@action setDefaultSpeedMultiplier = dsa('defaultSpeedMultiplier')
	@action setIsSaved = dsa('isSaved')
	@action setIsPublic = dsa('isPublic')
	@action setCreatedDate = dsa('createdDate')
	@action setUpdatedDate = dsa('updatedDate')
	@action setId = dsa('id')
}

export const $project = new ProjectStore()

autorun(() => {
	$project.bpm // subscribe to this
	$project.ppqResolution // subscribe to this
	if (!midiEngine.isReady) return
	midiEngine.update({ project: $project })
})
