import { Flex } from '#/components/common/Flex'
import { Icon } from '#/components/common/Icon'
import { useHotkeys } from '#/modules/hooks'
import { $progression } from '#/stores'
import { $output } from '#/stores/output/$output'
import { $pattern } from '#/stores/$pattern'
import { Text } from '@radix-ui/themes'
import { observer } from 'mobx-react-lite'
import { useState, useMemo, useEffect, useRef } from 'react'
import { PlaybackMarkerProgression } from './PlaybackMarkerProgression'

type PropsT = {
	ref: React.RefObject<HTMLDivElement>
	renderChords: (gridWidth: number, beatsToShow: number) => JSX.Element[]
}

export const InnerProgressionGrid = observer((props: PropsT) => {
	const [canScrollLeft, setCanScrollLeft] = useState(false)
	const [canScrollRight, setCanScrollRight] = useState(false)
	const scrollContainerRef = useRef<HTMLDivElement>(null)
	const totalBeats = $progression.totalBeats

	// Use fixed beat width for consistent visual spacing
	const FIXED_BEAT_WIDTH = 60 // pixels per beat - this never changes

	// Calculate grid width based on beats to show (minimum 32 for visual consistency)
	const beatsToShow = Math.max(totalBeats, 32)
	const calculatedGridWidth = beatsToShow * FIXED_BEAT_WIDTH

	// Get container width for comparison
	const containerRef = props.ref
	const [containerWidth, setContainerWidth] = useState(0)

	useEffect(() => {
		const updateContainerWidth = () => {
			if (containerRef?.current) {
				const rect = containerRef.current.getBoundingClientRect()
				setContainerWidth(rect.width)
			}
		}

		updateContainerWidth()
		window.addEventListener('resize', updateContainerWidth)
		return () => window.removeEventListener('resize', updateContainerWidth)
	}, [containerRef])

	// Grid width is always based on beats * fixed width, regardless of container size
	// This ensures consistent visual spacing - the grid will scroll if it's wider than container
	const finalGridWidth = calculatedGridWidth

	const checkScrollability = () => {
		const container = scrollContainerRef.current
		if (!container) return

		const scrollLeft = container.scrollLeft
		const scrollWidth = container.scrollWidth
		const clientWidth = container.clientWidth
		const maxScrollLeft = scrollWidth - clientWidth

		// Account for floating point precision issues
		const canScrollLeft = scrollLeft > 1
		const canScrollRight = maxScrollLeft - scrollLeft > 1
		setCanScrollLeft(canScrollLeft)
		setCanScrollRight(canScrollRight)
	}

	useEffect(() => {
		const container = scrollContainerRef.current
		if (!container) return

		// Check initial scroll state
		checkScrollability()

		// Add scroll event listener
		container.addEventListener('scroll', checkScrollability)

		// Check when container size changes
		const resizeObserver = new ResizeObserver(checkScrollability)
		resizeObserver.observe(container)

		return () => {
			container.removeEventListener('scroll', checkScrollability)
			resizeObserver.disconnect()
		}
	}, [finalGridWidth])

	const generateGridBlocks = () => {
		const blocks = []
		const beatsPerBar = 4
		// Always show at least 32 beats worth of grid blocks for visual consistency
		const beatsToShow = Math.max(totalBeats, 32)

		// Generate blocks for each beat, but group them by bars
		for (let i = 0; i < beatsToShow; i++) {
			const barIndex = Math.floor(i / beatsPerBar)
			const isEvenBar = barIndex % 2 === 0
			// Even bars are light, odd bars are dark
			const className = `gridBlock ${isEvenBar ? 'lighter' : 'darker'}`
			blocks.push(<span key={i} className={className}></span>)
		}
		return blocks
	}

	useHotkeys(['Shift', 'S'], () => {
		console.log('Shift + S pressed')
		$progression.save()
		$pattern.toJson()
	})

	return (
		<Flex.Row
			ref={props.ref}
			className={`ProgressionGrid ${canScrollLeft ? 'canScrollLeft' : ''} ${canScrollRight ? 'canScrollRight' : ''}`}
			position="relative"
			width="100%"
			height="64px"
		>
			{/* Left scroll indicator */}
			{canScrollLeft && (
				<div className="scrollIndicator scrollIndicatorLeft">
					<Icon name="ion:caret-forward-outline" width="16px" height="16px" color="var(--sand-11)" />
				</div>
			)}

			{/* Right scroll indicator */}
			{canScrollRight && (
				<div className="scrollIndicator scrollIndicatorRight">
					<Icon name="ion:caret-forward-outline" width="16px" height="16px" color="var(--sand-11)" />
				</div>
			)}

			{/* Scrollable container */}
			<Flex.Row
				ref={scrollContainerRef}
				className="scrollableContainer"
				width="100%"
				height="100%"
				style={{
					overflowX: 'auto',
					overflowY: 'hidden',
					position: 'relative'
				}}
			>
				<Flex.Row
					height="100%"
					width="100%"
					className="gridBackground"
					style={{
						position: 'relative',
						minWidth: `${finalGridWidth}px`,
						width: `${finalGridWidth}px`
					}}
				>
					<PlaybackMarkerProgression
						containerWidth={finalGridWidth}
						totalBeats={Math.max(totalBeats, 32)} // Ensure at least 32 beats for visual consistency
					/>
					{generateGridBlocks()}
				</Flex.Row>
				<Flex.Row
					className="gridContent"
					position="absolute"
					top="0"
					left="0"
					width="100%"
					height="100%"
					gap="2px"
					style={{
						minWidth: `${finalGridWidth}px`,
						width: `${finalGridWidth}px`
					}}
				>
					{props.renderChords(finalGridWidth, beatsToShow)}
				</Flex.Row>
			</Flex.Row>
		</Flex.Row>
	)
})
