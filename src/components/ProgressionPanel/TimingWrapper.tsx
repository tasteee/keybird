import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

type TimingWrapperPropsT = {
	chord: {
		id: string
		symbol?: string
		durationBeats: number
	}
	totalBeats: number
	effectiveBeats: number
	gridWidth: number
	totalChords: number
	isSelected: boolean
	onClick?: () => void
	onMouseDown?: (event: React.MouseEvent) => void
	onMouseUp?: (event: React.MouseEvent) => void
	children: React.ReactNode
}

export const TimingWrapper = observer((props: TimingWrapperPropsT) => {
	const { chord, effectiveBeats, gridWidth } = props
	const duration = chord.durationBeats || 4

	// Calculate width based on the actual grid width and beat distribution
	// Each beat gets an equal portion of the available grid width
	const beatWidth = gridWidth / effectiveBeats
	const width = beatWidth * duration

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
