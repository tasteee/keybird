import { WebMidi, Output } from 'webmidi'
import { observable, action, computed, autorun } from 'mobx'
import { createMidiEngine } from '#/modules/midiEngine'
import { $progression } from '#/stores'
import { $pattern } from '../$pattern'

class OutputStore {
	engine = createMidiEngine()

	@observable accessor isSettingUp = false
	@observable accessor isMidiConnected = false
	@observable accessor isPlaying = false
	@observable accessor midiOutputId = ''
	@observable accessor midiOutputIds: string[] = []
	@observable accessor midiOutput: Output | null = null
	@observable accessor midiConnectionError: Error | null = null
	@observable accessor isOutputEnabled = true
	@observable accessor outputType: 'instrument' | 'midi' = 'instrument'

	@computed get isMidiEnabled() {
		return this.midiOutputIds.length > 0
	}

	@computed get midiOutputName() {
		return this.midiOutputId || 'No MIDI Device'
	}

	getMidiOutputIds = () => {
		const getOutputId = (output: Output) => output.id
		return WebMidi.outputs.map(getOutputId)
	}

	@action initializeMidi = async () => {
		console.log('[initializeMidi] setting up MIDI')
		await WebMidi.enable()
		const ids = this.getMidiOutputIds()
		$output.isMidiConnected = true
		$output.midiOutputIds = ids
		$output.midiOutputId = ids[0] || ''
		$output.midiOutput = ids[0] ? WebMidi.getOutputById(ids[0]) : null
		console.log('[handleMidiEnabled]', { ids })
	}

	@action initialize = async () => {
		console.log('[OutputStore] Initializing MIDI output')
		const isAlreadySettingUp = this.isSettingUp
		if (isAlreadySettingUp) return

		this.isSettingUp = true
		await this.initializeMidi()
		this.isSettingUp = false
	}

	@action setMidiOutput = (args: { outputId: string }) => {
		this.midiOutputId = args.outputId
	}

	@action perform = () => {
		if ($progression.steps.length === 0) {
			console.warn('No steps in progression to play.')
			return
		}

		console.log('Engine isPlaying:', this.engine.isPlaying)
		console.log('Progression steps:', $progression.steps.length)
		console.log('Output enabled:', this.isOutputEnabled)
		console.log('Output type:', this.outputType)

		if (this.engine.isPlaying) {
			console.log('was playing. stopping.')
			this.engine.stop()
			return
		}

		// Extract signals from the pattern store and send to engine
		const signals = Object.values($pattern.signalMap)
		console.log('Setting signals count:', signals.length)
		this.engine.setSignals(signals)
		console.log('playing progression')
		this.engine.play()
	}
}

export const $output = new OutputStore()
globalThis.$output = $output

// Auto-sync signals with MIDI engine whenever signalMap changes
autorun(() => {
	const signals = Object.values($pattern.signalMap)
	$output.engine.setSignals(signals)
})
