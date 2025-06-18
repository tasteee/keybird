import './ChordBrowser.css'
import { Flex } from '#/components/layout/Flex'
import { MiniChordBlock } from './MiniChordBlock'
import scalesChords from '#/constants/scaleChords.json'
import { $project } from '#/stores/$main'
import { useDatass } from 'datass'
import { useMemo } from 'react'
import { Grid } from '@radix-ui/themes'
import { ChordBlock } from './ChordBlock'

const PAST_SCALE_CHORDS = {}

const useScaleChords = (scaleSymbol) => {
	console.log('useScaleChords', scaleSymbol, scalesChords, scalesChords[scaleSymbol])
	const list = scalesChords[scaleSymbol] || []
	return Array.from(new Set(list))
}

export const ChordBrowser = () => {
	const scaleSymbol = $project.use.lookup<string>('scaleSymbol')
	const scaleChords = useScaleChords(scaleSymbol) as string[]
	console.log('scaleChords', scaleChords)

	return (
		<Flex.Column className="ChordBrowser">
			<Grid columns="3" gap="3" rows="repeat(3, 100px)" width="auto" p="24px">
				{scaleChords.map((chordSymbol) => {
					return <ChordBlock key={chordSymbol} symbol={chordSymbol} />
				})}
			</Grid>
		</Flex.Column>
	)
}
