import './Main.css'

import { Switch, Route } from 'wouter'
import { ChordBrowser } from '../components/ChordBrowser'
import { PatternEditor } from './patterns/PatternEditor'
import { OutputControlsRow } from '../components/MainControls'
import { TopBar } from '#/components/TopBar'
import { ProgressionPanel } from '#/components/ProgressionPanel/ProgressionPanel'
import { $input } from '#/stores/$input'

export const Router = () => {
	return (
		<Switch>
			<Route path="/app" nest component={AuthedRouter} />
			<Route path="/" nest component={AuthedRouter} />
		</Switch>
	)
}

const AuthedRouter = () => {
	return (
		<>
			<TopBar />
			<Switch>
				<Route path="/chords" component={ChordBrowser} />
				<Route path="/progressions" component={ChordBrowser} />
				<Route path="/progressions/browse" component={ChordBrowser} />
				<Route path="/patterns" component={PatternEditor} />
				<Route path="/patterns/browse" component={PatternEditor} />
				<Route path="/patterns/create" component={PatternEditor} />
				<Route path="/patterns/edit/:id" component={PatternEditor} />
			</Switch>
			<ProgressionPanel />
			<OutputControlsRow />
		</>
	)
}

window.addEventListener('keydown', (event) => {
	// console.log('Key down:', event.key, event.code, event)
	if (event.key === '`') {
		const isChords = $input.qwertyPerformTarget.state === 'chords'
		$input.qwertyPerformTarget.set(isChords ? 'progression' : 'chords')
	}
})
