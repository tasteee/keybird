// datass.ts

import { useSyncExternalStore, useMemo } from 'react'

// A simple deep clone for initial state, so reset() works with objects/arrays.
const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))

// A simple, immutable deep-setter for object.set.lookup
const setIn = (obj: any, path: string, value: any): any => {
	const keys = path.split('.')
	const newObj = Array.isArray(obj) ? [...obj] : { ...obj }
	let current: any = newObj

	for (let i = 0; i < keys.length - 1; i++) {
		const key = keys[i]
		// Create a new object/array at the path if it doesn't exist
		const nextIsNum = !isNaN(parseInt(keys[i + 1], 10))
		current[key] = { ...(current[key] || (nextIsNum ? [] : {})) }
		current = current[key]
	}

	current[keys[keys.length - 1]] = value
	return newObj
}

// A simple deep-getter for object.use.lookup
const getIn = (obj: any, path: string): any => {
	return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj)
}

// --- Core Store Abstraction ---

// This is the internal, generic store that powers everything.
function _createStore<T>(initialState: T) {
	const originalState = deepClone(initialState)
	let state = initialState
	const listeners = new Set<() => void>()

	const getState = () => state

	const setState = (nextState: T | ((prevState: T) => T)) => {
		const resolvedNextState = typeof nextState === 'function' ? (nextState as (prevState: T) => T)(state) : nextState

		// Object.is is a performant way to check for equality.
		if (Object.is(state, resolvedNextState)) {
			return
		}
		state = resolvedNextState
		listeners.forEach((listener) => listener())
	}

	const subscribe = (listener: () => void) => {
		listeners.add(listener)
		return () => listeners.delete(listener)
	}

	const reset = () => {
		setState(originalState)
	}

	return {
		getState,
		setState,
		subscribe,
		reset
	}
}

// --- The 'datass' Public API ---

export const datass = {
	/**
	 * Creates a store for a number value.
	 */
	number(initialValue: number) {
		const store = _createStore(initialValue)

		const set = (newValue: number) => store.setState(newValue)
		set.add = (value: number) => store.setState((prev) => prev + value)
		set.subtract = (value: number) => store.setState((prev) => prev - value)
		set.reset = () => store.reset()

		const use = <S = number>(selector?: (state: number) => S) => {
			const select = selector || ((s: number) => s as unknown as S)
			return useSyncExternalStore(store.subscribe, () => select(store.getState()))
		}

		return {
			get state() {
				return store.getState()
			},
			set,
			use
		}
	},

	/**
	 * Creates a store for a string value.
	 */
	string(initialValue: string) {
		const store = _createStore(initialValue)

		const set = (newValue: string) => store.setState(newValue)
		set.reset = () => store.reset()

		const use = <S = string>(selector?: (state: string) => S) => {
			const select = selector || ((s: string) => s as unknown as S)
			return useSyncExternalStore(store.subscribe, () => select(store.getState()))
		}

		return {
			get state() {
				return store.getState()
			},
			set,
			use
		}
	},

	/**
	 * Creates a store for a boolean value.
	 */
	boolean(initialValue: boolean) {
		const store = _createStore(initialValue)

		const set = (newValue: boolean) => store.setState(newValue)
		set.reset = () => store.reset()

		const toggle = () => store.setState((prev) => !prev)

		const use = <S = boolean>(selector?: (state: boolean) => S) => {
			const select = selector || ((s: boolean) => s as unknown as S)
			return useSyncExternalStore(store.subscribe, () => select(store.getState()))
		}

		return {
			get state() {
				return store.getState()
			},
			set,
			toggle,
			use
		}
	},

	/**
	 * Creates a store for an array value.
	 */
	array<T>(initialValue: T[]) {
		const store = _createStore(initialValue)

		const set = (newValue: T[]) => store.setState(newValue)
		set.append = (...items: T[]) => store.setState((prev) => [...prev, ...items])
		set.prepend = (...items: T[]) => store.setState((prev) => [...items, ...prev])
		set.reset = () => store.reset()

		const use = <S = T[]>(selector?: (state: T[]) => S) => {
			const select = selector || ((s: T[]) => s as unknown as S)
			return useSyncExternalStore(store.subscribe, () => select(store.getState()))
		}

		// Performance: useMemo ensures that derived arrays/values from filter/map
		// maintain referential stability if the source array hasn't changed.
		use.find = (predicate: (value: T, index: number, obj: T[]) => boolean) => {
			return use((state) => state.find(predicate))
		}
		use.filter = (predicate: (value: T, index: number, obj: T[]) => boolean) => {
			const state = use()
			return useMemo(() => state.filter(predicate), [state])
		}
		use.map = <U>(callbackfn: (value: T, index: number, array: T[]) => U) => {
			const state = use()
			return useMemo(() => state.map(callbackfn), [state])
		}

		return {
			get state() {
				return store.getState()
			},
			set,
			use
		}
	},

	/**
	 * Creates a store for an object value.
	 */
	object<T extends object>(initialValue: T) {
		const store = _createStore(initialValue)

		// Merge by default
		const set = (newValue: Partial<T>) => store.setState((prev) => ({ ...prev, ...newValue }))
		set.replace = (newValue: T) => store.setState(newValue)
		set.lookup = (path: string, value: any) => store.setState((prev) => setIn(prev, path, value))
		set.reset = () => store.reset()

		const use = <S = T>(selector?: (state: T) => S) => {
			const select = selector || ((s: T) => s as unknown as S)
			return useSyncExternalStore(store.subscribe, () => select(store.getState()))
		}

		use.lookup = (path: string) => {
			return use((state) => getIn(state, path))
		}

		return {
			get state() {
				return store.getState()
			},
			set,
			use
		}
	}
}
