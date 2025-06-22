import './ChordBlock.css'
import { Spacer } from '#/components/layout/Spacer'
import { Flex } from '#/components/layout/Flex'
import { Cross2Icon, DotsHorizontalIcon, GearIcon, KeyboardIcon, PlusCircledIcon, TrashIcon } from '@radix-ui/react-icons'
import React from 'react'
import { Text, Select, TextField, Button, Kbd } from '@radix-ui/themes'
import { $progression, useNewChord } from '#/stores/$progression'
import { cssColorVars, getAccentColorClassName } from '#/modules/color'
import { ChordMenu } from './ChordMenu'
import { $input, $output } from '#/stores'
import classNames from 'classnames'

type ChordBlockPropsT = {
	symbol: string
	index: number
}

export const ChordBlock = (props: ChordBlockPropsT) => {
	const chord = useNewChord(props.symbol)
	const accentsClassName = getAccentColorClassName(chord.state.rootNote)
	if (!chord.state.rootNote || !accentsClassName) return null
	const addChord = () => $progression.addChord(chord.state)
	const className = classNames('ChordBlock', accentsClassName)

	const onMouseDown = (e: React.MouseEvent) => {
		const isLeftButton = e.button === 0
		if (!isLeftButton) return
		e.preventDefault()
		e.stopPropagation()
		$output.playChord(chord.state)
	}

	const onMouseUp = (e: React.MouseEvent) => {
		const isLeftButton = e.button === 0
		if (!isLeftButton) return
		e.preventDefault()
		e.stopPropagation()
		$output.stopChord(chord.state)
	}

	return (
		<ChordMenu {...chord}>
			<Flex.Column className={className} pl="2" pr="1" pt="2" pb="1" onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
				<Flex.Row justify="between" align="center" px="2">
					<Flex.Row gap="2" align="center">
						<span className="coloredCircle" />
						<Text>{chord.state.symbol}</Text>
					</Flex.Row>
					<Flex.Row>
						<PlusCircledIcon className="addIcon" width="18px" height="18px" onClick={addChord} />
					</Flex.Row>
				</Flex.Row>
			</Flex.Column>
		</ChordMenu>
	)
}

const DURATIONS = [
	'1/8 bar',
	'1/4 bar',
	'1/2 bar',
	'1 bar',
	'1 1/8 bar',
	'1 1/4 bar',
	'1 1/2 bar',
	'2 bars',
	'2 1/8 bar',
	'2 1/4 bar',
	'2 1/2 bar',
	'3 bars',
	'3 1/8 bar',
	'3 1/4 bar',
	'3 1/2 bar',
	'4 bars'
]

type ChordBaseOctaveSelectPropsT = {
	octave: number
	setOctave: (octave: number) => void
}

const ChordBaseOctaveSelect = React.memo((props: ChordBaseOctaveSelectPropsT) => {
	const setChordBaseOctave = (newOctave: string) => {
		const value = Number(newOctave)
		props.setOctave(value)
	}

	return (
		<Select.Root value={props.octave.toString()} onValueChange={setChordBaseOctave}>
			<Select.Trigger>
				<Text>Octave {props.octave}</Text>
			</Select.Trigger>
			<Select.Content position="popper">
				{[0, 1, 2, 3, 4, 5, 6, 7, 8].map((value) => (
					<Select.Item key={value} value={value.toString()}>
						{value}
					</Select.Item>
				))}
			</Select.Content>
		</Select.Root>
	)
})

type ChordInversionSelectPropsT = {
	inversion: number
	setInversion: (inversion: number) => void
}

const ChordInversionSelect = React.memo((props: ChordInversionSelectPropsT) => {
	const setChordInversion = (newInversion: string) => {
		const value = Number(newInversion)
		props.setInversion(value)
	}

	return (
		<Select.Root value={props.inversion.toString()} onValueChange={setChordInversion}>
			<Select.Trigger>
				<Text>Inversion {props.inversion}</Text>
			</Select.Trigger>
			<Select.Content position="popper">
				{[-3, -2, -1, 0, 1, 2, 3].map((value) => (
					<Select.Item key={value} value={value.toString()}>
						{value}
					</Select.Item>
				))}
			</Select.Content>
		</Select.Root>
	)
})
