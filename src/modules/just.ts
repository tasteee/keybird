import justDebounce from 'just-debounce-it'
import justCurry from 'just-curry-it'
import justThrottle from 'just-throttle'

// const debouce = createDebouncer(50)
// debounce(() => console.log('hello'))
const createDebouncer = (delay: number) => {
	return (fn: (...args: any[]) => void) => {
		return justDebounce(fn, delay)
	}
}

// const throttle = createThrottler(50)
// throttle(() => console.log('hello'))
const createThrottler = (delay: number) => {
	return (fn: (...args: any[]) => void) => {
		return justThrottle(fn, delay)
	}
}

// debounce(50, () => console.log('hello'))
const debounce = (delay: number, fn: (...args: any[]) => void) => {
	return justDebounce(fn, delay)
}

// throttle(50, () => console.log('hello'))
const throttle = (delay: number, fn: (...args: any[]) => void) => {
	return justThrottle(fn, delay)
}

export const just = {
	createDebouncer,
	createThrottler,
	debounce,
	throttle
}
