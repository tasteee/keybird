import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

type TimingWrapperPropsT = {
	chord: {
		id: string
		symbol?: string
		durationBeats: number
	}
	totalBeats: number
	totalChords: number
	totalWidth: number
	isSelected: boolean
	onClick?: () => void
	onMouseDown?: (event: React.MouseEvent) => void
	onMouseUp?: (event: React.MouseEvent) => void
	children: React.ReactNode
}

export const TimingWrapper = observer((props: TimingWrapperPropsT) => {
	const { chord, totalBeats, totalChords } = props
	const duration = chord.durationBeats || 4

	// Calculate minimum width needed for proper display
	const minimumGridWidth = Math.max(totalBeats * 60, 800) // same calculation as InnerProgressionGrid

	// Account for the 2px gap between elements
	const gapSize = 2
	const totalGaps = Math.max(0, (totalChords || 1) - 1)
	const availableWidth = minimumGridWidth - totalGaps * gapSize
	const width = (availableWidth / totalBeats) * duration

	const className = classNames('TimingWrapper', {
		isSelected: props.isSelected
	})

	const style = {
		width: `${width}px`,
		top: '2%',
		position: 'relative',
		height: '95%',
		zIndex: 2,
		alignItems: 'stretch'
	} as any

	return (
		<div
			className={className}
			style={style}
			onClick={props.onClick}
			onMouseDown={props.onMouseDown}
			onMouseUp={props.onMouseUp}
		>
			{props.children}
		</div>
	)
})
