import { theory } from '#/utilities/toner'
import { Flex } from '#/components/layout/Flex'
import { useDatass } from 'datass'
import { Badge, Card, Text } from '@radix-ui/themes'
import { Cross2Icon, PlusCircledIcon, PlusIcon, ResetIcon, TrashIcon } from '@radix-ui/react-icons'
import { $progression } from '#/stores/$main'
import appConfig from '../../configuration/app.config.json'
import classNames from 'classnames'
import './MiniChordBlock.css'
import { midi } from '#/modules/midi'
import { useMemo } from 'react'
import { createChord, useNewChord } from '#/stores/$progression'
import { cssColorVars, getAccentColorClassName } from '#/modules/color'
import { useOnClickOutside } from 'usehooks-ts'

type PropsT = {
	symbol?: string
	id?: string
	style?: any
	isSelected?: boolean
}

export const MiniChordBlock = (props: PropsT) => {
	const isMenuOpen = useDatass.boolean(false)
	const chord = useNewChord(props.symbol)
	const style = cssColorVars(chord.state.rootNote) as React.CSSProperties
	const accentsClassName = getAccentColorClassName(chord.state.rootNote)

	const className = classNames('MiniChordBlock', accentsClassName, {
		MiniChordBlockWithMenuOpen: isMenuOpen.state,
		isSelected: props.isSelected
	})

	const showOctaveBadge = chord.state.octaveOffset !== 0
	const showInversionBadge = chord.state.inversion !== 0
	const showResetIcon = showOctaveBadge || showInversionBadge
	const addChord = () => $progression.actions.addChord(chord.state)
	const removeChord = () => $progression.actions.removeChord(chord.state.id)

	if (!chord.state.symbol || !accentsClassName) return null

	const onBlockClick = () => {
		midi.playChord(chord)
	}

	return (
		<Card className={className} tabIndex={0} style={{ ...(props.style || {}), ...style }} asChild>
			<Flex.Column className="MiniChordBlock__inner" style={{ position: 'relative', cursor: 'pointer', padding: 12 }}>
				<Flex.Row gap="2" align="center" justify="between">
					<Text size="2" weight="bold" className="MiniChordBlock__symbol">
						{chord.state.symbol}
					</Text>
				</Flex.Row>

				<Flex.Row gap="1" align="center">
					{showOctaveBadge && <OctaveModifierBadge value={chord.state.octaveOffset} />}
					{showInversionBadge && <InversionBadge value={chord.state.inversion} />}
				</Flex.Row>
			</Flex.Column>
		</Card>
	)
}

const OctaveModifierBadge = (props) => {
	const stringified = props.value.toString()
	const isNegative = stringified.startsWith('-')
	const absoluteValue = Math.abs(props.value)

	return (
		<Badge className="OctaveModifierBadge" variant="outline" color="gray">
			OCT{isNegative ? '-' : '+'}
			{absoluteValue}
		</Badge>
	)
}

const InversionBadge = (props) => {
	const stringified = props.value.toString()
	const isNegative = stringified.startsWith('-')
	const absoluteValue = Math.abs(props.value)

	return (
		<Badge className="InversionBadge">
			INT{isNegative ? '-' : '+'}
			{absoluteValue}
		</Badge>
	)
}

const OpenBadge = (props) => {
	return <Badge className="OpenBadge">OP</Badge>
}

const SpreadBadge = (props) => {
	return <Badge className="SpreadBadge">SP</Badge>
}
