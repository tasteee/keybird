import MidiWriter from 'midi-writer-js'
import { Midi, Note } from 'tonal'
import { $project } from '#/stores/$project'

export const downloadProjectProgressionMidi = (project, progression: ProgressionT) => {
	const fileName = `${project.name}-${$project.scaleSymbol}-${Date.now()}.mid`

	let previousTicks = 0
	const TICKS_PER_BEAT = 128
	const track = new MidiWriter.Track()

	progression.steps.forEach((chord) => {
		const midiNotes = chord.notes.map(Note.midi)
		const durationTicks = chord.durationBeats * TICKS_PER_BEAT

		const noteEvent = new MidiWriter.NoteEvent({
			pitch: midiNotes,
			duration: `T${durationTicks}`, // Duration in ticks
			velocity: Math.min(127, Math.max(0, chord.maxVelocity)) // Clamp velocity to 0-127 range
		})

		previousTicks += durationTicks // Update the wait time for the next note
		track.addEvent(noteEvent)
	})

	// 4. Generate the MIDI file
	const writer = new MidiWriter.Writer(track)
	const dataUri = writer.dataUri()

	// 5. Trigger the download
	const link = document.createElement('a')
	link.href = dataUri
	link.download = fileName.endsWith('.mid') ? fileName : `${fileName}.mid`
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
}
