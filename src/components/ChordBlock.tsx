import './ChordBlock.css'
import { Spacer } from '#/components/common/Spacer'
import { Flex } from '#/components/common/Flex'
import {
	Cross2Icon,
	DotsHorizontalIcon,
	GearIcon,
	KeyboardIcon,
	PlusCircledIcon,
	ResetIcon,
	TrashIcon
} from '@radix-ui/react-icons'
import React, { useEffect } from 'react'
import { Text, Select, TextField, Button, Kbd } from '@radix-ui/themes'
import { $progression } from '#/stores/$progression'
import { ChordMenu } from './ChordMenu'
import { $input, $output, $player } from '#/stores'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { $chords } from '#/stores/$chords'
import { toJS } from 'mobx'
import { useLastValue } from '#/hooks/useLastValue'
import { useDatass } from 'datass'

type ChordBlockPropsT = {
	id: string
	index: number
}

// A chord block is a chord that is in the chord browser.
// It is not yet added to a progression. It can be edited,
// just like a progression chord, but it does not persist
// if you refresh the page or change the scale on the chord browser.
export const ChordBlock = observer((props: ChordBlockPropsT) => {
	const isMouseDown = useDatass.boolean(false)
	const chord = $chords.useChord(props.id)
	const accentsClassName = chord.color + 'Accents'
	const addChord = () => $progression.addChord(chord)

	const keyCode = $input.getKeyCodeForChord(chord.id)
	const displayKey = $input.getKeyFromCode(keyCode)
	const isMappedKeyPressed = $input.checkKeyPressed(keyCode)
	const playingClass = isMappedKeyPressed ? 'isPlaying' : ''
	const className = classNames('ChordBlock', accentsClassName, playingClass)

	const lastOctaveOffset = useLastValue(chord.octaveOffset)
	const lastInversion = useLastValue(chord.inversion)
	const lastVoicing = useLastValue(chord.voicing)
	const lastBassNote = useLastValue(chord.bassNote)

	const setMinVelocity = (value: number) => {
		$chords.updateChord({ id: props.id, minVelocity: value })
	}

	const setMaxVelocity = (value: number) => {
		$chords.updateChord({ id: props.id, maxVelocity: value })
	}

	const setOctaveOffset = (value: number) => {
		$chords.updateChord({ id: props.id, octaveOffset: value })
	}

	const setInversion = (value: number) => {
		$chords.updateChord({ id: props.id, inversion: value })
	}

	const setBassNote = (value: string) => {
		$chords.updateChord({ id: props.id, bassNote: value })
	}

	const setVoicing = (value: string) => {
		$chords.updateChord({ id: props.id, voicing: value })
	}

	// If chord is modified, we show badges that indicate
	// what specifically is modified about it.
	// If the chord has been modified, we allow the user to reset it.
	const hasOctaveModifier = chord.octaveOffset !== 0
	const hasInversionModifier = chord.inversion !== 0
	const hasVoicingModifier = chord.voicing !== 'closed'
	const shouldShowResetIcon = hasOctaveModifier || hasInversionModifier || hasVoicingModifier

	const onMouseDown = (e: React.MouseEvent) => {
		const isLeftButton = e.button === 0
		if (!isLeftButton) return
		e.preventDefault()
		e.stopPropagation()
		console.log('Playing chord:', chord.symbol, toJS(chord))
		$player.play(chord)
		isMouseDown.set(true)
	}

	const onMouseUp = (e: React.MouseEvent) => {
		const isLeftButton = e.button === 0
		if (!isLeftButton) return
		e.preventDefault()
		e.stopPropagation()
		$player.stop(chord)
		isMouseDown.set(false)
	}

	const onMouseLeave = () => {
		if (!isMouseDown.state) return
		$player.stop(chord)
		isMouseDown.set(false)
	}

	useEffect(() => {
		const didOctaveChange = chord.octaveOffset !== lastOctaveOffset
		const didInversionChange = chord.inversion !== lastInversion
		const didVoicingChange = chord.voicing !== lastVoicing

		if (didOctaveChange || didInversionChange || didVoicingChange) {
			$player.play(chord)
		}
	}, [chord.octaveOffset, chord.inversion, chord.voicing, lastOctaveOffset, lastInversion, lastVoicing])

	return (
		<ChordMenu
			setVoicing={setVoicing}
			setInversion={setInversion}
			setOctaveOffset={setOctaveOffset}
			addChord={addChord}
			setMinVelocity={setMinVelocity}
			setMaxVelocity={setMaxVelocity}
			chord={chord}
		>
			<Flex.Column
				pl="2"
				pr="1"
				pt="2"
				pb="1"
				className={className}
				onMouseDown={onMouseDown}
				onMouseUp={onMouseUp}
				onMouseLeave={onMouseLeave}
			>
				<Flex.Row justify="between" align="center" px="1" pl="0">
					<Flex.Row gap="2" align="center">
						{displayKey && <Kbd className="keyIndicator">{displayKey}</Kbd>}
						<span className="coloredCircle" />
						<Text>{chord.symbol}</Text>
						{shouldShowResetIcon && <ResetIcon className="resetIcon" width="18px" height="18px" />}
					</Flex.Row>
					<Flex.Row align="center" gap="1">
						<PlusCircledIcon className="addIcon" width="18px" height="18px" onClick={addChord} />
					</Flex.Row>
				</Flex.Row>
			</Flex.Column>
		</ChordMenu>
	)
})
