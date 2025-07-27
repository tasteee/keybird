import { useState, useEffect } from 'react'

export function useWait(ms: number) {
	const [shouldContinue, setShouldContinue] = useState(false)

	useEffect(() => {
		if (ms <= 0) setShouldContinue(true)
		setShouldContinue(false)
		const timer = setTimeout(() => setShouldContinue(true), ms)
		return () => clearTimeout(timer)
	}, [ms])

	return shouldContinue
}
