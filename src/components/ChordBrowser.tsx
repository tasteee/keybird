import './ChordBrowser.css'
import { Flex } from '#/components/common/Flex'
import { Button, IconButton, Text } from '@radix-ui/themes'
import { ChordBlock } from './ChordBlock'
import { $input } from '#/stores'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { $settings } from '#/stores/$settings'
import { $chords } from '#/stores/$chords'
import { Icon } from '@iconify/react'
import { useWait } from '#/modules/useWait'

export const ChordBrowser = observer(() => {
	const isCompact = $settings.isChordBrowserCompact
	const compactVariant = isCompact ? 'solid' : 'soft'
	const toggleCompact = () => $settings.toggleChordBrowserCompact()
	const qwertyTarget = $input.qwertyPerformTarget

	const className = classNames('ChordBrowser', {
		isCompact: isCompact
	})

	return (
		<Flex.Column className={className}>
			<Flex.Row className="controlBar" justify="between" align="center" width="100%" p="6" pb="2">
				<Flex.Row gap="2" align="center">
					<Text size="2" weight="bold">
						CHORDS <span>({$chords.chords.length})</span>
					</Text>
				</Flex.Row>
				<Flex.Row gap="2" align="center">
					<Button size="1" highContrast variant={compactVariant} onClick={toggleCompact}>
						Compact View
					</Button>
					<Button size="1" highContrast variant="soft" onClick={$chords.shuffleChords}>
						Shuffle
					</Button>
					<BrowserActionIcons />
				</Flex.Row>
			</Flex.Row>

			<ChordsGrid />
		</Flex.Column>
	)
})

const BrowserActionIcons = () => {
	return (
		<Flex.Row className="BrowserActionIcons" gap="2" align="center">
			<IconButton onClick={$chords.reset} variant="soft">
				<Icon icon="material-symbols:device-reset" width="18px" height="18px" />
			</IconButton>
			<IconButton onClick={$chords.reset} variant="soft">
				<Icon icon="iconoir:dice-six" width="18px" height="18px" />
			</IconButton>
		</Flex.Row>
	)
}

// Will update whenever key / scale changes by the user.
// Will also update whenever shuffle is applied.
const ChordsGrid = observer(() => {
	const shouldRender = useWait(200)
	if (!shouldRender) return null

	return (
		<Flex.Row className="ChordGrid" gap="3" p="4" pl="8" wrap="wrap" pb="40px">
			{$chords.chords.map((chord, index) => {
				return <ChordBlock key={chord.id} id={chord.id} index={index} />
			})}
		</Flex.Row>
	)
})
