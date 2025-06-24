import { $output } from '#/stores'
import { WebMidi, Output } from 'webmidi'

const handleMidiEnabled = () => {
	const ids = getMidiOutputIds()
	$output.set.lookup('isMidiConnected', true)
	$output.set.lookup('midiOutputIds', ids)
	$output.set.lookup('midiOutputId', ids[0])
	$output.set.lookup('midiOutput', WebMidi.getOutputById(ids[0]))
	console.warn('\n\n\nhandleMidiEnabled', { ids, output: $output.state.midiOutput })
}

const handleMidiError = (error: any) => {
	throw error
}

const getMidiOutputIds = () => {
	return WebMidi.outputs.map((input) => {
		return input.id
	})
}

WebMidi.enable().then(handleMidiEnabled).catch(handleMidiError)

const getChannel = (channelNumber: number) => {
	if (!WebMidi.outputs.length) throw new Error('MIDI output not available')
	return $output.state.midiOutput.channels[channelNumber]
}

const playNote = (note: string) => {
	const channel = getChannel(1)
	channel.playNote(note.toUpperCase())
}

const stopNote = (note: string) => {
	const channel = getChannel(1)
	channel.stopNote(note.toUpperCase())
}

const playChord = (notes: PerformedNoteT[]) => {
	notes.forEach((note) => {
		$output.state.midiOutput.playNote(note.note, {
			time: note.absoluteStartMs,
			duration: note.absoluteEndMs - note.absoluteStartMs,
			rawAttack: note.velocity
		})
	})
}

export const midi = {
	playNote,
	stopNote,
	playChord
}
