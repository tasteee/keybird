import { $output } from '#/stores'
import { WebMidi, Output } from 'webmidi'

const getChannel = (channelNumber: number) => {
	if (!WebMidi.outputs.length) throw new Error('MIDI output not available')
	return $output.midiOutput!.channels[channelNumber]
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
		$output.midiOutput!.playNote(note.note, {
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
