import MidiWriter from 'midi-writer-js'
import { Track } from 'midi-writer-js/build/types/chunks/track'
import { Note } from 'tonal'

type DownloadProgressionArgsT = {
	project: ProjectT
	progression: ProgressionT
}

export const downloadMidiProgression = (args: DownloadProgressionArgsT) => {
	const fileName = createFileName(args)
	const track = createMidiTrack(args)
	const dataUri = generateMidiFile(track)
	triggerDownload({ fileName, dataUri })
}

const createFileName = (args: DownloadProgressionArgsT) => {
	const timestamp = Date.now()
	const fileName = `${args.project.name}-${args.project.scaleSymbol}-${timestamp}.mid`
	return fileName
}

const createMidiTrack = (args: DownloadProgressionArgsT) => {
	const track = new MidiWriter.Track()
	track.setTempo(args.project.bpm)
	const ticksPerBeat = args.project.ppq || 93

	args.progression.steps.forEach((step) => {
		const shouldSkipRest = step.isRest
		if (shouldSkipRest) return
		addChordToTrack({ track, step, ticksPerBeat })
	})

	return track
}

const addChordToTrack = (args: { track: any; step: ProgressionStepT; ticksPerBeat: number }) => {
	const midiNotes = convertNotesToMidi(args.step.adjustedNotes)
	const durationTicks = calculateDurationTicks({ step: args.step, ticksPerBeat: args.ticksPerBeat })
	const velocity = clampVelocity(args.step.maxVelocity)

	const noteEvent = new MidiWriter.NoteEvent({
		pitch: midiNotes,
		duration: `T${durationTicks}`,
		velocity: velocity,
		wait: `T0`
	})

	args.track.addEvent(noteEvent)
}

const convertNotesToMidi = (notes: string[]) => {
	const midiNotes = notes.map((note) => Note.midi(note)).filter((midiNote) => isValidMidiNote(midiNote))
	return midiNotes
}

const isValidMidiNote = (midiNote: any) => {
	const isNumber = typeof midiNote === 'number'
	return isNumber
}

const calculateDurationTicks = (args: { step: ProgressionStepT; ticksPerBeat: number }) => {
	const durationTicks = args.step.durationBeats * args.ticksPerBeat
	return durationTicks
}

const clampVelocity = (velocity: number) => {
	const minVelocity = 0
	const maxVelocity = 127
	const clampedVelocity = Math.min(maxVelocity, Math.max(minVelocity, velocity))
	return clampedVelocity
}

const generateMidiFile = (track: Track) => {
	const writer = new MidiWriter.Writer(track)
	const dataUri = writer.dataUri()
	return dataUri
}

const triggerDownload = (args: { fileName: string; dataUri: string }) => {
	const link = document.createElement('a')
	link.href = args.dataUri
	link.download = args.fileName

	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
}
