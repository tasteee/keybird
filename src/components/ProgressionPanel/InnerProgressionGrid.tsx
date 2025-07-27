import { Flex } from '#/components/common/Flex'
import { useHotkeys } from '#/modules/hooks'
import { $progression } from '#/stores'
import { $output } from '#/stores/output/$output'
import { $patternEditor } from '#/views/patterns/patternEditor.store'
import { Text } from '@radix-ui/themes'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'

type PropsT = {
	ref: React.RefObject<HTMLDivElement>
	renderChords: () => JSX.Element[]
}

export const InnerProgressionGrid = observer((props: PropsT) => {
	const [isPlaying, setIsPlaying] = useState(false)

	useHotkeys([' '], () => {
		if ($progression.steps.length === 0) return console.warn('No steps in progression to play.')

		if (isPlaying) {
			console.log('was playing. stopping.')
			$output.engine.stop()
			setIsPlaying(false)
			return
		}

		// Extract signals from the pattern editor
		const signals = Object.values($patternEditor.signalMap)
		$output.engine.setSignals(signals)
		console.log('playing progression')
		setIsPlaying(true)
		$output.engine.play()
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
})
