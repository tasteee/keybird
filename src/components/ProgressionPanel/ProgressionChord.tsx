import './ProgressionChord.css'
import { Flex } from '#/components/layout/Flex'
import { Badge, Card, Kbd, Text } from '@radix-ui/themes'
import { $progression } from '#/stores/$main'
import classNames from 'classnames'
import { getAccentColorClassName } from '#/modules/color'
import { ChordMenu } from '../ChordMenu'

type PropsT = {
	setVoicing?: (value: string) => void
	setInversion?: (value: number) => void
	setOctaveOffset?: (value: number) => void
	addChord?: () => void
	removeChord?: () => void
	setMinVelocity?: (value: number) => void
	setMaxVelocity?: (value: number) => void
	playChord: () => void
	stopChord: () => void
	onClick?: () => void
	state: CustomChordT
}

type TempProgressionChordPropsT = {
	symbol: string
	inversion?: number
	octaveOffset?: number
	voicing?: string
}

export const TempProgressionChord = (props: TempProgressionChordPropsT) => {
	const chord = $progression.useNewChord(props.symbol, {
		inversion: props.inversion,
		octaveOffset: props.octaveOffset,
		voicing: props.voicing
	})

	return <InnerProgressionChord {...chord} />
}

export const ProgressionChord = (props) => {
	const chord = $progression.useChord(props.id)
	return <InnerProgressionChord {...chord} />
}

const InnerProgressionChord = (props: PropsT) => {
	const accentsClassName = getAccentColorClassName(props.state.rootNote)
	const className = classNames('ProgressionChord', accentsClassName)
	const showOctaveBadge = props.state.octaveOffset !== 0
	const showInversionBadge = props.state.inversion !== 0
	const showResetIcon = showOctaveBadge || showInversionBadge
	const removeChord = () => $progression.removeChord(props.state.id)

	if (!props.state.symbol || !accentsClassName) return null

	const onMouseDown = () => props.playChord()
	const onMouseUp = () => props.stopChord()

	return (
		<Flex.Column
			className={className}
			tabIndex={0}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			onClick={props.onClick}
			p="12px"
			width="100%"
			height="100%"
		>
			<ChordMenu {...props}>
				<Flex.Row gap="2" align="center" justify="between">
					<Text size="2" weight="bold" className="symbol">
						{props.state.symbol}
					</Text>
				</Flex.Row>
			</ChordMenu>
		</Flex.Column>
	)
}
