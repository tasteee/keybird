import { applyBaseOctaveOffset } from './applyBaseOctaveOffset'
import * as Tonal from 'tonal'

// Declare WebAudioFont globals
declare global {
	interface Window {
		WebAudioFontPlayer: any
		_tone_0253_Acoustic_Guitar_sf2_file: any
		AudioContext: any
		webkitAudioContext: any
	}
}

type InstrumentT = {
	url?: string
	variable?: string
}

class Instrument {
	private audioContext: AudioContext
	private player: any
	private instrument: any
	private output: AudioDestinationNode
	private masterGainNode: GainNode
	private isLoaded = false

	constructor(instrumentConfig: InstrumentT = {}) {
		const AudioContextFunc = window.AudioContext || window.webkitAudioContext
		this.audioContext = new AudioContextFunc()
		this.output = this.audioContext.destination

		// Create a master gain node for overall volume control
		this.masterGainNode = this.audioContext.createGain()
		this.masterGainNode.gain.setValueAtTime(0.6, this.audioContext.currentTime) // Reasonable volume
		this.masterGainNode.connect(this.output)

		// Debug: Check if WebAudioFont is available
		if (!window.WebAudioFontPlayer) {
			console.error('WebAudioFontPlayer not found. Make sure to include the WebAudioFont script.')
			return
		}

		this.player = new window.WebAudioFontPlayer()

		// Default to acoustic guitar if no instrument specified
		const instrumentVariable = instrumentConfig.variable || '_tone_0253_Acoustic_Guitar_sf2_file'
		this.instrument = window[instrumentVariable] || window._tone_0253_Acoustic_Guitar_sf2_file

		// Debug: Check if instrument data is available
		if (!this.instrument) {
			console.error(`Instrument data ${instrumentVariable} not found. Make sure to include the instrument script.`)
			return
		}

		console.log('WebAudioFont player and instrument data found, initializing...')
		this.initializeInstrument()
	}
	private initializeInstrument = () => {
		if (!this.instrument) {
			console.error('Instrument data not found. Make sure to include the instrument script.')
			return
		}

		try {
			const result = this.player.loader.decodeAfterLoading(this.audioContext, this.instrument)

			// Check if result is a Promise
			if (result && typeof result.then === 'function') {
				result
					.then(() => {
						this.isLoaded = true
						console.log('WebAudioFont instrument loaded!')
					})
					.catch((error: Error) => {
						console.error('Failed to load instrument:', error)
					})
			} else {
				// If not a Promise, assume synchronous loading
				this.isLoaded = true
				console.log('WebAudioFont instrument loaded synchronously!')
			}
		} catch (error) {
			console.error('Error initializing instrument:', error)
		}
	}

	private noteToMidiNumber = (noteName: string): number => {
		const midiNumber = Tonal.Midi.toMidi(noteName)
		if (midiNumber === null) {
			console.warn(`Could not convert note ${noteName} to MIDI number`)
			return 60 // Default to middle C
		}
		return midiNumber
	}

	playingChords = new Set<ChordT>()

	playChord = (chord: ChordT) => {
		if (!this.isLoaded) {
			console.warn('Instrument not yet loaded')
			return
		}

		if (this.playingChords.has(chord)) {
			console.warn('Chord is already playing:', chord.symbol)
			return
		}

		this.playingChords.add(chord)
		const notesToPlay = chord.adjustedNotes || chord.notes
		const notes = applyBaseOctaveOffset(notesToPlay)
		const midiNumbers = notes.map(this.noteToMidiNumber)

		// Validate that we have valid MIDI numbers
		const validMidiNumbers = midiNumbers.filter((num) => num >= 0 && num <= 127)

		if (validMidiNumbers.length === 0) {
			console.warn('No valid MIDI numbers for chord:', chord)
			return
		}

		// Ensure audio context is running
		if (this.audioContext.state === 'suspended') {
			this.audioContext.resume()
		}

		try {
			// Play individual notes with slight delay for natural strum effect
			validMidiNumbers.forEach((midiNumber, index) => {
				const noteDelay = index * 0.15 // 15ms delay between notes
				// Play for exactly 500ms then auto-fade
				const duration = 0.5 // 500ms
				const now = this.audioContext.currentTime

				this.player.queueWaveTable(
					this.audioContext,
					this.masterGainNode,
					this.instrument,
					now + noteDelay,
					midiNumber,
					duration
				)
			})
		} catch (error) {
			console.error('Error playing chord:', error)
		}
	}

	// No longer needed - chords auto-fade after 500ms
	stopChord = (chord: ChordT) => {
		// Auto-fade handles this
	}

	// Method to change instruments dynamically
	setInstrument = (instrumentVariable: string) => {
		const newInstrument = window[instrumentVariable]
		if (!newInstrument) {
			console.error(`Instrument ${instrumentVariable} not found`)
			return
		}

		this.instrument = newInstrument
		this.isLoaded = false
		this.initializeInstrument()
	}

	// Utility method to play single notes (for testing)
	playNote = (noteName: string, duration = 1.5) => {
		if (!this.isLoaded) {
			console.warn('Instrument not yet loaded')
			return
		}

		const midiNumber = this.noteToMidiNumber(noteName)
		const now = this.audioContext.currentTime

		this.player.queueWaveTable(this.audioContext, this.masterGainNode, this.instrument, now, midiNumber, duration)
	}
}

export const instrument = new Instrument()
export { Instrument }
