import { datass } from 'datass'
import { useEffect } from 'react'

export const $keysPressed = datass.object({
	shift: false,
	control: false,
	alt: false,
	command: false,
	meta: false,
	capsLock: false,
	tab: false,
	escape: false,
	enter: false,
	backspace: false,
	delete: false,
	arrowUp: false,
	arrowDown: false,
	arrowLeft: false,
	arrowRight: false,
	space: false,
	digit1: false,
	digit2: false,
	digit3: false,
	digit4: false,
	digit5: false,
	digit6: false,
	digit7: false,
	digit8: false,
	digit9: false,
	digit0: false
})

const setKeyPressed = (key: string) => {
	return (value: boolean) => {
		const normalizedKey = getNormalizedKey(key)
		if (normalizedKey) $keysPressed.set.lookup(key, value)
	}
}

type KeyComboHandlerOptionsT = {
	keys: string[]
	handle: () => void
}

// add support for helper presets
// #ANY_ARROW_KEY, #ANY_DIGIT_KEY,
// #ANY_MODIFIER_KEY (shift, control, alt, command, meta)
// #ANY_SYMBOL_KEY (like 'a', 'b', 'c', etc)
// #ANY_LETTER_KEY (like 'A', 'B', 'C', etc)
// #ANY_WASD_KEY (like 'w', 'a', 's', 'd')
const PRESET_KEYS = {
	'#ANY_ARROW_KEY': ['arrowUp', 'arrowDown', 'arrowLeft', 'arrowRight'],
	'#ANY_DIGIT_KEY': ['digit1', 'digit2', 'digit3', 'digit4', 'digit5', 'digit6', 'digit7', 'digit8', 'digit9', 'digit0'],
	'#ANY_MODIFIER_KEY': ['shift', 'control', 'alt', 'command', 'meta'],
	'#ANY_SYMBOL_KEY': [
		'a',
		'b',
		'c',
		'd',
		'e',
		'f',
		'g',
		'h',
		'i',
		'j',
		'k',
		'l',
		'm',
		'n',
		'o',
		'p',
		'q',
		'r',
		's',
		't',
		'u',
		'v',
		'w',
		'x',
		'y',
		'z'
	],
	'#ANY_LETTER_KEY': [
		'A',
		'B',
		'C',
		'D',
		'E',
		'F',
		'G',
		'H',
		'I',
		'J',
		'K',
		'L',
		'M',
		'N',
		'O',
		'P',
		'Q',
		'R',
		'S',
		'T',
		'U',
		'V',
		'W',
		'X',
		'Y',
		'Z'
	],
	'#ANY_WASD_KEY': ['w', 'a', 's', 'd']
}

export const useKeyComboHandler = (options: KeyComboHandlerOptionsT) => {
	const didPass = $keysPressed.use((state) => {
		if (!state) return false
		if (!options || !options.keys || !options.handle) return false

		for (const key in options.keys) {
			if (!state[key]) return false
		}

		return true
	})

	useEffect(() => {
		if (didPass) options.handle()
	}, [didPass, options.handle, options.keys])
}

const getNormalizedKey = (key: string) => {
	if (key === ' ') return 'space'
	return key.charAt(0).toLowerCase() + key.slice(1)
}

window.addEventListener('keydown', (event) => {
	if (event.repeat) return
	setKeyPressed(event.key)(true)
})

window.addEventListener('keyup', (event) => {
	setKeyPressed(event.key)(false)
})
