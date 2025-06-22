import { theory } from '#/utilities/toner'
import { datass, useDatass, type PreparedArrayStoreT } from 'datass'
import { useMemo } from 'react'

const cloneChord = (chord) => {
	return { ...chord, id: crypto.randomUUID() }
}

const numberify = (target: string | number): number => {
	if (typeof target === 'number') return target
	if (typeof target === 'string') {
		const parsed = parseFloat(target)
		return isNaN(parsed) ? 0 : parsed
	}
	return 0
}

export const createChord = (symbol: string, overrides = {} as Partial<CustomChordT>): CustomChordT => {
	const tonalChord = theory.getChord(symbol)
	const rootNote = tonalChord.tonic
	const degree = '' // TonalChord does not provide this; set as empty or infer elsewhere
	const octaveOffset = numberify(overrides.octaveOffset ?? 0) // Default to no transposition
	const voicing = overrides.voicing ?? 'closed' // TonalChord does not provide voicing; default to "closed"
	const inversion = numberify(overrides.inversion ?? 0) // Default to root position
	const durationBeats = numberify(overrides.durationBeats ?? 4) // Default to whole bar (4 beats)
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

export const useNewChord = (symbol: string, overrides = {}) => {
	const base = useMemo(() => createChord(symbol, overrides), [])
	const chord = useDatass.object(base)

	const setOctaveOffset = (value) => {
		chord.set.lookup('octaveOffset', value)
	}

	const setInversion = (value) => {
		chord.set.lookup('inversion', value)
	}

	const setVoicing = (value) => {
		chord.set.lookup('voicing', value)
	}

	const setMinVelocity = (value) => {
		chord.set.lookup('minVelocity', value)
	}

	const setMaxVelocity = (value) => {
		chord.set.lookup('maxVelocity', value)
	}

	const addChord = () => {
		$progression.addChord(chord.state.id)
	}

	const playChord = () => {
		$output.playChord(chord.state)
	}

	const stopChord = () => {
		$output.stopChord(chord.state)
	}

	return {
		state: chord.state,
		setOctaveOffset,
		setInversion,
		setVoicing,
		setMinVelocity,
		setMaxVelocity,
		addChord,
		playChord,
		stopChord
	}
}

type ProgressionStoreT = PreparedArrayStoreT<CustomChordT> & {
	updateChordDuration: (id, durationBeats) => void
	moveChordLeft: (id: string) => void
	moveChordRight: (id: string) => void
	addChord: (baseChord: any) => void
	removeChord: (chordId: string) => void
	playLoop: () => void
	deleteChord: (id: string) => void
	useChord: (id: string) => any
	useNewChord: (symbol: string) => any
	updateChord: (updates: Partial<CustomChordT>) => void
	toMidi: () => void
}

export const $progression = datass.array([]) as ProgressionStoreT

$progression.updateChord = (updates: Partial<CustomChordT>) => {
	const updatedChords = $progression.state.map((chord) => {
		if (chord.id === updates.id) return { ...chord, ...updates }
		return chord
	})

	$progression.set(updatedChords)
}

$progression.deleteChord = (id: string) => {
	const filtered = $progression.state.filter((chord) => chord.id !== id)
	$progression.set(filtered)
}

$progression.updateChordDuration = (id: string, durationBeats: number) => {
	const updatedChords = $progression.state.map((chord) => {
		if (chord.id === id) return { ...chord, durationBeats }
		return chord
	})

	$progression.set(updatedChords)
}

$progression.moveChordLeft = (id: string) => {
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

$progression.moveChordRight = (id: string) => {
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

$progression.addChord = (chord: CustomChordT) => {
	$progression.set.append(cloneChord(chord))
}

$progression.removeChord = (id: string) => {
	const filtered = $progression.state.filter((chord) => chord.id !== id)
	$progression.set(filtered)
}

$progression.playLoop = () => {
	// console.log('Playing progression loop...')
	// Implement the logic to play the progression loop
	const playChord = (chord: CustomChordT) => {
		// console.log(`Playing chord: ${chord.symbol}`)
	}

	$progression.state.forEach(playChord)
}

$progression.useChord = (id: string) => {
	const chord = $progression.use((chords) => {
		const found = chords.find((chord) => chord.id === id)
		return found || null
	})

	console.log('useChord', id, chord)
	if (!chord) return null

	const setOctaveOffset = (value) => {
		$progression.updateChord({
			id: chord.id,
			octaveOffset: value
		})
	}

	const setInversion = (value) => {
		$progression.updateChord({
			id: chord.id,
			inversion: value
		})
	}

	const setVoicing = (value) => {
		$progression.updateChord({
			id: chord.id,
			voicing: value
		})
	}

	const setMinVelocity = (value) => {
		$progression.updateChord({
			id: chord.id,
			minVelocity: value
		})
	}

	const setMaxVelocity = (value) => {
		$progression.updateChord({
			id: chord.id,
			maxVelocity: value
		})
	}

	const removeChord = () => {
		$progression.removeChord(chord.id)
	}

	const playChord = () => {
		$output.playChord(chord)
	}

	const stopChord = () => {
		$output.stopChord(chord)
	}

	return {
		state: chord,
		setOctaveOffset,
		setInversion,
		setVoicing,
		setMinVelocity,
		setMaxVelocity,
		removeChord,
		playChord,
		stopChord
	}
}

$progression.toMidi = () => {
	const fileName = `chords-${Date.now()}.mid`
	createAndDownloadMidi($progression.state, fileName)
}

import MidiWriter from 'midi-writer-js'
import { Interval, Note, Scale } from 'tonal'
import { getChordNotes } from '#/modules/playInstrument'
import { $output } from './$output'

export const createAndDownloadMidi = (progression: CustomChordT[], fileName: string = 'progression.mid') => {
	let previousTicks = 0
	const TICKS_PER_BEAT = 128
	const track = new MidiWriter.Track()

	progression.forEach((chord) => {
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
