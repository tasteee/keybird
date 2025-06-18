import { Flex } from '#/components/layout/Flex'
import { Grid } from '@radix-ui/themes'
import { ChordProgression } from '../main/ChordProgression'
import { OutputControlsRow } from '../main/MainControls'

export const ChordsViewLayout = () => {
	return (
		<Flex.Column className="MainView" pb="30px" height="94vh">
			<MainRouter />
			<ChordProgression />
			<OutputControlsRow />
		</Flex.Column>
	)
}

const ChordBrowser = () => {
	return <Grid columns="3" gap="3" rows="repeat(2, 64px)" width="auto"></Grid>
}
