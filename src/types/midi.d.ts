// import { MidiT } from 'types/MidiT.js'
// MidiT.Note, MidiT.Track, MidiT.Json, etc.

namespace MidiT {
	export type Tempo = {
		bpm: number
		time: number
	}

	export type TimeSignature = {
		timeSignature: number
		ticks: number
		measures: number
	}

	export type Header = {
		PPQ: number
		tempos: TempoT[]
		timeSignatures: TimeSignatureT[]
	}

	export type Json = {
		header: MidiT.HeaderT
		tracks: MidiT.TrackT[]
	}

	export type Track = {
		id: number
		channel: number
		instrument: InstrumentT
		name: string
		notes: NoteT[]
		endOfTrackTicks: number
	}

	export type Instrument = {
		family: string
		number: number
		name: string
	}

	export type Note = {
		duration: number
		durationTicks: number
		midi: number
		name: string
		ticks: number
		time: number
		velocity: number
	}

	export type Signal = {
		id: string
		note: number
		startTicks: number
		endTicks: number
		velocity: number
	}
}
