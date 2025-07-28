import { $output } from '#/stores/output/$output'
import { $player } from '#/stores/$player'
import { $progression } from '#/stores/$progression'
import { $progressionPanel } from '#/components/ProgressionPanel/$progressionPanel'
import { action, autorun, computed, observable, observe } from 'mobx'
import { computedFn } from 'mobx-utils'
import { midiEngine } from '#/modules/midiEngine'
import { $pattern } from './$pattern'
import { $project } from './$project'
import { just } from '#/modules/just'

// IDEA: Instead of iterating so much shit...
// What if we stored both QWERTY_CHORD_KEYS string[]
// and chords ChordT[], and when we needed the keycode
// for a chord, we would do chords.indexOf(chord.id)
// and use that index to then do QWERTY_CHORD_KEYS[index]?

const FINAL_KEY_MAP = {
	BracketLeft: '[',
	BracketRight: ']',
	Minus: '-',
	Equal: '=',
	Semicolon: ';',
	Quote: "'",
	Backslash: '\\',
	Comma: ',',
	Period: '.',
	Slash: '/'
}

class InputStore {
	@observable accessor pressedKeyCodes = []
	@observable accessor qwertyChordMap = {} as Record<string, ChordT>
	@observable accessor qwertyPerformTarget = 'chords'

	checkKeyPressed = computedFn((code: string) => {
		return this.pressedKeyCodes.includes(code)
	})

	// Map of special key codes to their display symbols

	getKeyFromCode = (keyCode: string = '') => {
		// First remove "Key" and "Digit" prefixes
		const cleanedKey = keyCode.replace('Key', '').replace('Digit', '')
		// Then check if the key needs to be mapped to a special symbol
		return FINAL_KEY_MAP[cleanedKey] || cleanedKey
	}

	getKeyCodeForChord = computedFn((chordId: string) => {
		const entries = Object.entries(this.qwertyChordMap)

		for (const [key, chord] of entries) {
			const id = chord?.id
			if (!id) debugger
			if (id !== chordId) continue
			return key
		}
	})

	@computed get isShiftPressed() {
		const isShiftRight = this.pressedKeyCodes.includes('ShiftRight')
		const isShiftLeft = this.pressedKeyCodes.includes('ShiftLeft')
		return isShiftRight || isShiftLeft
	}

	@computed get isAltPressed() {
		const isAltRight = this.pressedKeyCodes.includes('AltRight')
		const isAltLeft = this.pressedKeyCodes.includes('AltLeft')
		return isAltRight || isAltLeft
	}

	@computed get isCtrlPressed() {
		const isCtrlRight = this.pressedKeyCodes.includes('ControlRight')
		const isCtrlLeft = this.pressedKeyCodes.includes('ControlLeft')
		return isCtrlRight || isCtrlLeft
	}

	@computed get isModifierPressed() {
		return this.isShiftPressed || this.isAltPressed || this.isCtrlPressed
	}

	@action setPressedKeyCode = (code: string, value: boolean) => {
		const isPresent = this.pressedKeyCodes.includes(code)
		const index = this.pressedKeyCodes.indexOf(code)
		if (!value && isPresent) return this.pressedKeyCodes.splice(index, 1)
		if (value && isPresent) return
		if (!isPresent && value) this.pressedKeyCodes.push(code)
	}

	@action togglePressedKeyCode = (code: string) => {
		const isActive = this.pressedKeyCodes.includes(code)
		if (!isActive) return this.pressedKeyCodes.push(code)
		this.pressedKeyCodes.splice(this.pressedKeyCodes.indexOf(code), 1)
	}

	@action setQwertyPerformTarget = (target: 'chords' | 'progression') => {
		this.qwertyPerformTarget = target
	}

	@action setQwertyChordMap = (map: Record<string, ChordT>) => {
		this.qwertyChordMap = map
	}

	constructor() {
		this.start()
	}

	start = () => {
		window.addEventListener('keydown', this.handleKeyDown)
		window.addEventListener('keyup', this.handleKeyUp)
	}

	stop = () => {
		window.removeEventListener('keydown', this.handleKeyDown)
		window.removeEventListener('keyup', this.handleKeyUp)
	}

	handleKeyUp = (event: KeyboardEvent) => {
		const chord = this.qwertyChordMap[event.code]
		this.setPressedKeyCode(event.code, false)
		if (!chord) return
		$player.stop(chord)
	}

	handleKeyDown = (event: KeyboardEvent) => {
		const isInputFocused = this.checkIsInputElement(event.target)
		const chord = this.qwertyChordMap[event.code]

		if (event.repeat) return
		if (isInputFocused) return

		// Handle progression chord selection navigation
		const selectedChordId = $progressionPanel.selectedChordId
		const hasSelectedChord = selectedChordId !== ''

		if (hasSelectedChord) {
			const steps = $progression.steps
			const selectedIndex = steps.findIndex((step) => step.id === selectedChordId)
			const hasValidSelection = selectedIndex !== -1

			if (hasValidSelection) {
				const canMoveLeft = selectedIndex > 0
				const canMoveRight = selectedIndex < steps.length - 1

				// Handle arrow keys for moving selected chord
				if (event.code === 'ArrowLeft' && canMoveLeft) {
					event.preventDefault()
					$progression.moveStepLeft(selectedChordId)
					return
				}

				if (event.code === 'ArrowRight' && canMoveRight) {
					event.preventDefault()
					$progression.moveStepRight(selectedChordId)
					return
				}

				// Handle delete/backspace for removing selected chord
				if (event.code === 'Backspace' || event.code === 'Delete') {
					event.preventDefault()
					$progressionPanel.setSelectedChordId('') // Clear selection after deletion
					$progression.deleteStep(selectedChordId)
					return
				}
			}
		}

		// Handle space key for playback toggle
		if (event.code === 'Space') {
			event.preventDefault()
			const isPlaying = midiEngine.isPlaying
			if (isPlaying) return midiEngine.stop()
			return midiEngine.start()
		}

		this.setPressedKeyCode(event.code, true)
		if (!chord) return

		$player.play(chord)
	}

	checkIsInputElement = (target: EventTarget) => {
		const isInput = target instanceof HTMLInputElement
		const isTextArea = target instanceof HTMLTextAreaElement
		const isEditable = target instanceof HTMLElement && target.contentEditable === 'true'
		return isInput || isTextArea || isEditable
	}
}

export const $input = new InputStore()

export const setUp = () => {
	let isSetUp = false

	const updateMidiEngine = () => {
		console.log('about to update midi engine')
		if (!midiEngine.isReady) return console.warn('engine not ready')
		console.log('sending stores to engine.....')

		midiEngine.update({
			pattern: $pattern,
			progression: $progression,
			project: $project
		})
	}

	// Initial setup with autorun for comprehensive updates
	autorun(() => {
		// Pattern dependencies
		const lengthBeats = $pattern.lengthBeats
		const signalMap = $pattern.signalMap
		const toneMap = $pattern.toneMap
		// const octave = $pattern.octave
		// const selectedSignalId = $pattern.selectedSignalId
		// const cellWidth = $pattern.cellWidth

		// Progression dependencies
		const lengthBars = $progression.lengthBars
		const steps = $progression.steps
		const id = $progression.id

		// Project dependencies
		const ppq = $project.ppq
		const bpm = $project.bpm
		// const scaleRootNote = $project.scaleRootNote
		// const scaleType = $project.scaleType
		// const baseOctave = $project.baseOctave

		console.log('Autorun triggered - updating midi engine with all dependencies')
		midiEngine.update({
			pattern: { ...$pattern, lengthBeats, signalMap, toneMap },
			progression: { ...$progression, steps, lengthBars, id },
			project: { ...$project, bpm, ppq }
		})
	})

	const clicker = just.throttle(200, () => {
		console.log('INITIAL CLICK SETUP')
		if (isSetUp) return
		isSetUp = true
		console.log('removing click event listener')
		window.removeEventListener('click', clicker)
		console.log('setup complete - autorun will handle all updates')
	})

	window.addEventListener('click', clicker)
}
