import { datass } from 'datass'
import { WebMidi, Output } from 'webmidi'
import { INSTRUMENT_NAMES } from '#/configuration/keyboard/constants/instrumentNames'

type OutputStoreT = {
	isMidiConnected: boolean
	isMidiEnabled: boolean
	midiOutputId: string
	midiOutputIds: string[]
	midiOutput: Output | null
	midiConnectionError: Error | null

	isLocalSoundSelected: boolean
	instrumentIds: string[]
	loadedInstruments: Record<string, any>
	selectedInstrumentName: string
	isOutputEnabled: boolean
	areInstrumentsLoaded: boolean
	isBuiltInInstrumentSelected: boolean
	outputType: 'instrument' | 'midi'
	audioContext: AudioContext
	volume: number
}

export const $output = datass.object<OutputStoreT>({
	isMidiConnected: false,
	isMidiEnabled: false,
	midiOutputId: '',
	midiOutputIds: [],
	midiOutput: null,
	midiConnectionError: null,

	isLocalSoundSelected: false,
	instrumentIds: INSTRUMENT_NAMES,
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
