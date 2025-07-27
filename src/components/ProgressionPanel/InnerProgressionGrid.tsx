import { Flex } from '#/components/common/Flex'
import { Icon } from '#/components/common/Icon'
import { useHotkeys } from '#/modules/hooks'
import { $progression } from '#/stores'
import { $output } from '#/stores/output/$output'
import { $pattern } from '#/stores/$pattern'
import { Text } from '@radix-ui/themes'
import { observer } from 'mobx-react-lite'
import { useState, useMemo, useEffect, useRef } from 'react'

type PropsT = {
	ref: React.RefObject<HTMLDivElement>
	renderChords: () => JSX.Element[]
}

export const InnerProgressionGrid = observer((props: PropsT) => {
	const [canScrollLeft, setCanScrollLeft] = useState(false)
	const [canScrollRight, setCanScrollRight] = useState(false)
	const scrollContainerRef = useRef<HTMLDivElement>(null)
	const totalBeats = $progression.totalBeats

	// Calculate minimum width needed to show all beats properly
	const minimumGridWidth = useMemo(() => {
		const beatsPerBar = 4
		const beatWidth = 60 // minimum width per beat for readability
		return Math.max(totalBeats * beatWidth, 800) // minimum 800px width
	}, [totalBeats])

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
	}, [minimumGridWidth])

	const generateGridBlocks = () => {
		const blocks = []
		const beatsPerBar = 4

		for (let i = 0; i < totalBeats; i++) {
			const isDownbeat = i % beatsPerBar === 0
			blocks.push(<span key={i} className={`gridBlock ${isDownbeat ? 'lighter' : ''}`}></span>)
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
					width={`${minimumGridWidth}px`}
					className="gridBackground"
					style={{ position: 'relative', minWidth: `${minimumGridWidth}px` }}
				>
					{generateGridBlocks()}
				</Flex.Row>
				<Flex.Row
					className="gridContent"
					position="absolute"
					top="0"
					left="0"
					width={`${minimumGridWidth}px`}
					height="100%"
					gap="2px"
					style={{ minWidth: `${minimumGridWidth}px` }}
				>
					{props.renderChords()}
				</Flex.Row>
			</Flex.Row>
		</Flex.Row>
	)
})
