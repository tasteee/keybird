import { motion } from 'motion/react'
import React, { useState } from 'react'
import { Reorder } from 'motion/react'

export const TimingWrapper = ({ chord, beatWidth, totalBeats, onChange, children, value }) => {
	const [duration, setDuration] = useState(chord.durationBeats || 4)
	const [start, setStart] = useState(chord.start || 0)

	// Drag left or right handle
	const handleDrag = (side) => (event, info) => {
		const deltaBeats = Math.round(info.delta.x / beatWidth)

		let newStart = start
		let newDuration = duration

		if (side === 'left') {
			newStart = Math.max(0, Math.min(start + duration - 1, start + deltaBeats))
			newDuration = duration + (start - newStart)
		} else {
			newDuration = Math.max(1, duration + deltaBeats)
			if (newStart + newDuration > totalBeats) {
				newDuration = totalBeats - newStart
			}
		}

		setStart(newStart)
		setDuration(newDuration)
		onChange?.(chord.id, newDuration)
	}

	const wrapperStyle = {
		width: duration * beatWidth,
		transform: `translateX(${start * beatWidth}px)`
	}

	return (
		<Reorder.Item value={value} dragListener={false} className="TimingWrapper" style={wrapperStyle}>
			{/* Left handle */}
			<motion.div className="handle left" drag="x" dragMomentum={false} onDrag={handleDrag('left')} />
			{/* Chord block */}
			<div className="chord-content">{children}</div>
			{/* Right handle */}
			<motion.div className="handle right" drag="x" dragMomentum={false} onDrag={handleDrag('right')} />
		</Reorder.Item>
	)
}
