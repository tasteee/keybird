import { $output } from '#/stores/$output'

const DEFAULT_INSTRUMENT_NAME = 'acoustic_grand_piano'
const nodes = {}

export const performChord = (notes) => {
	const name = $output.state.selectedInstrumentName
	const instrument = $output.state.loadedInstruments[name]
	const audioContext = $output.state.audioContext

	notes.forEach((n) => {
		const { note, velocity, absoluteStartMs, absoluteEndMs, ...options } = n
		const duration = (absoluteEndMs - absoluteStartMs) / 1000 // Convert ms to seconds
		const time = audioContext.currentTime + absoluteStartMs / 1000 // Convert ms to seconds
		const attack = 0
		nodes[n] = instrument.play(note, time, { duration, attack, loop: true })
	})
}

const playInstrument = (instrumentName = DEFAULT_INSTRUMENT_NAME) => {
	const name = instrumentName || $output.state.selectedInstrumentName
	const instrument = $output.state.loadedInstruments[name]
	const audioContext = $output.state.audioContext
	const gain = 0.8
	const attack = 0.9

	const playNote = (note, options = {}) => {
		const _options = { gain, attack, ...options }

		if (Array.isArray(note)) {
			note.forEach((n) => {
				nodes[n] = instrument.play(n)
			})
		} else {
			nodes[note] = instrument.play(note)
		}
	}

	const stopNote = (note) => {
		if (Array.isArray(note)) {
			note.forEach((n) => {
				const node = nodes[n]
				if (node) {
					node.stop(audioContext.currentTime)
					delete nodes[n]
				}
			})
		} else {
			const node = nodes[note]
			if (node) {
				node.stop(audioContext.currentTime)
				delete nodes[note]
			}
		}
	}

	return { playNote, stopNote }
}

const createOutput = () => {
	const { isMidiConnected, midiOutput, outputType, selectedInstrumentName, isOutputEnabled } = $output.state
	const isOutputBuiltIn = outputType === 'instrument'
	const shouldError = !isOutputEnabled || (!isOutputBuiltIn && !isMidiConnected)

	if (shouldError) {
		console.error('No valid output available')
		return null
	}

	if (isOutputBuiltIn) {
		return playInstrument(selectedInstrumentName)
	}

	if (isMidiConnected && midiOutput) {
		const playNote = (note, options = {}) => {
			// Default to channel 1 if not specified
			const channel = options.channel || 1
			const midiChannel = midiOutput.channels[channel]

			if (Array.isArray(note)) {
				note.forEach((n) => {
					midiChannel.playNote(n.toUpperCase(), options)
				})
			} else {
				midiChannel.playNote(note.toUpperCase(), options)
			}
		}

		const stopNote = (note, options = {}) => {
			const channel = options.channel || 1
			const midiChannel = midiOutput.channels[channel]

			if (Array.isArray(note)) {
				note.forEach((n) => {
					midiChannel.stopNote(n.toUpperCase(), options)
				})
			} else {
				midiChannel.stopNote(note.toUpperCase(), options)
			}
		}

		return { playNote, stopNote }
	}

	return null
}

// Unified API functions
export const playNote = (note, options = {}) => {
	const output = createOutput()
	if (output) {
		output.playNote(note, options)
	}
}

export const stopNote = (note, options = {}) => {
	const output = createOutput()
	if (output) {
		output.stopNote(note, options)
	}
}

// Convenience function for playing chords
export const playChord = (chord, options = {}) => {
	const notes = getChordNotes(chord)
	console.log({ chord, notes })
	playNote(notes, options)
}

export const stopChord = (chord, options = {}) => {
	const notes = getChordNotes(chord)
	// console.log({ chord, notes })
	stopNote(notes, options)
}
import { Chord, Note, Interval } from '@tonaljs/tonal'
import { ChordType } from 'tonal'

export function applyOctaveOffset(notes: string[], offset: number): string[] {
	if (offset === 0) return notes

	return notes.map((note) => {
		const noteObj = Note.get(note)
		const currentOctave = noteObj.oct || 4
		const newOctave = currentOctave + offset
		return noteObj.pc + newOctave
	})
}

// Apply inversion to chord notes
export function applyInversion(notes: string[], inversion: number): string[] {
	if (inversion === 0 || notes.length === 0) return [...notes]

	const result = [...notes]
	const inversionsToApply = inversion % notes.length

	for (let i = 0; i < inversionsToApply; i++) {
		const bottomNote = result.shift()!
		const bottomNoteObj = Note.get(bottomNote)
		const topNote = result[result.length - 1]
		const topNoteObj = Note.get(topNote)
		const newOctave = (topNoteObj.oct || 4) + 1

		// Move the bottom note up an octave and place it at the top
		result.push(bottomNoteObj.pc + newOctave)
	}

	return result
}

// Apply voicing modifications
export function applyVoicing(notes: string[], voicing: string): string[] {
	if (!voicing || voicing.toLowerCase() === 'closed') {
		return notes
	}

	switch (voicing.toLowerCase()) {
		case 'open':
			// Spread notes across wider range - every other note goes up an octave
			return notes.map((note, index) => {
				if (index === 0) return note // Keep bass note
				if (index % 2 === 1) {
					const noteObj = Note.get(note)
					const newOctave = (noteObj.oct || 4) + 1
					return noteObj.pc + newOctave
				}
				return note
			})

		case 'drop2':
			// Drop the second highest note down an octave
			if (notes.length >= 3) {
				const result = [...notes]
				const secondHighestIndex = result.length - 2
				const note = Note.get(result[secondHighestIndex])
				const newOctave = (note.oct || 4) - 1
				result[secondHighestIndex] = note.pc + newOctave
				return result
			}
			return notes

		case 'drop3':
			// Drop the third highest note down an octave
			if (notes.length >= 4) {
				const result = [...notes]
				const thirdHighestIndex = result.length - 3
				const note = Note.get(result[thirdHighestIndex])
				const newOctave = (note.oct || 4) - 1
				result[thirdHighestIndex] = note.pc + newOctave
				return result
			}
			return notes

		case 'spread':
			// Spread each voice up by octaves
			return notes.map((note, index) => {
				const noteObj = Note.get(note)
				const newOctave = (noteObj.oct || 4) + Math.floor(index / 2)
				return noteObj.pc + newOctave
			})

		default:
			return notes
	}
}

// Apply bass note override
export function applyBassNote(notes: string[], bassNote: string): string[] {
	if (!bassNote) return notes

	// Find the octave of the lowest note to maintain register
	const lowestNote = notes.reduce((lowest, note) => {
		const lowestOct = Note.get(lowest).oct || 4
		const currentOct = Note.get(note).oct || 4
		return currentOct < lowestOct ? note : lowest
	})

	const lowestOctave = Note.get(lowestNote).oct || 4
	const bassNoteObj = Note.get(bassNote)
	const bassNoteWithOctave = bassNoteObj.pc + (lowestOctave - 1)

	return [bassNoteWithOctave, ...notes]
}

// Ensure all notes have octave numbers

// Alternative, more robust version
export function ensureOctaves(notes: string[], defaultOctave: number = 4): string[] {
	return notes.map((note) => {
		// If note already contains a number, assume it has an octave
		if (/\d/.test(note)) {
			return note
		}

		// Otherwise, add the default octave
		const noteObj = Note.get(note)
		return noteObj.pc + defaultOctave
	})
}

// Debug version to help identify the issue
export function processCustomChord(chord: CustomChordT): string[] {
	try {
		let notes: string[] = []

		// Get notes from symbol or use provided notes
		if (chord.notes.length > 0) {
			notes = [...chord.notes]
			// console.log('Using provided notes:', notes)
		} else if (chord.symbol) {
			// Use Tonal to get chord notes
			const chordData = Chord.get(chord.symbol)
			// console.log('Chord data from Tonal:', chordData)

			if (chordData.notes.length > 0) {
				// Add default octave to chord notes
				notes = chordData.notes.map((note) => note + '4')
				// console.log('Notes after adding octave 4:', notes)
			} else {
				console.warn(`Unknown chord symbol: ${chord.symbol}`)
				return []
			}
		} else {
			console.warn('No chord symbol or notes provided')
			return []
		}

		// Ensure all notes have octave numbers
		notes = ensureOctaves(notes, 4)
		// console.log('Notes after ensureOctaves:', notes)

		// Apply octave offset
		if (chord.octaveOffset !== 0) {
			notes = applyOctaveOffset(notes, chord.octaveOffset)
			// console.log('Notes after octave offset:', notes)
		}

		// Apply inversion
		if (chord.inversion > 0) {
			notes = applyInversion(notes, chord.inversion)
			// console.log('Notes after inversion:', notes)
		}

		// Apply voicing
		if (chord.voicing) {
			notes = applyVoicing(notes, chord.voicing)
			// console.log('Notes after voicing:', notes)
		}

		// Apply bass note override
		if (chord.bassNote) {
			// console.log('Applying bass note:', chord.bassNote)
			notes = applyBassNote(notes, chord.bassNote)
			// console.log('Notes after bass note:', notes)
		}

		// console.log('Final notes:', notes)
		return notes
	} catch (error) {
		console.error('Error processing chord:', error)
		return chord.notes.length > 0 ? chord.notes : []
	}
}

// Utility function to get chord notes for playback
export function getChordNotes(chord: CustomChordT): string[] {
	return processCustomChord(chord)
}

// Utility function to get chord information
export function getChordInfo(symbol: string) {
	const chordData = Chord.get(symbol)
	return {
		symbol: chordData.symbol,
		tonic: chordData.tonic,
		type: chordData.type,
		notes: chordData.notes,
		intervals: chordData.intervals,
		quality: chordData.quality as ChordType.ChordQuality
	}
}

// Example usage:
/*
const chord: CustomChordT = {
  octaveOffset: 1,
  rootNote: "C",
  symbol: "Cm7",
  degree: "vi7",
  voicing: "open",
  inversion: 1,
  durationBeats: 4,
  bassNote: "G",
  notes: [], // Will be built from symbol
  id: "chord-1",
  minVelocity: 60,
  maxVelocity: 100
}

const finalNotes = processCustomChord(chord)
console.log(finalNotes) // e.g., ['G3', 'C5', 'Eb5', 'G5', 'Bb5']

// Get chord info
console.log(getChordInfo("Cm7")) 
// { symbol: "Cm7", tonic: "C", type: "m7", notes: ["C", "Eb", "G", "Bb"], ... }
*/
