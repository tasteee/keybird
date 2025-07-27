import React, { useEffect } from 'react'
import { GrayTheme } from './components/common/Themes'
import { Router } from './views/Router'
import { $input, $progression, $player, $project, $pattern } from './stores'
import { $output } from './stores/output/$output'
import { QWERTY_CHORD_KEYS } from './hooks/useGlobalChordKeyboard'
import { observer } from 'mobx-react-lite'
import { $chords } from './stores/$chords'
import { midiEngine } from './modules/midiEngine'

export const App = () => {
	return (
		<GrayTheme id="App">
			<InitBranch />
			<Router />
			<GlowPixels />
			<KbdController />
		</GrayTheme>
	)
}

const InitBranch = React.memo(() => {
	React.useEffect(() => {
		$output.initialize()
		$player.initialize()

		midiEngine.update({
			progression: $progression,
			project: $project,
			pattern: $pattern
		})
	}, [])

	return null
})

// Reacts to changes to qwertyPerformTarget
// so when it updates it remaps the qwertyChordMap.
// Based on which target, maps the chords of that
// target in order to QWERTY_CHORD_KEYS and updates
// $input store.
const KbdController = observer(() => {
	const qwertyTarget = $input.qwertyPerformTarget
	const className = `qwerty-target-${qwertyTarget}`

	const browserChords = $chords.chords
	const progressionChords = $progression.steps
	const targetChords = qwertyTarget === 'chords' ? browserChords : progressionChords

	useEffect(() => {
		const qwertyChordMap = QWERTY_CHORD_KEYS.reduce((final, key, index) => {
			final[key] = targetChords[index]
			return final
		}, {})

		$input.setQwertyChordMap(qwertyChordMap)
	}, [targetChords])

	return <div className={className} />
})

// Make it look cool. That is all.
const GlowPixels = () => {
	return (
		<span id="pixelsOverlay">
			<span className="pixel0"> </span>
			<span className="pixel1"> </span>
			<span className="pixel2"> </span>
		</span>
	)
}
