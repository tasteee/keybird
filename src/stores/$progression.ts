import { theory } from '#/utilities/toner'
import { datass, useDatass, type PreparedArrayStoreT } from 'datass'
import { useMemo } from 'react'

const cloneChord = (chord) => {
	return { ...chord, id: crypto.randomUUID() }
}

export const createChord = (symbol: string): CustomChordT => {
	const chord = theory.getChord(symbol)
	const rootNote = chord.tonic
	const degree = '' // TonalChord does not provide this; set as empty or infer elsewhere
	const octaveOffset = 0 // Default to no transposition
	const voicing = 'closed' // TonalChord does not provide voicing; default to "closed"
	const inversion = 0 // Default to root position
	const durationBeats = 4 // Default to whole bar (4 beats)
	const bassNote = chord.bass || rootNote
	const notes = chord.notes || []

	return {
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
