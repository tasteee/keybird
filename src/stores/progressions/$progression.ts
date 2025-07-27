// import { action, makeAutoObservable, observable } from 'mobx'
// import MidiWriter from 'midi-writer-js'
// import { Note } from 'tonal'
// import { applyPatternToChord } from '#/modules/patterns/apply'
// import { $project } from '../$project'
// import { $patternEditor } from '#/views/patterns/patternEditor.store'
// import { useChord } from './useChord'
// import { $output } from '../$output'
// import { midi } from '#/modules/midi'
// import { getChordNotes, performChord } from '#/modules/playInstrument'
// // import store from 'store'

// // const cloneChord = (chord: ChordT): ChordT => {
// // 	return { ...chord, id: crypto.randomUUID() }
// // }

// // const savedProgression = store.get('progression') || []

// class ProgressionStore {
// 	@observable accessor chords: ChordT[] = []

// 	@action stopLoop = () => {
// 		console.log('stopping....')
// 	}

// 	@action updateChord = (updates: Partial<ChordT>) => {
// 		const updatedChords = this.chords.map((chord) => {
// 			if (chord.id !== updates.id) return chord
// 			const updated = { ...chord, ...updates }
// 			updated.notes = getChordNotes(updated)
// 			return updated
// 		})

// 		this.chords = updatedChords
// 	}

// 	@action deleteChord = (id: string) => {
// 		const filtered = this.chords.filter((chord) => chord.id !== id)
// 		this.chords = filtered
// 	}

// 	@action updateChordDuration = (id: string, durationBeats: number) => {
// 		const updatedChords = this.chords.map((chord) => {
// 			if (chord.id === id) return { ...chord, durationBeats }
// 			return chord
// 		})

// 		this.chords = updatedChords
// 	}

// 	@action moveChordLeft = (id: string) => {
// 		const chords = this.chords
// 		const newChords = [...chords]
// 		const index = chords.findIndex((chord) => chord.id === id)
// 		const nextIndex = index - 1
// 		const nextItem = chords[nextIndex]
// 		const targetItem = chords[index]

// 		newChords[index] = nextItem
// 		newChords[nextIndex] = targetItem
// 		this.chords = newChords
// 	}

// 	@action moveChordRight = (id: string) => {
// 		const chords = this.chords
// 		const newChords = [...chords]
// 		const index = chords.findIndex((chord) => chord.id === id)
// 		const nextIndex = index + 1
// 		const nextItem = chords[nextIndex]
// 		const targetItem = chords[index]

// 		newChords[index] = nextItem
// 		newChords[nextIndex] = targetItem
// 		this.chords = newChords
// 	}

// 	@action addChord = (chord: ChordT) => {
// 		// this.chords = [...this.chords, cloneChord(chord)]
// 	}

// 	@action removeChord = (id: string) => {
// 		const filtered = this.chords.filter((chord) => chord.id !== id)
// 		this.chords = filtered
// 	}

// 	// getFinalPerformanceNotes = (performances: PerformedNoteT[][]) => {
// 	// 	// Convert relative timing to absolute timing
// 	// 	const absolutePerformances: PerformedNoteT[][] = []
// 	// 	let cumulativeStartTicks = 0
// 	// 	let cumulativeStartMs = 0

// 	// 	for (let chordIndex = 0; chordIndex < performances.length; chordIndex++) {
// 	// 		const chordNotes = performances[chordIndex]

// 	// 		// Find the maximum end time for this chord to know when the next chord starts
// 	// 		let maxEndTicks = 0
// 	// 		let maxEndMs = 0

// 	// 		// First pass: find the chord duration
// 	// 		for (const note of chordNotes) {
// 	// 			maxEndTicks = Math.max(maxEndTicks, note.endTicks)
// 	// 			maxEndMs = Math.max(maxEndMs, note.endMs)
// 	// 		}

// 	// 		// Second pass: create notes with absolute timing
// 	// 		const absoluteChordNotes: PerformedNoteT[] = chordNotes.map((note) => ({
// 	// 			...note,
// 	// 			absoluteStartTicks: cumulativeStartTicks + note.startTicks,
// 	// 			absoluteEndTicks: cumulativeStartTicks + note.endTicks,
// 	// 			absoluteStartMs: cumulativeStartMs + note.startMs,
// 	// 			absoluteEndMs: cumulativeStartMs + note.endMs
// 	// 		}))

// 	// 		absolutePerformances.push(absoluteChordNotes)

// 	// 		// Update cumulative timing for next chord
// 	// 		cumulativeStartTicks += maxEndTicks
// 	// 		cumulativeStartMs += maxEndMs
// 	// 	}

// 	// 	return absolutePerformances.flat()
// 	// }

// 	// playLoop = () => {
// 	// 	const performances: PerformedNoteT[][] = this.chords.map((chord) => {
// 	// 		return applyPatternToChord({
// 	// 			chord,
// 	// 			project: $project,
// 	// 			strategy: 'cycling',
// 	// 			toneMap: $patternEditor.signalRows
// 	// 		})
// 	// 	})

// 	// 	const absolutePerformances = this.getFinalPerformanceNotes(performances)
// 	// 	console.log('Absolute Performances:', absolutePerformances)

// 	// 	const outputType = $output.outputType
// 	// 	const output = $output.midiOutput
// 	// 	const isMidi = outputType === 'midi'

// 	// 	console.log({ isMidi, outputType, output })

// 	// 	if (!isMidi) {
// 	// 		performChord(absolutePerformances)
// 	// 		// absolutePerformances.forEach((note) => {
// 	// 		// 	output.playNote(note.note, {
// 	// 		// 		time: note.absoluteStartMs,
// 	// 		// 		duration: note.absoluteEndMs - note.absoluteStartMs,
// 	// 		// 		rawAttack: note.velocity
// 	// 		// 	})
// 	// 		// })
// 	// 	}

// 	// 	// performances[0] is an array of the performance pattern applied to the
// 	// 	// first chord in the progression, performances[1] for the second chord, etc.
// 	// 	// each performance note has timing (startTicks, endTicks), velocity, note
// 	// 	// and everything needed to produce midi. (and startMs, endMs for timing too...)

// 	// 	// please help me now take progressions array and turn it into a a midi format
// 	// 	// that I can then either (1) play through a midi output using WebMidi or (2)
// 	// 	// download as a midi file.

// 	// 	console.log({ performances })
// 	// }

// 	// save = () => {
// 	// 	store.set('progression', this.chords)
// 	// }

// 	// toMidi = () => {
// 	// 	const fileName = `chords-${Date.now()}.mid`
// 	// 	this.createAndDownloadMidi(this.chords, fileName)
// 	// }

// 	useChord = useChord

// 	// createAndDownloadMidi = (progression: ChordT[], fileName: string = 'progression.mid') => {
// 	// 	let previousTicks = 0
// 	// 	const TICKS_PER_BEAT = 128
// 	// 	const track = new MidiWriter.Track()

// 	// 	progression.forEach((chord) => {
// 	// 		const midiNotes = chord.notes.map(Note.midi)
// 	// 		const durationTicks = chord.durationBeats * TICKS_PER_BEAT

// 	// 		const noteEvent = new MidiWriter.NoteEvent({
// 	// 			pitch: midiNotes,
// 	// 			duration: `T${durationTicks}`, // Duration in ticks
// 	// 			velocity: Math.min(127, Math.max(0, chord.maxVelocity)) // Clamp velocity to 0-127 range
// 	// 		})

// 	// 		previousTicks += durationTicks // Update the wait time for the next note
// 	// 		track.addEvent(noteEvent)
// 	// 	})

// 	// 	// 4. Generate the MIDI file
// 	// 	const writer = new MidiWriter.Writer(track)
// 	// 	const dataUri = writer.dataUri()

// 	// 	// 5. Trigger the download
// 	// 	const link = document.createElement('a')
// 	// 	link.href = dataUri
// 	// 	link.download = fileName.endsWith('.mid') ? fileName : `${fileName}.mid`
// 	// 	document.body.appendChild(link)
// 	// 	link.click()
// 	// 	document.body.removeChild(link)
// 	// }
// }

// export const $progression = new ProgressionStore()

// export const createAndDownloadMidi = (progression: ChordT[], fileName: string = 'progression.mid') => {
// 	$progression.createAndDownloadMidi(progression, fileName)
// }
