import { observer } from 'mobx-react-lite'
import { midiEngine } from '#/modules/midiEngine'
import { $pattern } from '#/stores/$pattern'
import { $progression } from '#/stores'
import { DEFAULT_BPM } from '#/constants/state'
import { useEffect, useState } from 'react'

type PlaybackMarkerPatternPropsT = {
	containerWidth: number
}

export const PlaybackMarkerPattern = observer((props: PlaybackMarkerPatternPropsT) => {
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

	// Convert current time to beats
	const msPerBeat = 60000 / DEFAULT_BPM
	const currentBeats = currentTimeMs / msPerBeat

	// Calculate position within the pattern by taking modulo of the pattern length
	const patternLengthBeats = $pattern.lengthBeats
	const positionInPatternBeats = currentBeats % patternLengthBeats

	// Calculate pixel position based on pattern length
	const beatWidth = 32 // pixels per beat (from PATTERN_GRID.BEAT_WIDTH)
	const leftPosition = positionInPatternBeats * beatWidth

	const markerStyle = {
		position: 'absolute' as const,
		left: `${leftPosition}px`,
		top: '0px',
		bottom: '0px',
		width: '2px',
		backgroundColor: '#ffffff',
		zIndex: 1000,
		pointerEvents: 'none' as const,
		boxShadow: '0 0 4px rgba(255, 255, 255, 0.5)'
	}

	return <div style={markerStyle} className="PlaybackMarkerPattern" />
})
