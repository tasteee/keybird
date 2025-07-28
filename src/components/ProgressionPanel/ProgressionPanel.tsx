import './ProgressionPanel.css'
import { Flex } from '#/components/common/Flex'
import { IconButton, Text } from '@radix-ui/themes'
import { $progression, $project } from '#/stores'
import { $output } from '#/stores/output/$output'
import { Icon } from '../common/Icon'
import { ProgressionChordControls } from './ProgressionChordControls'
import { ProgressionGrid } from './ProgressionGrid'
import { observer } from 'mobx-react-lite'
import { downloadMidiProgression } from '#/modules/toMidi'
import { midiEngine } from '#/modules/midiEngine'
import classNames from 'classnames'

export const ProgressionPanel = observer(() => {
	const shouldShowLeftControls = $progression.steps.length > 0

	const download = () => {
		downloadMidiProgression({ project: $project, progression: $progression })
	}

	const classNamne = classNames('playButton', {
		isPlaying: midiEngine.isPlaying
	})

	return (
		<Flex.Column className="ProgressionPanel" px="8" gap="12px" pb="6px" pt="6px">
			<Flex.Row className="topRow" justify="between" align="center" width="100%" height="40px">
				<Flex.Row gap="2" align="center">
					{shouldShowLeftControls && (
						<div className={classNamne} onClick={() => (midiEngine.isPlaying ? midiEngine.stop() : midiEngine.start())}>
							<Icon name={midiEngine.isPlaying ? 'si:stop-fill' : 'iconoir:play-solid'} color="black" width="16px" height="16px" />
						</div>
					)}

					<Text size="2" weight="bold">
						PROGRESSION
					</Text>

					{shouldShowLeftControls && (
						<IconButton variant="ghost" size="2" onClick={download} style={{ marginLeft: '4px' }}>
							<Icon name="download0" color="white" width="16px" height="16px" />
						</IconButton>
					)}

					<IconButton variant="ghost" size="2" onClick={() => $progression.addRest()} style={{ marginLeft: '8px' }}>
						<Icon name="mynaui:moon-star-solid" color="white" width="16px" height="16px" />
					</IconButton>
				</Flex.Row>

				<ProgressionChordControls />
			</Flex.Row>

			<ProgressionGrid />
		</Flex.Column>
	)
})
