import classNames from 'classnames'
import { useComponentSize } from 'react-use-size'
import { Flex } from '../common/Flex'
import { $progressionPanel } from './$progressionPanel'
import { ProgressionChord } from './ProgressionChord'
// import { TempProgressionChord } from '../_/TempProgressionChord'
import { useOnClickOutside } from 'usehooks-ts'
import { $output, $progression, $player } from '#/stores'
import { useHotkeys } from '#/modules/hooks'
import { useState } from 'react'
import { $pattern } from '#/stores/$pattern'
import { observer } from 'mobx-react-lite'
import { InnerProgressionGrid } from './InnerProgressionGrid'
import { TimingWrapper } from './TimingWrapper'

const useSizeAndClickRef = (ref) => {
	useOnClickOutside(ref, (event: MouseEvent) => {
		const target = event?.target as HTMLElement
		const isInsideChordOptions = target.closest?.('.ChordOptions')
		if (isInsideChordOptions) return
		$progressionPanel.setSelectedChordId('')
	})
}

const onMouseDown = (chord) => (event) => {
	const isLeftButton = event.button === 0
	if (!isLeftButton) return
	event.preventDefault()
	event.stopPropagation()
	$player.playChord(chord)
}

const onMouseUp = (chord) => (event) => {
	const isLeftButton = event.button === 0
	if (!isLeftButton) return
	event.preventDefault()
	event.stopPropagation()
	$player.stopChord(chord)
}

export const ProgressionGrid = observer(() => {
	const { ref, width } = useComponentSize()
	const steps = $progression.steps
	const selectedId = $progressionPanel.selectedChordId
	const totalChords = steps.length
	const totalBeats = $progression.totalBeats
	useSizeAndClickRef(ref)

	const renderChords = () => {
		return steps.map((chord) => (
			<TimingWrapper
				key={chord.id}
				chord={chord}
				totalBeats={totalBeats}
				totalWidth={width}
				totalChords={totalChords}
				isSelected={chord.id === selectedId}
				onMouseDown={onMouseDown(chord)}
				onMouseUp={onMouseUp(chord)}
				onClick={() => {
					$progressionPanel.setSelectedChordId(chord.id)
				}}
			>
				<ProgressionChord id={chord.id} />
			</TimingWrapper>
		))
	}

	return <InnerProgressionGrid renderChords={renderChords} ref={ref} />
})
