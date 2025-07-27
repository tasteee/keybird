import { numbers } from '#/modules/numbers'

export const clamp = (...args) => {
	const isNormalClamp = args.length === 3
	const isOptionsClamp = typeof args[0] === 'object'

	if (isNormalClamp) {
		const [min, value, max] = args as number[]
		if (value < min) return min
		if (value > max) return max
		return value
	}

	if (isOptionsClamp) {
		const { min, value, max } = args as any
		if (value < min) return min
		if (value > max) return max
		return value
	}
}

const maxDivisions = 128 * 4
clamp.StartDivision = numbers.createClamp({ min: 0, max: maxDivisions - 1 })
clamp.endDivision = numbers.createClamp({ min: 1, max: maxDivisions })
clamp.durationDivisions = numbers.createClamp({ min: 1, max: 127 })
