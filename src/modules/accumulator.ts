export function accumulator(fn) {
	const data = {}

	function accumulate(patch = {}) {
		Object.assign(data, patch)
		return fn({ ...data })
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
