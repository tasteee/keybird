import { to } from 'await-to-js'
import isEmpty from 'is-empty'
import { observable, action } from 'mobx'
import { Soundfont, SplendidGrandPiano } from 'smplr'
import { numbers } from '#/modules/numbers'
import { applyBaseOctaveOffset } from '#/modules/applyBaseOctaveOffset'
import { DEFAULT_PLAYER_SETTINGS } from '#/constants'

const hmu = {
	noAudioContext: () => console.warn('No AudioContext available'),
	noInstrument: () => console.warn('No instrument loaded'),
	alreadyPlaying: (note: string) => console.warn(`Note ${note} is already playing`)
}

type PlayingSoundT = {
	note: string
	stop: any
	startTime: number
}

type PlayNoteArgsT = {
	note: string
	velocity?: number // 0-100
	minVelocity?: number // 0-100
	maxVelocity?: number // 0-100
	duration?: number // ms
	fadeOutTime?: number // ms
}

type StopNoteArgsT = {
	note: string
	fadeOutTime?: number // ms
}

type StopNoteSoundWithFadeArgsT = {
	note: string
	fadeOutTime?: number
}

type CreateNoteIdArgsT = {
	note: string
}

type PlayChordOptionsT = {
	velocity?: number
	duration?: number
}

const clampVolume = numbers.createClamp({
	min: 0,
	max: 100
})

const clampVelocity = numbers.createClamp({
	min: 0,
	max: 100
})

class PlayerStore {
	audioContext: AudioContext | null = null
	loadedInstruments: Record<string, Soundfont> = {}
	piano: SplendidGrandPiano | null = null

	@observable accessor volume = 50
	@observable accessor pan = 0

	@observable accessor isLoading = false
	@observable accessor isInitializing = false

	@observable accessor instrumentName = 'acoustic_grand_piano'
	@observable accessor playingSounds = {} as Record<string, PlayingSoundT>

	get instrument() {
		return this.piano
		const instrument = this.loadedInstruments[this.instrumentName]
		if (instrument) return instrument
		console.warn(`Instrument ${this.instrumentName} not loaded`)
		return null
	}

	@action setVolume = (volume: number) => {
		console.log('[setVolume] setting volume:', volume)
		this.volume = clampVolume(volume)
	}

	@action loadInstrument = async (name: string) => {
		console.log('[loadInstrument] loading:', name)
		const instrument = this.loadedInstruments[name]
		if (instrument) return console.log('[loadInstrument] already loaded:', name)

		const newInstrument = new Soundfont(this.audioContext!, { instrument: name })
		console.log('[loadInstrument] loaded:', { name, instrument: newInstrument })
		this.loadedInstruments[name] = newInstrument
	}

	@action initialize = async () => {
		if (this.isInitializing) return
		console.log('[PlayerStore] Initializing audio context and loading instrument')
		const context = new AudioContext()
		this.isInitializing = true
		this.audioContext = context
		this.isLoading = true
		this.piano = await new SplendidGrandPiano(context, { decayTime: 0.25 })
		await this.loadInstrument(this.instrumentName)
		this.isLoading = false
		this.isInitializing = false
	}

	@action selectInstrument = async (instrumentName: string) => {
		console.log('[⏲️ selectInstrument] selecting instrument:', instrumentName)
		this.instrumentName = instrumentName
		this.loadInstrument(instrumentName)
	}

	buildPlayNoteArgs = (args: string | PlayNoteArgsT): PlayNoteArgsT => {
		const isString = typeof args === 'string'
		const note = isString ? args : args.note
		const options = (isString ? {} : args) as PlayNoteArgsT
		const velocityValue = options.velocity || DEFAULT_PLAYER_SETTINGS.velocity

		const velocity = clampVelocity(velocityValue)
		const duration = options.duration ?? DEFAULT_PLAYER_SETTINGS.duration
		const fadeOutTime = options.fadeOutTime ?? DEFAULT_PLAYER_SETTINGS.fadeOutTime

		return {
			...options,
			note,
			velocity,
			duration,
			fadeOutTime
		}
	}

	// $player.playNote({ note: 'C4', velocity: 80, duration: 1250 })
	// $player.playNote({ note: 'C4', velocity: 80 })
	// $player.playNote('C3')
	playNote = (arg: string | PlayNoteArgsT) => {
		this.audioContext!.resume()
		const options = this.buildPlayNoteArgs(arg)
		const instrument = this.instrument
		if (!this.audioContext) return hmu.noAudioContext()
		if (!instrument) return hmu.noInstrument()

		const isAlreadyPlaying = this.playingSounds[options.note]
		const stopOptions = {} as StopNoteArgsT
		stopOptions.note = options.note
		stopOptions.fadeOutTime = options.fadeOutTime
		if (isAlreadyPlaying) hmu.alreadyPlaying(options.note)
		if (isAlreadyPlaying) this.stopNote(stopOptions)

		const stop = instrument.start({
			note: options.note,
			velocity: options.velocity,
			duration: options.duration
		})

		this.playingSounds[options.note] = {
			startTime: this.audioContext.currentTime,
			note: options.note,
			stop
		}
	}

	buildStopOptions = (arg: string | StopNoteArgsT): StopNoteArgsT => {
		const isString = typeof arg === 'string'
		const note = isString ? arg : arg.note
		const options = (isString ? {} : arg) as PlayNoteArgsT
		const fadeOutTime = options.fadeOutTime ?? DEFAULT_PLAYER_SETTINGS.fadeOutTime

		return {
			note,
			fadeOutTime
		}
	}

	stop = (arg?: string | StopNoteArgsT | ChordT | ProgressionChordT) => {
		if (!arg) {
			this.stopAllNotes()
			return
		}

		const isString = typeof arg === 'string'
		if (isString) {
			this.stopNote(arg)
			return
		}

		const isChord = 'notes' in arg || 'adjustedNotes' in arg
		if (isChord) {
			this.stopChord(arg as ChordT | ProgressionChordT)
			return
		}

		this.stopNote(arg as StopNoteArgsT)
	}

	play = (arg: string | ChordT | ProgressionChordT | PlayNoteArgsT) => {
		const isString = typeof arg === 'string'
		if (isString) return this.playNote(arg)
		const isChord = 'adjustedNotes' in arg
		if (isChord) return this.playChord(arg as ChordT | ProgressionChordT)
		this.playNote(arg as PlayNoteArgsT)
	}

	stopNote = (arg: string | StopNoteArgsT) => {
		const options = this.buildStopOptions(arg)
		const fadeOutTime = options.fadeOutTime
		const playingSound = this.playingSounds[options.note]
		const isNotPlaying = !playingSound
		if (isNotPlaying) return

		// For now, let's try the most common smplr API pattern
		// smplr typically uses no parameters for natural release
		playingSound.stop()
		delete this.playingSounds[options.note]
	}

	normalizeDuration = (duration: number): number => {
		// beats to normal duration value to pass to play note I think...

		if (typeof duration === 'string') {
			const parsed = parseFloat(duration)
			if (!isNaN(parsed)) return parsed
			return 0
		}
		return duration
	}

	playChord = (chord: ChordT | ProgressionChordT) => {
		const notes = applyBaseOctaveOffset(chord.adjustedNotes || chord.notes)
		const minVelocity = chord.minVelocity || 40
		const maxVelocity = chord.maxVelocity || 80

		// NOTE: Duration...
		const normalizedDuration = this.normalizeDuration(chord.durationBeats)
		const duration = chord.durationBeats || DEFAULT_PLAYER_SETTINGS.duration

		notes.forEach((note, index) => {
			// Random velocity between min and max
			const velocity = Math.floor(Math.random() * (maxVelocity - minVelocity + 1)) + minVelocity

			// Tighter stagger (1-3ms per note) for more cohesive chord sound
			const staggerDelay = numbers.randomInt({
				min: 1,
				max: 2
			})

			setTimeout(() => {
				this.playNote({ note, velocity, duration })
			}, staggerDelay)
		})
	}

	// stopChord({ adjustedNotes: [C3, E3, G3], ... })
	@action stopChord = (chord: ChordT | ProgressionChordT) => {
		const notes = applyBaseOctaveOffset(chord.adjustedNotes || chord.notes)
		notes.forEach(this.stopNote)
	}

	@action stopAllNotes = async () => {
		const isPlayingSoundsEmpty = isEmpty(this.playingSounds)
		if (isPlayingSoundsEmpty) return

		for (const note in this.playingSounds) {
			const playingSound = this.playingSounds[note]
			delete this.playingSounds[note]
			to(playingSound.stop())
		}
	}

	performChord = (args: { notes: PerformedNoteT[] }) => {
		args.notes.forEach((note) => {
			const hasStartAndEndTimes = note.absoluteEndMs && note.absoluteStartMs
			if (!hasStartAndEndTimes) return

			const duration = (note.absoluteEndMs - note.absoluteStartMs) / 1000
			const time = this.audioContext!.currentTime + note.absoluteStartMs / 1000
			const velocity = note.velocity || 65

			setTimeout(() => {
				const noteValue = note.note
				if (!noteValue) return
				this.playNote({ note: noteValue, velocity, duration })
			}, note.absoluteStartMs)
		})
	}
}

export const $player = new PlayerStore()
globalThis.$player = $player
