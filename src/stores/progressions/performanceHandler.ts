import { WebMidi, Output } from 'webmidi'
import { Note } from 'tonal'
import MidiWriter from 'midi-writer-js'

type PerformedNoteT = {
	rowId: string
	signalId: string
	note: string | null
	startDivision: number
	endDivision: number
	startTicks: number
	endTicks: number
	velocity: number
	startMs: number
	endMs: number
}

interface MidiPlaybackOptions {
	output?: Output
	tempo?: number // BPM
	channel?: number
}

interface MidiExportOptions {
	tempo?: number // BPM
	timeSignature?: [number, number]
	keySignature?: string
}

class MidiPerformanceHandler {
	private scheduledNotes: Set<string> = new Set()
	private isPlaying = false

	constructor() {
		// Initialize WebMidi if not already done
		if (!WebMidi.enabled) {
			WebMidi.enable()
				.then(() => console.log('WebMidi enabled'))
				.catch((err) => console.error('WebMidi could not be enabled:', err))
		}
	}

	/**
	 * Play performances through WebMidi output
	 */
	async playPerformances(performances: PerformedNoteT[][], options: MidiPlaybackOptions = {}): Promise<void> {
		const { output = WebMidi.outputs[0], tempo = 120, channel = 1 } = options

		if (!output) {
			throw new Error('No MIDI output available')
		}

		this.stopPlayback() // Stop any existing playback
		this.isPlaying = true

		// Flatten all performances into a single timeline
		const allNotes = this.flattenPerformances(performances)

		// Sort by start time
		allNotes.sort((a, b) => a.startMs - b.startMs)

		const startTime = performance.now()

		for (const note of allNotes) {
			if (!this.isPlaying) break
			if (!note.note) continue

			const noteId = `${note.signalId}-${note.startMs}`

			// Schedule note on
			setTimeout(() => {
				if (!this.isPlaying) return

				try {
					const midiNote = this.noteToMidiNumber(note.note!)
					output.playNote(midiNote, {
						channel,
						velocity: note.velocity / 127, // Normalize velocity
						duration: note.endMs - note.startMs
					})

					this.scheduledNotes.add(noteId)
				} catch (error) {
					console.warn(`Failed to play note ${note.note}:`, error)
				}
			}, note.startMs)
		}

		// Schedule stop after the last note ends
		const lastNote = allNotes[allNotes.length - 1]
		if (lastNote) {
			setTimeout(() => {
				this.isPlaying = false
				this.scheduledNotes.clear()
			}, lastNote.endMs + 100) // Add small buffer
		}
	}

	/**
	 * Stop current playback
	 */
	stopPlayback(): void {
		this.isPlaying = false
		this.scheduledNotes.clear()

		// Stop all notes on all channels (panic button)
		WebMidi.outputs.forEach((output) => {
			for (let channel = 1; channel <= 16; channel++) {
				try {
					output.sendAllNotesOff({ channel })
				} catch (error) {
					// Ignore errors for unavailable channels
				}
			}
		})
	}

	/**
	 * Export performances as MIDI file
	 */
	exportToMidiFile(performances: PerformedNoteT[][], options: MidiExportOptions = {}): Uint8Array {
		const { tempo = 120, timeSignature = [4, 4], keySignature = 'C' } = options

		// Create a new MIDI track
		const track = new MidiWriter.Track()

		// Set track properties
		track.setTempo(tempo)
		track.setTimeSignature(...timeSignature)
		track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }))

		// Flatten all performances
		const allNotes = this.flattenPerformances(performances)

		// Sort by start time
		allNotes.sort((a, b) => a.startTicks - b.startTicks)

		// Convert to MIDI events
		let currentTicks = 0

		for (const note of allNotes) {
			if (!note.note) continue

			try {
				// Calculate timing
				const startTicks = note.startTicks
				const duration = note.endTicks - note.startTicks
				const waitTicks = Math.max(0, startTicks - currentTicks)

				// Add note event
				const noteEvent = new MidiWriter.NoteEvent({
					pitch: note.note,
					duration: this.ticksToMidiDuration(duration),
					velocity: Math.round(note.velocity),
					wait: this.ticksToMidiDuration(waitTicks)
				})

				track.addEvent(noteEvent)
				currentTicks = startTicks + duration
			} catch (error) {
				console.warn(`Failed to add note ${note.note} to MIDI:`, error)
			}
		}

		// Create and write MIDI file
		const writer = new MidiWriter.Writer(track)
		return writer.buildFile()
	}

	/**
	 * Download MIDI file
	 */
	downloadMidiFile(
		performances: PerformedNoteT[][],
		filename: string = 'performance.mid',
		options: MidiExportOptions = {}
	): void {
		const midiData = this.exportToMidiFile(performances, options)

		const blob = new Blob([midiData], { type: 'audio/midi' })
		const url = URL.createObjectURL(blob)

		const link = document.createElement('a')
		link.href = url
		link.download = filename
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)

		URL.revokeObjectURL(url)
	}

	/**
	 * Get available MIDI outputs
	 */
	getAvailableOutputs(): Output[] {
		return WebMidi.outputs
	}

	private flattenPerformances(performances: PerformedNoteT[][]): PerformedNoteT[] {
		return performances.flat()
	}

	private noteToMidiNumber(noteName: string): number {
		try {
			const note = Note.get(noteName)
			if (!note.midi) {
				throw new Error(`Invalid note: ${noteName}`)
			}
			return note.midi
		} catch (error) {
			// Fallback: try to parse manually
			console.warn(`Tonal failed to parse note ${noteName}, trying fallback`)
			return this.parseNoteManually(noteName)
		}
	}

	private parseNoteManually(noteName: string): number {
		// Basic manual parsing as fallback
		const notePattern = /^([A-G][#b]?)(\d+)$/
		const match = noteName.match(notePattern)

		if (!match) {
			throw new Error(`Cannot parse note: ${noteName}`)
		}

		const [, note, octave] = match
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

		const noteNumber = noteMap[note]
		if (noteNumber === undefined) {
			throw new Error(`Unknown note: ${note}`)
		}

		return (parseInt(octave) + 1) * 12 + noteNumber
	}

	private ticksToMidiDuration(ticks: number): string {
		// Convert ticks to MIDI duration string
		// This is a simplified conversion - you may need to adjust based on your tick resolution
		if (ticks >= 1920) return '1' // Whole note
		if (ticks >= 960) return '2' // Half note
		if (ticks >= 480) return '4' // Quarter note
		if (ticks >= 240) return '8' // Eighth note
		if (ticks >= 120) return '16' // Sixteenth note
		return '32' // Thirty-second note
	}
}

// Usage in your playLoop function:
$progression.playLoop = async () => {
	const performances: PerformedNoteT[][] = $progression.state.map((chord) => {
		return applyPatternToChord({
			chord,
			project: $project.state,
			strategy: 'cycling',
			signalRows: $patternEditor.getSignalRows()
		})
	})

	console.log({ performances })

	const midiHandler = new MidiPerformanceHandler()

	try {
		// Option 1: Play through MIDI output
		const outputs = midiHandler.getAvailableOutputs()
		if (outputs.length > 0) {
			console.log(
				'Available MIDI outputs:',
				outputs.map((o) => o.name)
			)

			await midiHandler.playPerformances(performances, {
				output: outputs[0], // Use first available output
				tempo: 120,
				channel: 1
			})
		} else {
			console.log('No MIDI outputs available')
		}

		// Option 2: Download as MIDI file
		midiHandler.downloadMidiFile(performances, 'my-progression.mid', {
			tempo: 120,
			timeSignature: [4, 4]
		})
	} catch (error) {
		console.error('MIDI error:', error)
	}
}

export { MidiPerformanceHandler, type MidiPlaybackOptions, type MidiExportOptions }
