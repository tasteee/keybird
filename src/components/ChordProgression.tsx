import './ChordProgression.css'
import { useState } from 'react'
import { Flex } from '#/components/layout/Flex'
import { Select, Text, TextField, Button } from '@radix-ui/themes'
// import { ChordBlock } from './ChordBlock'
import { $progression } from '#/stores'
import { MiniChordBlock } from './MiniChordBlock'
import { datass } from 'datass'
import { useComponentSize } from 'react-use-size'
import { useOnClickOutside } from 'usehooks-ts'

const selectedChordId = datass.string('')
const TOTAL_BEATS = 16 // e.g., 4 bars of 4/4

const useSizeAndClickRef = () => {
	const { ref, width } = useComponentSize()

	useOnClickOutside(ref, (event) => {
		// if click is within .ChordOptions, do nothing...
		if (event?.target?.closest?.('.ChordOptions')) return
		if (selectedChordId.state) selectedChordId.set('')
	})

	return { ref, width }
}

export const ChordProgression = () => {
	const { ref, width } = useSizeAndClickRef()
	const chords = $progression.use()

	const download = () => {
		$progression.toMidi()
	}

	return (
		<Flex.Column className="ChordProgression" gap="8px" p="4" pb="0">
			<Flex.Row className="top" justify="between" align="center" width="100%">
				<Flex.Row gap="2" align="center">
					<Icon name="download0" color="white" width="16px" height="16px" onClick={download} />
					<Text size="2" weight="bold">
						PROGRESSION
					</Text>
					<QwertyTargetIndicator target="progression" />
				</Flex.Row>
				{selectedChordId.use() && <ChordOptions totalWidth={width} chordCount={chords.length} />}
			</Flex.Row>

			<ProgressionGrid ref={ref} className="bottom grid-background">
				{chords.map((chord, index) => (
					<TimingWrapper totalWidth={width} key={chord.id} chord={chord} totalBeats={TOTAL_BEATS}>
						<MiniChordBlock id={chord.id} index={index} isSelected={selectedChordId.state === chord.id} symbol={chord.symbol} />
					</TimingWrapper>
				))}
			</ProgressionGrid>
		</Flex.Column>
	)
}

import * as Label from '@radix-ui/react-label'
import { Icon } from './Icon'
import { QwertyTargetIndicator } from './QwertyTargetIndicator'

const ChordOptions = (props) => {
	const id = selectedChordId.use()
	const chord = $progression.hooks.useChord(id)
	if (!chord) return null

	const handleMoveLeft = () => {
		$progression.actions.moveChordLeft(id)
	}

	const handleMoveRight = () => {
		$progression.actions.moveChordRight(id)
	}

	const handleDelete = () => {
		selectedChordId.set('') // Clear selection after deletion
		$progression.actions.deleteChord(id)
	}

	const duration = (
		<Flex.Row gap="2" align="center">
			<Label.Root className="LabelRoot" htmlFor="duration">
				Duration
			</Label.Root>
			<TextField.Root
				size="1"
				className="durationInput"
				type="number"
				min="1"
				max="16"
				id="duration"
				step="1"
				value={chord.durationBeats}
				onChange={(e) => {
					const newDuration = parseInt(e.target.value, 10)

					if (!isNaN(newDuration)) {
						$progression.actions.updateChordDuration(chord.id, newDuration)
					}
				}}
			/>
		</Flex.Row>
	)

	const chords = $progression.state
	const showLeftButton = chords.length > 1 && chord.id !== chords[0].id
	const showRightButton = chords.length > 1 && chord.id !== chords[chords.length - 1].id

	return (
		<Flex.Row gap="3" className="ChordOptions" align="center" style={{ position: 'absolute', right: 16 }}>
			{duration}

			{showLeftButton && (
				<Button className="leftArrowIconButton" size="1" variant="surface" onClick={handleMoveLeft}>
					<Icon color="white" name="arrowLeft0" width="16px" height="16px" />
				</Button>
			)}
			{showRightButton && (
				<Button className="rightArrowIconButton" size="1" variant="surface" onClick={handleMoveRight}>
					<Icon color="white" name="arrowRight0" width="16px" height="16px" />
				</Button>
			)}

			<Button size="1" variant="outline" onClick={handleDelete}>
				<Icon color="white" name="trash0" width="16px" height="16px" />
			</Button>
			{/* <Text size="1">Total Beats: {TOTAL_BEATS}</Text> */}
			{/* <Text size="1">Total Bars: {TOTAL_BARS}</Text> */}
		</Flex.Row>
	)
}

// TimingWrapper: Simple positioning wrapper using percentage-based grid
const TimingWrapper = (props) => {
	const { chord, totalBeats } = props
	const duration = chord.durationBeats || 4
	const width = (props.totalWidth / totalBeats) * duration

	const style = {
		width: `${width}px`,
		top: '2%',
		position: 'relative',
		height: '95%',
		zIndex: 2,
		alignItems: 'stretch'
	}

	const handleClick = () => {
		selectedChordId.set(chord.id)
	}

	const isSelected = selectedChordId.use() === chord.id

	return (
		<div className={`TimingWrapper ${isSelected ? 'isSelected' : ''}`} style={style} onClick={handleClick}>
			{props.children}
		</div>
	)
}

export const ProgressionGrid = (props) => {
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
			<Flex.Row className="gridContent" position="absolute" top="0" left="0" width="100%" height="100%">
				{props.children}
			</Flex.Row>
		</Flex.Row>
	)
}
