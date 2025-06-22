import '@radix-ui/themes/styles.css'
import './styles/reset.css'
import './styles/index.css'
import './styles/theme.css'
import './styles/variables.css'
import './styles/purpleTheme.css'
import './styles/fonts.css'
import './styles/accents.css'

import { GrayTheme } from './components/layout/Themes'
import './modules/scales'
import { Router } from './views/Router'
import { $input } from './stores'
import { demonstrateStrategies } from './modules/patterns/apply'

demonstrateStrategies()

export const App = () => {
	return (
		<GrayTheme id="App">
			<Router />
			<GlowPixels />
			<KbdController />
		</GrayTheme>
	)
}

const KbdController = () => {
	const qwertyTarget = $input.qwertyPerformTarget.use()
	const className = `qwerty-target-${qwertyTarget}`
	return <div className={className} />
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
