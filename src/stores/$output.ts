import { datass, PreparedObjectStoreT } from 'datass'
import { WebMidi, Output } from 'webmidi'
import { INSTRUMENT_NAMES } from '#/configuration/keyboard/constants/instrumentNames'
import Soundfont, { InstrumentName, Player } from 'soundfont-player'
import { playNote, stopNote, playChord, stopChord } from '#/modules/playInstrument'

type OutputStoreBaseT = {
	isMidiConnected: boolean // have we successfully listed MIDI outputs?
	midiOutputId: string // the currently selected MIDI output ID
	midiOutputIds: string[] // list of available MIDI output IDs
	midiOutput: Output | null // the currently selected MIDI output object
	midiConnectionError: Error | null // error when trying to connect to MIDI outputs
	instrumentIds: string[] // list of available instrument names
	loadedInstruments: Record<string, Player> // loaded instruments mapped by their names
	selectedInstrumentName: string // the currently selected instrument name
	isOutputEnabled: boolean // is the global output enabled?
	areInstrumentsLoaded: boolean // have all instruments been loaded?
	outputType: 'instrument' | 'midi' // type of output, either 'instrument' or 'midi'
	audioContext: AudioContext
	volume: number
}

type OutputStoreT = PreparedObjectStoreT<OutputStoreBaseT> & {
	play: (note: string | string[], options?: any) => void
	stop: (note: string | string[], options?: any) => void
	playChord: (chord: CustomChordT, options?: any) => void
	stopChord: (chord: CustomChordT, options?: any) => void
}

export const $output = datass.object<OutputStoreBaseT>({
	isMidiConnected: false,
	midiOutputId: '',
	midiOutputIds: [],
	midiOutput: null,
	midiConnectionError: null,
	instrumentIds: INSTRUMENT_NAMES,
	loadedInstruments: {},
	selectedInstrumentName: 'marimba',
	isOutputEnabled: true,
	areInstrumentsLoaded: false,
	outputType: 'instrument',
	audioContext: null!,
	volume: 60
}) as OutputStoreT

$output.play = playNote
$output.stop = stopNote
$output.playChord = playChord
$output.stopChord = stopChord

async function loadInstrument(context, name: InstrumentName) {
	return new Promise((resolve, reject) => {
		Soundfont.instrument(context, name).then(resolve).catch(reject)
	})
}

const setupAudio = () => {
	const context = new AudioContext()
	$output.set.lookup('audioContext', context)

	const loader0 = loadInstrument(context, 'acoustic_grand_piano')
	const loader1 = loadInstrument(context, 'acoustic_guitar_nylon')
	const loader2 = loadInstrument(context, 'electric_guitar_clean')
	const loader3 = loadInstrument(context, 'xylophone')
	const loader4 = loadInstrument(context, 'marimba')
	const whenAllAreDone = Promise.all([loader0, loader1, loader2, loader3, loader4])

	whenAllAreDone.then((instruments) => {
		$output.set.lookup('loadedInstruments', {
			acoustic_grand_piano: instruments[0],
			acoustic_guitar_nylon: instruments[1],
			electric_guitar_clean: instruments[2],
			xylophone: instruments[3],
			marimba: instruments[4]
		})
	})
}

setupAudio()
