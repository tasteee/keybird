import { useEffect } from 'react'
import { $output } from '#/stores/output/$output'
import { $player } from '#/stores/$player'
import { $input } from '#/stores'
import { $chords } from '#/stores/$chords'
import { $progression } from '#/stores/$progression'
import { QWERTY_CHORD_KEYS } from '#/constants'

type ChordKeyMapT = Record<string, string> // { 'Digit1': 'chord-uuid', ... }

// Define the optimal key layout for chord playing
// Top row: 10 chords (1-0)
// QWERTY row: 10 chords (Q-P)
// ASDF row: 9 chords (A-L)
// ZXCV row: 7 chords (Z-M)
// Total: 36 chords accessible via keyboard

type UseGlobalChordKeyboardT = {
	isEnabled: boolean
	chordKeyMap: ChordKeyMapT
	targetMode: 'chords' | 'progression'
}

const createChordKeyMap = (chords: ChordT[]): ChordKeyMapT => {
	const chordKeyMap: ChordKeyMapT = {}

	// Map the first 36 chords to keyboard keys
	const availableChords = chords.slice(0, QWERTY_CHORD_KEYS.length)

	availableChords.forEach((chord, index) => {
		const key = QWERTY_CHORD_KEYS[index]
		if (key) {
			chordKeyMap[key] = chord.id
		}
	})

	return chordKeyMap
}

const createProgressionKeyMap = (steps: ChordT[]): ChordKeyMapT => {
	const progressionKeyMap: ChordKeyMapT = {}

	// Map progression chords to first few keys
	const availableSteps = steps.slice(0, QWERTY_CHORD_KEYS.length)

	availableSteps.forEach((step, index) => {
		const key = QWERTY_CHORD_KEYS[index]
		if (key) {
			progressionKeyMap[key] = step.id
		}
	})

	return progressionKeyMap
}

export const useGlobalChordKeyboard = (props: UseGlobalChordKeyboardT) => {
	const { isEnabled, chordKeyMap, targetMode } = props

	useEffect(() => {
		if (!isEnabled) return

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.repeat) return
			// Ignore if user is typing in an input field
			const target = event.target as HTMLElement
			const isInputElement = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true'

			if (isInputElement) return
			if (event.repeat) return // Ignore key repeats

			const chordId = chordKeyMap[event.code]
			if (!chordId) return

			let chord: ChordT | null = null

			if (targetMode === 'chords') {
				chord = $chords.getChord(chordId)
			} else if (targetMode === 'progression') {
				chord = $progression.steps.find((step) => step.id === chordId) || null
			}

			if (!chord) return

			// Just play the chord, let it fade out naturally
			$player.play(chord)
		}

		window.addEventListener('keydown', handleKeyDown)

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [isEnabled, chordKeyMap, targetMode])
}

// Helper hook to create and manage chord key mapping automatically
export const useAutoChordKeyboard = () => {
	const qwertyTarget = $input.qwertyPerformTarget
	const chords = $chords.chords
	const progressionSteps = $progression.steps

	const chordKeyMap = qwertyTarget === 'chords' ? createChordKeyMap(chords) : createProgressionKeyMap(progressionSteps)

	const isEnabled = qwertyTarget === 'chords' || qwertyTarget === 'progression'

	useGlobalChordKeyboard({
		isEnabled,
		chordKeyMap,
		targetMode: qwertyTarget as 'chords' | 'progression'
	})

	return {
		chordKeyMap,
		getKeyForChord: (chordId: string) => {
			const keyEntry = Object.entries(chordKeyMap).find(([, id]) => id === chordId)
			return keyEntry?.[0]
		},
		getDisplayKey: (keyCode: string) => {
			return keyCode.replace('Key', '').replace('Digit', '')
		}
	}
}

export { QWERTY_CHORD_KEYS, createChordKeyMap, createProgressionKeyMap }

export const useQwertyChordTriggers = () => {
	useEffect(() => {}, [])
}
