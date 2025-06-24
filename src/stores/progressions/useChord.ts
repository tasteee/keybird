import { useDatass } from 'datass'
import { useMemo } from 'react'
import { $output } from '../$output'
import { $progression } from './$progression'
import { createChord } from './createChord'
import React from 'react'
import { getChordNotes } from '#/modules/playInstrument'

type ChordHookReturnT = {
	state: CustomChordT
	setOctaveOffset: (value: number) => void
	setInversion: (value: number) => void
	setVoicing: (value: string) => void
	setMinVelocity: (value: number) => void
	setMaxVelocity: (value: number) => void
	playChord: () => void
	stopChord: () => void
}

type UseChordReturnT = ChordHookReturnT & {
	removeChord: () => void
}

type NewChordHookReturnT = ChordHookReturnT & {
	addChord: () => void
}

export const useChord = (id: string): UseChordReturnT => {
	const chord = $progression.use((chords) => {
		const found = chords.find((chord) => chord.id === id)
		return found || null
	})

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

export const useNewChord = (symbol: string, overrides: Partial<CustomChordT> = {}): NewChordHookReturnT => {
	const base = useMemo(() => createChord(symbol, overrides), [])
	const chord = useDatass.object(base)

	React.useEffect(() => {
		chord.set.lookup('notes', getChordNotes(chord.state))
	}, [chord.state.inversion, chord.state.octaveOffset, chord.state.voicing])

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
