import './ChordBlock.css'
import { Spacer } from '#/components/layout/Spacer'
import { Flex } from '#/components/layout/Flex'
import { theory } from '#/utilities/toner'
import { Cross2Icon, DotsHorizontalIcon, GearIcon, KeyboardIcon, PlusCircledIcon, TrashIcon } from '@radix-ui/react-icons'
import React from 'react'
import { Text, Select, TextField, Button } from '@radix-ui/themes'
import { useDatass } from 'datass'
import { $progression, useNewChord } from '#/stores/$progression'
import { TinyStat } from './TinyStat'
import appConfig from '../../configuration/app.config.json'
import { cssColorVars, getAccentColorClassName } from '#/modules/color'

const useChordSettings = (chord = {} as any) => {
	return useDatass.object({
		octaveOffset: chord.octaveOffset || 0,
		rootNote: chord.tonic,
		symbol: chord.symbol,
		degree: chord.degreee,
		notes: chord.notes || [],
		quality: chord.quality,
		isSpread: chord.isSpread || false,
		isOpen: chord.isOpen || false,
		voicing: chord.voicing,
		shortName: chord.shortName,
		longName: chord.longName,
		extensions: chord.extensions || [],
		duration: chord.duration || '1 bar',
		inversion: chord.inversion || 0,
		isMenuOpen: false,
		whichMenuOpen: ''
	})
}

type ChordBlockPropsT = {
	symbol?: string
	chord?: any
}

export const ChordBlock = (props: ChordBlockPropsT) => {
	const isMenuOpen = useDatass.boolean(false)
	const chord = useNewChord(props.symbol)
	const style = cssColorVars(chord.state.rootNote) as React.CSSProperties
	const accentsClassName = getAccentColorClassName(chord.state.rootNote)
	const timeoutRef = React.useRef<number>()

	const toggleMenuOpen = (key?: string) => {
		if (!key) {
			chord.set.lookup('isMenuOpen', false)
			chord.set.lookup('whichMenuOpen', '')
			return
		}

		chord.set.lookup('whichMenuOpen', key)
		chord.set.lookup('isMenuOpen', true)
	}

	const addChord = () => {
		$progression.actions.addChord(chord.state)
	}

	const removeChord = () => {
		$progression.actions.removeChord(chord.id)
	}

	const handleMouseLeave = () => {
		if (!isMenuOpen.state) return

		timeoutRef.current = setTimeout(() => {
			chord.set.lookup('isMenuOpen', false)
		}, 2500)
	}

	const handleMouseEnter = () => {
		clearTimeout(timeoutRef.current)
	}

	const MainActionIcon = props.chord ? Cross2Icon : PlusCircledIcon
	const mainAction = props.chord ? removeChord : addChord

	const IconsBox = (
		<Flex.Row>
			<MainActionIcon className="addIcon" width="18px" height="18px" onClick={mainAction} />
		</Flex.Row>
	)

	const BackMenuButton = (
		<Button variant="ghost" color="gray" size="1" mr="2" onClick={() => toggleMenuOpen('')}>
			Back
		</Button>
	)

	if (!chord.state.rootNote || !accentsClassName) return null

	return (
		<Flex.Column
			style={style}
			className="ChordBlock"
			pl="2"
			pr="1"
			pt="2"
			pb="1"
			onMouseLeave={handleMouseLeave}
			onMouseEnter={handleMouseEnter}
		>
			<Flex.Row justify="between" align="center" px="2">
				<Flex.Row gap="2" align="center">
					<span className="coloredCircle" />
					<Text>{chord.state.symbol}</Text>
				</Flex.Row>
				{chord.state.isMenuOpen ? BackMenuButton : IconsBox}
			</Flex.Row>
			{chord.state.isMenuOpen && (
				<ChordSettingMenu
					chord={chord}
					octave={chord.state.octaveOffset}
					setOctave={(value) => chord.set.lookup('octaveOffset', value)}
					inversion={chord.state.inversion}
					setInversion={(value) => chord.set.lookup('inversion', value)}
					duration={chord.state.duration}
					setDuration={(value) => chord.set.lookup('duration', value)}
				/>
			)}

			{!chord.state.isMenuOpen && (
				<Flex.Column height="112" width="100%" justify="between" align="center">
					{chord.state.keyMap && (
						<Flex.Row align="center" mt="5">
							<KeyboardIcon width="20px" height="20px" />
							<Spacer width="8px" />
							<Text>{chord.state.keyMap}</Text>
						</Flex.Row>
					)}

					<Flex.Row gap="2" p="1" width="100%">
						<TinyStat.Number
							label="Octave"
							value={chord.state.octaveOffset}
							min={-3}
							max={8}
							step={1}
							onValueChange={(value) => chord.set.lookup('octaveOffset', value)}
						/>
						<TinyStat.Number
							label="Inversion"
							value={chord.state.inversion}
							min={-3}
							max={3}
							step={1}
							onValueChange={(value) => chord.set.lookup('inversion', value)}
						/>
					</Flex.Row>
				</Flex.Column>
			)}
		</Flex.Column>
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

const ChordSettingMenu = (props) => {
	const isProgressionChord = !!props.chord.id

	return (
		<>
			<ChordBaseOctaveSelect octave={props.octave} setOctave={props.setOctave} />
			<Spacer size="8px" />
			<ChordInversionSelect inversion={props.inversion} setInversion={props.setInversion} />
			{isProgressionChord && (
				<>
					<Spacer size="8px" />
					<Select.Root value={props.duration} onValueChange={props.setDuration}>
						<Select.Trigger>
							<Text>Duration {props.duration}</Text>
						</Select.Trigger>
						<Select.Content position="popper">
							{DURATIONS.map((value) => (
								<Select.Item key={value} value={value}>
									{value}
								</Select.Item>
							))}
						</Select.Content>
					</Select.Root>
				</>
			)}
		</>
	)
}

type ChordBaseOctaveSelectPropsT = {
	octave: number
	setOctave: (octave: number) => void
}

export const ChordBaseOctaveSelect = React.memo((props: ChordBaseOctaveSelectPropsT) => {
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

export const ChordInversionSelect = React.memo((props: ChordInversionSelectPropsT) => {
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
