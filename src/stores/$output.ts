import { datass } from 'datass'
import { INSTRUMENT_NAMES } from '#/configuration/keyboard/constants/instrumentNames'

export const $output = datass.object({
	instrumentIds: INSTRUMENT_NAMES,
	isMidiConnected: false,
	isMidiEnabled: false,
	midiOutputName: '',
	midiConnectionError: null,
	midiOutputNames: [],
	isLocalSoundSelected: false,
	loadedInstruments: {},
	selectedInstrumentName: 'marimba',
	isOutputEnabled: false,
	areInstrumentsLoaded: false,
	isBuiltInInstrumentSelected: false,
	outputType: 'instrument',
	audioContext: null!,
	volume: 60
})

$output.watch((oldValue, newValue) => console.log('midiOutputNames changed', [oldValue, newValue]))
