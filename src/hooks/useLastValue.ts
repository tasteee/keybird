import { useRef, useEffect, useMemo } from 'react'

export const useLastValue = <T>(value: T) => {
	const lastValueRef = useRef<T | undefined>(value)

	return useMemo(() => {
		const lastValue = lastValueRef.current
		lastValueRef.current = value // Update the ref with the current value
		return lastValue // Return the previous value
	}, [value]) // Run whenever the value changes
}
