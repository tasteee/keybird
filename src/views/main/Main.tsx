import './Main.css'

import { Flex } from '#/components/layout/Flex'
import { MainControls, OutputControlsRow } from './MainControls'
import { PatternEditor } from './PatternEditor'
import { Route, Switch } from 'wouter'
import { ChordBrowser } from './ChordBrowser'
import { ChordProgression } from './ChordProgression'

const MainRouter = () => {
	return (
		<Flex.Column className="MainRouter">
			<Switch>
				<Route path="/" component={ChordBrowser} />
				<Route path="/patternEditor" component={PatternEditor} />
			</Switch>
		</Flex.Column>
	)
}

export const Main = () => {
	return (
		<Flex.Column data-testid="MainView" className="MainView" pb="32px" height="100%">
			<MainRouter />
			<ChordProgression />
			<OutputControlsRow />
		</Flex.Column>
	)
}
