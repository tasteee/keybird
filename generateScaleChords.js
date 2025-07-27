import fs from 'fs'
import { Chord, Scale } from '@tonaljs/tonal'

// Root notes from the configuration
const rootNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Scale types we want to generate
const scaleTypes = ['major', 'minor']

// Comprehensive chord types to try for each scale degree
const chordTypes = [
	// Basic triads
	'',
	'm',
	'aug',
	'dim',
	// Seventh chords
	'7',
	'maj7',
	'm7',
	'mMaj7',
	'dim7',
	'm7b5',
	// Extended chords
	'9',
	'maj9',
	'm9',
	'mMaj9',
	'add9',
	'11',
	'maj11',
	'm11',
	'mMaj11',
	'add11',
	'13',
	'maj13',
	'm13',
	'mMaj13',
	'add13',
	// Suspended chords
	'sus2',
	'sus4',
	'7sus2',
	'7sus4',
	'maj7sus2',
	'maj7sus4',
	// Sixth chords
	'6',
	'm6',
	'6/9',
	'm6/9',
	// Altered chords
	'7b5',
	'7#5',
	'7b9',
	'7#9',
	'7#11',
	'7b13',
	'maj7#11',
	'maj7b5',
	'maj7#5',
	// Complex jazz chords with parentheses notation
	'7(b9)',
	'7(#9)',
	'7(b13)',
	'7(#5)',
	'7alt',
	'm7(9)',
	'm7(11)',
	'm7(13)',
	'maj7(9)',
	'maj7(11)',
	'maj7(13)',
	'm7b5(9)',
	'm7b5(11)',
	// Other variations
	'add2',
	'add4',
	'madd2',
	'madd4',
	'madd9',
	'2',
	'4',
	'5', // power chords and simple intervals
	'aug7',
	'augmaj7'
]

// Helper function to check if chord notes are a subset of scale notes
const isChordInScale = (chordSymbol, scaleNotes) => {
	try {
		const chord = Chord.get(chordSymbol)
		if (!chord.notes || chord.notes.length === 0) return false

		// Check if all chord notes are in the scale
		return chord.notes.every((note) => scaleNotes.includes(note))
	} catch (error) {
		return false
	}
}

// Generate chords for a specific scale
const generateChordsForScale = (scaleName) => {
	try {
		const scale = Scale.get(scaleName)
		if (!scale.notes || scale.notes.length === 0) {
			console.warn(`No notes found for scale: ${scaleName}`)
			return []
		}

		const scaleNotes = scale.notes
		const chordsInScale = []

		// Try every scale degree with every chord type
		for (const scaleNote of scaleNotes) {
			for (const chordType of chordTypes) {
				const chordSymbol = `${scaleNote}${chordType}`

				if (isChordInScale(chordSymbol, scaleNotes)) {
					chordsInScale.push(chordSymbol)
				}
			}
		}

		// Add some additional common chromatic passing chords and borrowed chords
		// that are commonly used in the scale context
		const additionalChords = []

		// For minor scales, add some common borrowed chords from parallel major
		if (scaleName.includes('minor')) {
			const rootNote = scaleName.split(' ')[0]
			const parallelMajorScale = Scale.get(`${rootNote} major`)

			// Add some common borrowed major chords
			const borrowedTypes = ['', 'maj7', '7', '6']
			for (const type of borrowedTypes) {
				const borrowedChord = `${rootNote}${type}`
				if (isChordInScale(borrowedChord, parallelMajorScale.notes)) {
					additionalChords.push(borrowedChord)
				}
			}
		}

		// For major scales, add some common borrowed chords from parallel minor
		if (scaleName.includes('major')) {
			const rootNote = scaleName.split(' ')[0]
			const parallelMinorScale = Scale.get(`${rootNote} minor`)

			// Add some common borrowed minor chords
			const borrowedTypes = ['m', 'm7', 'm6']
			for (const type of borrowedTypes) {
				const borrowedChord = `${rootNote}${type}`
				if (isChordInScale(borrowedChord, parallelMinorScale.notes)) {
					additionalChords.push(borrowedChord)
				}
			}
		}

		return [...new Set([...chordsInScale, ...additionalChords])].sort()
	} catch (error) {
		console.error(`Error generating chords for ${scaleName}:`, error.message)
		return []
	}
}

// Generate all scale combinations
const generateAllScaleChords = () => {
	const allScaleChords = {}

	for (const rootNote of rootNotes) {
		for (const scaleType of scaleTypes) {
			const scaleName = `${rootNote} ${scaleType}`
			console.log(`Generating chords for: ${scaleName}`)

			const chords = generateChordsForScale(scaleName)
			allScaleChords[scaleName] = chords

			console.log(`Found ${chords.length} chords for ${scaleName}`)
		}
	}

	return allScaleChords
}

// Generate the scale chords
console.log('Starting comprehensive scale chord generation...')
const allScaleChords = generateAllScaleChords()

// Write to the scaleChords.json file
const outputPath = './src/constants/scaleChords.json'
fs.writeFileSync(outputPath, JSON.stringify(allScaleChords, null, '\t'))

console.log(`Generated scale chords for ${Object.keys(allScaleChords).length} scales`)
console.log(`Output written to: ${outputPath}`)

// Print summary
console.log('\n=== SUMMARY ===')
for (const [scaleName, chords] of Object.entries(allScaleChords)) {
	console.log(`${scaleName}: ${chords.length} chords`)
}

// Show a sample of chords for F# minor to compare with your original
console.log('\n=== F# MINOR SAMPLE ===')
console.log(allScaleChords['F# minor'].slice(0, 20).join(', '))
