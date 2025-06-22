import './ChordBrowser.css'
import { Flex } from '#/components/layout/Flex'
import { ProgressionChord } from './ProgressionPanel/ProgressionChord'
import scalesChords from '#/constants/scaleChords.json'
import { $project } from '#/stores/$main'
import { useDatass } from 'datass'
import { useMemo } from 'react'
import { Button, Grid, Text } from '@radix-ui/themes'
import { ChordBlock } from './ChordBlock'
import { $input } from '#/stores'
import { QwertyTargetIndicator } from './QwertyTargetIndicator'
import React from 'react'
import classNames from 'classnames'
import { SuggestionsDialog } from './SuggestionsDialog/SuggestionsDialog'

const PAST_SCALE_CHORDS = {}

const useScaleChords = (scaleSymbol) => {
	const list = scalesChords[scaleSymbol] || []
	return Array.from(new Set(list))
}

export const ChordBrowser = () => {
	const isCompact = useDatass.boolean(true)
	const compactVariant = isCompact.state ? 'solid' : 'outline'
	const toggleCompact = () => isCompact.set.toggle()

	const className = classNames('ChordBrowser', {
		isCompact: isCompact.state
	})

	return (
		<Flex.Column className={className}>
			<Flex.Row className="top" justify="between" align="center" width="100%" p="4" pb="2">
				<Flex.Row gap="2" align="center">
					<Text size="2" weight="bold">
						CHORDS
					</Text>
					<QwertyTargetIndicator target="chords" />
				</Flex.Row>
				<Flex.Row gap="2" align="center">
					<Button size="1" color="violet" variant={compactVariant} onClick={toggleCompact}>
						Compact View
					</Button>
					<SuggestionsDialog />
				</Flex.Row>
			</Flex.Row>
			<ChordsGrid />
		</Flex.Column>
	)
}

const ChordsGrid = React.memo(() => {
	const scaleSymbol = $project.use.lookup<string>('scaleSymbol')
	const scaleChords = useScaleChords(scaleSymbol) as string[]

	return (
		<Grid columns="3" gap="3" rows="repeat(3), var(--blockHeight)" width="auto" p="4">
			{scaleChords.map((chordSymbol, index) => {
				return <ChordBlock key={chordSymbol} symbol={chordSymbol} index={index} />
			})}
		</Grid>
	)
})
