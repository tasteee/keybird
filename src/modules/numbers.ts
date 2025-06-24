export const numberify = (target: string | number): number => {
	if (typeof target === 'number') return target

	if (typeof target === 'string') {
		const parsed = parseFloat(target)
		return isNaN(parsed) ? 0 : parsed
	}

	return 0
}
