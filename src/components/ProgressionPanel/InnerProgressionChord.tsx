import { getAccentColorClassName } from '#/modules/color'
import { ResetIcon } from '@radix-ui/react-icons'
import { Flex } from '#/components/common/Flex'
import classNames from 'classnames'
import { Text, Kbd } from '@radix-ui/themes'
import { observer } from 'mobx-react-lite'
import { ChordMenu } from '../ChordMenu'
import { ChordStore } from '#/stores/progressions/createChord'
import { $output } from '#/stores/output/$output'
import { $player } from '#/stores/$player'
import { useAutoChordKeyboard } from '#/hooks/useGlobalChordKeyboard'
import { $input } from '#/stores'

type InnerPropsT = ChordStore & {}

export const InnerProgressionChord = observer((props: InnerPropsT) => {
	if (!props.symbol) return null

	const showOctaveBadge = props.octaveOffset !== 0
	const showInversionBadge = props.inversion !== 0
	const showVoicingBadge = props.voicing !== 'closed'
	const showResetIcon = showOctaveBadge || showInversionBadge || showVoicingBadge
	const keyCode = $input.getKeyCodeForChord(props.id)
	const displayKey = $input.getKeyFromCode(keyCode)
	const isMappedKeyPressed = $input.checkKeyPressed(keyCode)
	const keyPressedClass = isMappedKeyPressed ? 'isPressed' : ''
	const accentsClassName = getAccentColorClassName(props.rootNote)
	const className = classNames('ProgressionChord', accentsClassName, keyPressedClass)

	const onMouseLeave = () => {
		$player.stop(props)
	}

	const preventNativeMenu = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
	}

	const onMouseDown = () => {
		$player.play(props)
	}

	return (
		<Flex.Column
			className={className}
			tabIndex={0}
			onMouseLeave={onMouseLeave}
			onMouseUp={onMouseLeave}
			onMouseDown={onMouseDown}
			onContextMenu={preventNativeMenu}
			p="12px"
			width="100%"
			height="100%"
		>
			<ChordMenu {...props} chord={props}>
				<Flex.Column gap="1">
					<Flex.Row gap="2" align="center" justify="between">
						<Text size="2" weight="bold" className="symbol">
							{props.symbol}
						</Text>
						{displayKey && <Kbd>{displayKey}</Kbd>}
					</Flex.Row>
					{showResetIcon && <ResetIcon className="resetIcon" width="18px" height="18px" />}
				</Flex.Column>
			</ChordMenu>
		</Flex.Column>
	)
})
