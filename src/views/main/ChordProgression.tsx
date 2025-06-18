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
const TOTAL_BARS = 4

export const ChordProgression = () => {
	const { ref, height, width } = useComponentSize()
	const chords = $progression.use()

	const updateChordTiming = (chordId, newDuration) => {
		$progression.actions.updateChordDuration(chordId, newDuration)
	}

	useOnClickOutside(ref, (event) => {
		// if click is within .ChordOptions, do nothing...
		if (event?.target?.closest?.('.ChordOptions')) return
		if (selectedChordId.state) selectedChordId.set('')
	})

	return (
		<Flex.Column className="ChordProgression" gap="4" p="4" pb="0">
			<Flex.Row className="top" justify="between" align="center" width="100%">
				<Text size="2" weight="bold">
					PROGRESSION
				</Text>
				{selectedChordId.use() && <ChordOptions totalWidth={width} />}
			</Flex.Row>

			<Flex.Row width="100%" gap="1px" ref={ref} overflowX="scroll" height="48px" className="bottom grid-background">
				{chords.map((chord) => (
					<TimingWrapper totalWidth={width} key={chord.id} chord={chord} totalBeats={TOTAL_BEATS} onChange={updateChordTiming}>
						<MiniChordBlock
							id={chord.id}
							isSelected={selectedChordId.state === chord.id}
							symbol={chord.symbol}
							style={{ width: '100%', height: '100%' }}
						/>
					</TimingWrapper>
				))}
			</Flex.Row>
		</Flex.Column>
	)
}

import * as Label from '@radix-ui/react-label'

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
			<Label.Root className="LabelRoot" htmlFor="duration" style={{ fontSize: '12px', color: 'var(--color-text)' }}>
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

	return (
		<Flex.Row gap="5" className="ChordOptions" align="center" style={{ position: 'absolute', right: 16 }}>
			{duration}
			<Button size="1" variant="outline" onClick={handleMoveLeft} style={{ borderColor: 'white', color: 'white' }}>
				Move Left
			</Button>
			<Button size="1" variant="outline" onClick={handleMoveRight} style={{ borderColor: 'white', color: 'white' }}>
				Move Right
			</Button>
			<Button size="1" variant="ghost" color="red" onClick={handleDelete}>
				Delete
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
		//     width: 100%;
		// height: 96%;
		// position: relative;
		// top: 4%;
		top: '2%',
		position: 'relative',
		height: '90%',
		zIndex: 2,
		display: 'flex',
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
