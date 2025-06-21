import './MiniChordBlock.css'
import { Flex } from '#/components/layout/Flex'
import { useDatass } from 'datass'
import { Badge, Card, Kbd, Text } from '@radix-ui/themes'
import { $output, $progression } from '#/stores/$main'
import classNames from 'classnames'
import { useNewChord } from '#/stores/$progression'
import { cssColorVars, getAccentColorClassName } from '#/modules/color'
import { useChordKeyListener } from '#/hooks/useKeyChordListener'

type PropsT = {
	symbol?: string
	id?: string
	style?: any
	isSelected?: boolean
	index?: number
}

export const MiniChordBlock = (props: PropsT) => {
	const isMenuOpen = useDatass.boolean(false)
	const chord = useNewChord(props.symbol)
	const style = cssColorVars(chord.state.rootNote) as React.CSSProperties
	const accentsClassName = getAccentColorClassName(chord.state.rootNote)
	const qwertyKey = useChordKeyListener(props.index, chord, 'progression')

	const className = classNames('MiniChordBlock', accentsClassName, {
		MiniChordBlockWithMenuOpen: isMenuOpen.state,
		isSelected: props.isSelected
	})

	const showOctaveBadge = chord.state.octaveOffset !== 0
	const showInversionBadge = chord.state.inversion !== 0
	const showResetIcon = showOctaveBadge || showInversionBadge
	const removeChord = () => $progression.actions.removeChord(chord.state.id)

	if (!chord.state.symbol || !accentsClassName) return null

	const onBlockClick = () => {
		$output.playChord(chord.state)
	}

	const onMouseUp = (e) => {
		if (e.button === 0) {
			$output.stopChord(chord.state)
		}
	}

	return (
		<Card className={className} tabIndex={0} onMouseDown={onBlockClick} onMouseUp={onMouseUp} style={style} asChild>
			<Flex.Column className="MiniChordBlockInner">
				<Flex.Row gap="2" align="center" justify="between">
					<Text size="2" weight="bold" className="MiniChordBlock__symbol">
						{chord.state.symbol}
					</Text>
					{qwertyKey && <Kbd size="2">{qwertyKey}</Kbd>}
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
