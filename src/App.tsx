import '@radix-ui/themes/styles.css'
import './styles/reset.css'
import './styles/index.css'
import './styles/theme.css'
import './styles/variables.css'
import './styles/purpleTheme.css'
import './styles/fonts.css'

import { GrayTheme } from './components/layout/Themes'
import { Route, Switch, useLocation } from 'wouter'
import { Main } from './views/main/Main'
import { TopBar } from './components/MainMenuBar/TopBar'
import { Flex } from '#/components/layout/Flex'
import './modules/scales'

export const App = () => {
	const [location] = useLocation()

	return (
		<GrayTheme id="App" data-testid="App" className="App">
			<Flex.Column asChild data-testid="Router" data-location={location} height="100%">
				<main>
					<TopBar />
					<Switch>
						<Route component={Main} />
					</Switch>
					<GlowPixels />
				</main>
			</Flex.Column>
		</GrayTheme>
	)
}

// Make it look cool. That is all.
const GlowPixels = () => {
	return (
		<>
			<span className="pixel0"> </span>
			<span className="pixel1"> </span>
			<span className="pixel2"> </span>
		</>
	)
}
