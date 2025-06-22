import './ProgressionPanel.css'
import { Flex } from '#/components/layout/Flex'
import { Text } from '@radix-ui/themes'
import { $progression } from '#/stores'
import { ProgressionChord } from './ProgressionChord'
import { useComponentSize } from 'react-use-size'
import { useOnClickOutside } from 'usehooks-ts'
import { Icon } from '../Icon'
import { QwertyTargetIndicator } from '../QwertyTargetIndicator'
import { $progressionPanel } from './$progressionPanel'
import { ProgressionChordControls } from './ProgressionChordControls'
import classNames from 'classnames'
import { ProgressionGrid } from './ProgressionGrid'

export const ProgressionPanel = () => {
	const download = () => {
		$progression.toMidi()
	}

	return (
		<Flex.Column className="ProgressionPanel" gap="12px" p="4" pb="0">
			<Flex.Row className="topRow" justify="between" align="center" width="100%">
				<Flex.Row gap="2" align="center">
					<Icon name="download0" color="white" width="16px" height="16px" onClick={download} />
					<Text size="2" weight="bold">
						PROGRESSION
					</Text>

					<QwertyTargetIndicator target="progression" />
				</Flex.Row>

				<ProgressionChordControls />
			</Flex.Row>

			<ProgressionGrid />
		</Flex.Column>
	)
}
