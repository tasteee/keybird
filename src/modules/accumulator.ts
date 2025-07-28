export function accumulator(fn) {
	const data = {}

	function accumulate(patch = {}) {
		const final = fn({ ...data, ...patch })
		Object.assign(data, patch)
		return final
	}

	accumulate.reset = () => {
		Object.keys(data).forEach((key) => delete data[key])
	}

	Object.defineProperty(accumulate, 'state', {
		get() {
			return { ...data }
		}
	})

	return accumulate
}
