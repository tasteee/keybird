import classNames from 'classnames'
import { useComponentSize } from 'react-use-size'
import { Flex } from '../layout/Flex'
import { $progressionPanel } from './$progressionPanel'
import { ProgressionChord, TempProgressionChord } from './ProgressionChord'
import { useOnClickOutside } from 'usehooks-ts'
import { $output, $progression } from '#/stores'
import { useHotkeys } from '#/modules/hooks'
import { useDatass } from 'datass'
import { $patternEditor } from '#/views/patterns/patternEditor.store'

const TOTAL_BEATS = 16 // e.g., 4 bars of 4/4

const useSizeAndClickRef = (ref) => {
	useOnClickOutside(ref, (event: MouseEvent) => {
		const target = event?.target as HTMLElement
		const isInsideChordOptions = target.closest?.('.ChordOptions')
		if (isInsideChordOptions) return
		$progressionPanel.selectedChordId.set('')
	})
}

type TempProgressionChordPropsT = {
	symbol: string
	inversion?: number
	octaveOffset?: number
	voicing?: string
}

export const TempProgressionGrid = (props) => {
	const { ref, width } = useComponentSize()

	const renderChords = () =>
		props.chords.map((chord) => (
			<TimingWrapper key={chord.id} chord={chord} totalBeats={TOTAL_BEATS} totalWidth={width}>
				<TempProgressionChord
					symbol={chord.symbol}
					inversion={chord.inversion}
					octaveOffset={chord.octaveOffset}
					voicing={chord.voicing}
				/>
			</TimingWrapper>
		))

	return <InnerProgressionGrid ref={ref} chords={props.chords} renderChords={renderChords} />
}

const onMouseDown = (chord) => (event) => {
	const isLeftButton = event.button === 0
	if (!isLeftButton) return
	event.preventDefault()
	event.stopPropagation()
	$output.playChord(chord)
}

const onMouseUp = (chord) => (event) => {
	const isLeftButton = event.button === 0
	if (!isLeftButton) return
	event.preventDefault()
	event.stopPropagation()
	$output.stopChord(chord)
}

export const ProgressionGrid = () => {
	const { ref, width } = useComponentSize()
	const chords = $progression.use()
	useSizeAndClickRef(ref)
	const selectedId = $progressionPanel.selectedChordId.use()

	const renderChords = () => {
		return chords.map((chord) => (
			<TimingWrapper
				key={chord.id}
				chord={chord}
				totalBeats={TOTAL_BEATS}
				totalWidth={width}
				onClick={(event) => {
					event.stopPropagation()
					event.preventDefault()
					$progressionPanel.selectedChordId.set(chord.id)
				}}
				isSelected={chord.id === selectedId}
			>
				<ProgressionChord id={chord.id} />
			</TimingWrapper>
		))
	}

	return <InnerProgressionGrid renderChords={renderChords} ref={ref} width={width} />
}

export const InnerProgressionGrid = (props) => {
	const isPlaying = useDatass.boolean(false)

	useHotkeys([' '], () => {
		console.log('doing it...')
		if (isPlaying.state) {
			$progression.stopLoop()
			isPlaying.set(false)
			return
		}

		if ($progression.state.length === 0) return
		isPlaying.set(true)
		$progression.playLoop()
	})

	useHotkeys(['Shift', 'S'], () => {
		console.log('Shift + S pressed')
		$progression.save()
		$patternEditor.toJson()
	})

	return (
		<Flex.Row ref={props.ref} className="ProgressionGrid" position="relative" width="100%" height="64px">
			<Flex.Row height="100%" width="100%" className="gridBackground" style={{ position: 'relative' }}>
				<span className="gridBlock lighter"></span>
				<span className="gridBlock lighter"></span>
				<span className="gridBlock lighter"></span>
				<span className="gridBlock lighter"></span>
				<span className="gridBlock"></span>
				<span className="gridBlock"></span>
				<span className="gridBlock"></span>
				<span className="gridBlock"></span>
				<span className="gridBlock lighter"></span>
				<span className="gridBlock lighter"></span>
				<span className="gridBlock lighter"></span>
				<span className="gridBlock lighter"></span>
				<span className="gridBlock"></span>
				<span className="gridBlock"></span>
				<span className="gridBlock"></span>
				<span className="gridBlock"></span>
			</Flex.Row>
			<Flex.Row className="gridContent" position="absolute" top="0" left="0" width="100%" height="100%" gap="2px">
				{props.renderChords()}
			</Flex.Row>
		</Flex.Row>
	)
}

const TimingWrapper = (props) => {
	const { chord, totalBeats } = props
	const duration = chord.durationBeats || 4
	const width = (props.totalWidth / totalBeats) * duration

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
}
