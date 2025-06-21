import { $input } from '#/stores'
import { $output } from '#/stores/$output'
import React, { useEffect } from 'react'

export const useChordKeyListener = (index, chord, targetMode) => {
	const qwertyTarget = $input.qwertyPerformTarget.use()
	const isTarget = qwertyTarget === targetMode

	useEffect(() => {
		const key = ORDERED_KEYS[index]
		if (!key) return

		const handleKeyDown = (event) => {
			if (!isTarget) return
			if (event.repeat) return // Ignore repeated key presses
			if (event.code === key) {
				$output.playChord(chord.state)
			}
		}

		const handleKeyUp = (event) => {
			if (!$input.qwertyPerformTarget.state === targetMode) return
			if (event.code === key) {
				$output.stopChord(chord.state)
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		window.addEventListener('keyup', handleKeyUp)

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
			window.removeEventListener('keyup', handleKeyUp)
		}
	}, [index])

	const qwertyKey = ORDERED_KEYS[index] || ''
	return qwertyKey.replace('Key', '').replace('Digit', '')
}

const ORDERED_KEYS = [
	'Digit1',
	'Digit2',
	'Digit3',
	'Digit4',
	'Digit5',
	'Digit6',
	'Digit7',
	'Digit8',
	'Digit9',
	'Digit0',
	'KeyQ',
	'KeyW',
	'KeyE',
	'KeyR',
	'KeyT',
	'KeyY',
	'KeyU',
	'KeyI',
	'KeyO',
	'KeyP',
	'KeyA',
	'KeyS',
	'KeyD',
	'KeyF',
	'KeyG',
	'KeyH',
	'KeyJ',
	'KeyK',
	'KeyL',
	'KeyZ',
	'KeyX',
	'KeyC',
	'KeyV',
	'KeyB',
	'KeyN',
	'KeyM'
]
