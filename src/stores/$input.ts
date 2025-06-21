import { datass } from 'datass'

const pressedKeyCodes = datass.array<string>([])
const mouseY = datass.number(0)
const mouseX = datass.number(0)
const qwertyPerformTarget = datass.string('chords') // 'chords' | 'progression'

export const $input = {
	pressedKeyCodes,
	mouseX,
	qwertyPerformTarget,
	mouseY
}
