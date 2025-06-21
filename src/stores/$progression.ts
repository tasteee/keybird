import { theory } from '#/utilities/toner'
import { datass, useDatass, type PreparedArrayStoreT } from 'datass'
import { useMemo } from 'react'

const cloneChord = (chord) => {
	return { ...chord, id: crypto.randomUUID() }
}

export const createChord = (symbol: string): CustomChordT => {
	const tonalChord = theory.getChord(symbol)
	const rootNote = tonalChord.tonic
	const degree = '' // TonalChord does not provide this; set as empty or infer elsewhere
	const octaveOffset = 0 // Default to no transposition
	const voicing = 'closed' // TonalChord does not provide voicing; default to "closed"
	const inversion = 0 // Default to root position
	const durationBeats = 4 // Default to whole bar (4 beats)
	const bassNote = tonalChord.bass || rootNote
	const notes = tonalChord.notes || []

	const chord = {
		id: crypto.randomUUID(),
		notes,
		rootNote,
		symbol,
		degree,
		octaveOffset,
		voicing,
		inversion,
		durationBeats,
		bassNote,
		minVelocity: 70,
		maxVelocity: 85
	}

	chord.notes = getChordNotes(chord)
	return chord as CustomChordT
}

export const useNewChord = (symbol: string) => {
	const base = useMemo(() => createChord(symbol), [])
	const chord = useDatass.object(base)
	return chord
}

type ProgressionStoreT = PreparedArrayStoreT<CustomChordT> & {
	actions: {
		// In your $progression store
		updateChordDuration: (id, durationBeats) => void
		moveChordLeft: (id: string) => void
		moveChordRight: (id: string) => void
		addChord: (baseChord: any) => void
		removeChord: (chordId: string) => void
		playLoop: () => void
		deleteChord: (id: string) => void
	}

	hooks: {
		useChord: (id: string) => CustomChordT | null
	}
}

export const $progression = datass.array([]) as ProgressionStoreT

$progression.actions = {} as any
$progression.hooks = {} as any

$progression.actions.deleteChord = (id: string) => {
	const filtered = $progression.state.filter((chord) => chord.id !== id)
	$progression.set(filtered)
	// Optionally clear selection if needed
	// selectedChordId.set('')
}

$progression.actions.updateChordDuration = (id: string, durationBeats: number) => {
	const updatedChords = $progression.state.map((chord) => {
		if (chord.id === id) return { ...chord, durationBeats }
		return chord
	})

	$progression.set(updatedChords)
}

$progression.actions.moveChordLeft = (id: string) => {
	const chords = $progression.state
	const newChords = [...chords]
	const index = chords.findIndex((chord) => chord.id === id)
	const nextIndex = index - 1
	const nextItem = chords[nextIndex]
	const targetItem = chords[index]

	newChords[index] = nextItem
	newChords[nextIndex] = targetItem
	$progression.set(newChords)
}

$progression.actions.moveChordRight = (id: string) => {
	const chords = $progression.state
	const newChords = [...chords]
	const index = chords.findIndex((chord) => chord.id === id)
	const nextIndex = index + 1
	const nextItem = chords[nextIndex]
	const targetItem = chords[index]

	newChords[index] = nextItem
	newChords[nextIndex] = targetItem
	$progression.set(newChords)
}

$progression.actions.addChord = (chord: CustomChordT) => {
	$progression.set.append(cloneChord(chord))
}

$progression.actions.removeChord = (id: string) => {
	const filtered = $progression.state.filter((chord) => chord.id !== id)
	$progression.set(filtered)
}

$progression.actions.playLoop = () => {
	console.log('Playing progression loop...')
	// Implement the logic to play the progression loop
	const playChord = (chord: CustomChordT) => {
		console.log(`Playing chord: ${chord.symbol}`)
	}

	$progression.state.forEach(playChord)
}

$progression.hooks.useChord = (id: string) => {
	return $progression.use().find((chord) => chord.id === id) || null
}

$progression.toMidi = () => {
	const fileName = `chords-${Date.now()}.mid`
	createAndDownloadMidi($progression.state, fileName)
}

const noteMap: { [key: string]: number } = {
	C: 0,
	'C#': 1,
	Db: 1,
	D: 2,
	'D#': 3,
	Eb: 3,
	E: 4,
	F: 5,
	'F#': 6,
	Gb: 6,
	G: 7,
	'G#': 8,
	Ab: 8,
	A: 9,
	'A#': 10,
	Bb: 10,
	B: 11
}

// A helper function to convert a note name (e.g., "C#4") to a MIDI number.
function noteNameToMidi(noteName: string): number | null {
	const match = noteName.match(/^([A-G][#b]?)(-?\d+)$/)
	console.log('noteNameToMidi', noteName, match)
	const [, pitchClass, octaveStr] = match
	const octave = parseInt(octaveStr, 10)
	const noteValue = noteMap[pitchClass]
	return 12 + octave * 12 + noteValue
}

import MidiWriter from 'midi-writer-js'
import { Interval, Note, Scale } from 'tonal'
import { getChordNotes } from '#/modules/playInstrument'

/**
 * Takes an array of chords and generates a downloadable MIDI file.
 * @param progression The array of CustomChordT objects.
 * @param fileName The desired name for the downloaded file (e.g., "my-progression.mid").
 */
export function createAndDownloadMidi(progression: CustomChordT[], fileName: string = 'progression.mid') {
	let previousTicks = 0
	const TICKS_PER_BEAT = 128
	const track = new MidiWriter.Track()

	progression.forEach((chord) => {
		const midiNotes = chord.notes.map(Note.midi)
		const durationTicks = chord.durationBeats * TICKS_PER_BEAT

		console.log({
			chord,
			pitch: midiNotes,
			wait: previousTicks,
			duration: `T${durationTicks}`, // Duration in ticks
			velocity: Math.min(127, Math.max(0, chord.maxVelocity)) // Clamp velocity to 0-127 range
		})

		const noteEvent = new MidiWriter.NoteEvent({
			pitch: midiNotes,
			wait: previousTicks,
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
