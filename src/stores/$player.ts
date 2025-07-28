import { to } from 'await-to-js'
import isEmpty from 'is-empty'
import { observable, action, computed } from 'mobx'
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
	@observable accessor isFullyLoaded = false
	@observable accessor loadingError: string | null = null
	@observable accessor loadingProgress = 0 // 0-100
	@observable accessor currentLoadingStep = ''

	@observable accessor instrumentName = 'acoustic_grand_piano'
	@observable accessor playingSounds = {} as Record<string, PlayingSoundT>

	get instrument() {
		return this.piano
	}

	@computed get canPlaySounds() {
		const result = this.isFullyLoaded && this.piano && this.audioContext
		if (!result) {
			console.log('[canPlaySounds] Not ready:', {
				isFullyLoaded: this.isFullyLoaded,
				hasPiano: !!this.piano,
				hasAudioContext: !!this.audioContext
			})
		}
		return result
	}

	@action setVolume = (volume: number) => {
		console.log('[setVolume] setting volume:', volume)
		this.volume = clampVolume(volume)
	}

	@action loadInstrument = async (name: string) => {
		console.log('[loadInstrument] loading:', name)
		const instrument = this.loadedInstruments[name]
		if (instrument) return console.log('[loadInstrument] already loaded:', name)

		try {
			// Simulate progress for soundfont loading
			const soundfontLoadingInterval = setInterval(() => {
				if (this.loadingProgress < 95) {
					this.loadingProgress += 2
				}
			}, 150)

			const newInstrument = new Soundfont(this.audioContext!, { instrument: name })
			await newInstrument.load
			clearInterval(soundfontLoadingInterval)
			console.log('[loadInstrument] loaded:', { name, instrument: newInstrument })
			this.loadedInstruments[name] = newInstrument
		} catch (error) {
			console.error('[loadInstrument] Failed to load soundfont:', error)
			throw error
		}
	}

	@action initialize = async () => {
		if (this.isInitializing) return
		console.log('[PlayerStore] Initializing audio context and loading instrument')

		try {
			this.isInitializing = true
			this.isLoading = true
			this.loadingError = null
			this.loadingProgress = 0
			this.currentLoadingStep = 'Initializing audio context...'

			const context = new AudioContext()
			this.audioContext = context
			this.loadingProgress = 10

			// Wait for the piano to fully load
			this.currentLoadingStep = 'Loading piano samples...'
			console.log('[PlayerStore] Creating SplendidGrandPiano...')
			this.piano = new SplendidGrandPiano(context, { decayTime: 0.25 })

			// Simulate progress for piano loading since onProgress might not be available
			const pianoLoadingInterval = setInterval(() => {
				if (this.loadingProgress < 65) {
					this.loadingProgress += 2
				}
			}, 100)

			console.log('[PlayerStore] Waiting for piano to load...')
			await this.piano.load
			clearInterval(pianoLoadingInterval)
			console.log('[PlayerStore] Piano loaded successfully')
			this.loadingProgress = 70

			this.currentLoadingStep = 'Loading additional instruments...'
			console.log('[PlayerStore] Loading soundfont instrument...')
			await this.loadInstrument(this.instrumentName)
			console.log('[PlayerStore] Soundfont loaded successfully')
			this.loadingProgress = 100

			this.currentLoadingStep = 'Ready!'
			this.isFullyLoaded = true
			console.log('[PlayerStore] Fully initialized and loaded')
		} catch (error) {
			console.error('[PlayerStore] Failed to initialize:', error)
			this.loadingError = error.message || 'Failed to load audio instruments'
			this.currentLoadingStep = 'Error loading audio'
		} finally {
			this.isLoading = false
			this.isInitializing = false
		}
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
		if (!this.canPlaySounds) {
			console.warn('[PlayerStore] Cannot play sounds - instruments not ready')
			return
		}

		this.audioContext!.resume()
		const options = this.buildPlayNoteArgs(arg)
		const instrument = this.instrument
		if (!this.audioContext) return hmu.noAudioContext()
		if (!instrument) return hmu.noInstrument()

		// const isAlreadyPlaying = this.playingSounds[options.note]
		const stopOptions = {} as StopNoteArgsT
		stopOptions.note = options.note
		stopOptions.fadeOutTime = options.fadeOutTime
		// if (isAlreadyPlaying) hmu.alreadyPlaying(options.note)
		// if (isAlreadyPlaying) this.stopNote(stopOptions)

		try {
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
		} catch (error) {
			// Handle missing samples gracefully
			if (error.message && error.message.includes('Sample not found')) {
				console.warn(
					`[PlayerStore] Sample not found for note: ${options.note}. This may indicate the instrument is still loading.`
				)
			} else {
				console.error('[PlayerStore] Error playing note:', error)
			}
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
		const fadeOutTime = options.fadeOutTime || 0.35 // Default 0.35s quick release
		const playingSound = this.playingSounds[options.note]
		const isNotPlaying = !playingSound
		if (isNotPlaying) return

		if (!this.audioContext) {
			console.warn('No AudioContext available for quick release')
			playingSound.stop()
			delete this.playingSounds[options.note]
			return
		}

		// Use smplr's time parameter for quick release
		// Time is AudioContext currentTime + fade duration
		const stopTime = this.audioContext.currentTime + fadeOutTime
		playingSound.stop({ time: stopTime })
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
		if (!this.canPlaySounds) {
			console.warn('[PlayerStore] Cannot play sounds - instruments not ready')
			return
		}

		const notes = applyBaseOctaveOffset(chord.adjustedNotes || chord.notes)
		const minVelocity = chord.minVelocity || 40
		const maxVelocity = chord.maxVelocity || 80

		// NOTE: Duration...
		const normalizedDuration = this.normalizeDuration(chord.durationBeats)
		const duration = chord.durationBeats || DEFAULT_PLAYER_SETTINGS.duration

		// Stop any existing notes for this chord first to prevent "already playing" warnings
		notes.forEach((note) => {
			if (this.playingSounds[note]) {
				this.stopNote(note)
			}
		})

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

		if (!this.audioContext) {
			console.warn('No AudioContext available for quick release')
			for (const note in this.playingSounds) {
				const playingSound = this.playingSounds[note]
				delete this.playingSounds[note]
				playingSound.stop()
			}
			return
		}

		// Quick release all notes with 0.35s fade
		const quickReleaseTime = this.audioContext.currentTime + 0.35
		for (const note in this.playingSounds) {
			const playingSound = this.playingSounds[note]
			delete this.playingSounds[note]
			playingSound.stop({ time: quickReleaseTime })
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
