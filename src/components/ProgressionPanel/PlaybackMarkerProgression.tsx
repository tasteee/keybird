import { observer } from 'mobx-react-lite'
import { midiEngine } from '#/modules/midiEngine'
import { $progression } from '#/stores'
import { DEFAULT_BPM } from '#/constants/state'
import { useEffect, useState } from 'react'

type PlaybackMarkerProgressionPropsT = {
	containerWidth: number
	totalBeats: number
}

export const PlaybackMarkerProgression = observer((props: PlaybackMarkerProgressionPropsT) => {
	const [currentTimeMs, setCurrentTimeMs] = useState(0)

	useEffect(() => {
		const hasNoPlayback = !midiEngine.isPlaying
		if (hasNoPlayback) {
			setCurrentTimeMs(0)
			return
		}

		const updatePlaybackPosition = () => {
			const currentTotalTimeMs = midiEngine.currentTimeMs
			setCurrentTimeMs(currentTotalTimeMs)
		}

		// Update immediately
		updatePlaybackPosition()

		// Then update at regular intervals
		const intervalId = setInterval(updatePlaybackPosition, 16) // ~60fps

		return () => clearInterval(intervalId)
	}, [midiEngine.isPlaying])

	const hasNoPlayback = !midiEngine.isPlaying
	if (hasNoPlayback) return null

	// Calculate position within the progression
	const msPerBeat = 60000 / DEFAULT_BPM
	const currentBeats = currentTimeMs / msPerBeat

	// Calculate pixel position based on progression length and container width
	const minimumGridWidth = Math.max(props.totalBeats * 60, 800)
	const beatWidth = minimumGridWidth / props.totalBeats
	const leftPosition = currentBeats * beatWidth

	// Keep marker within bounds of progression
	const maxPosition = minimumGridWidth
	const clampedPosition = Math.min(leftPosition, maxPosition)

	const markerStyle = {
		position: 'absolute' as const,
		left: `${clampedPosition}px`,
		top: '0px',
		bottom: '0px',
		width: '2px',
		backgroundColor: '#ffffff',
		zIndex: 1000,
		pointerEvents: 'none' as const,
		boxShadow: '0 0 4px rgba(255, 255, 255, 0.5)'
	}

	return <div style={markerStyle} className="PlaybackMarkerProgression" />
})
