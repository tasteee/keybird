import { to } from 'await-to-js'
import { parse, SoundFont } from '@marmooo/soundfont-parser'
import { numbers } from './numbers'

const STOCK_INSTRUMENT_URLS = {
	bigTune: 'soundfonts/BigTune.sf2',
	CTK533Piano100Casio: 'soundfonts/CTK-533_Piano1__00___Casio_.sf2',
	kazoo: 'soundfonts/Kazoo.sf2',
	meowsynth: 'soundfonts/Meowsynth.sf2',
	NFLQuarterbackClub96SegaSaturn: 'soundfonts/NFL_Quarterback_Club_96_-_Sega_Saturn.sf2',
	nokia7100SuperNova: 'soundfonts/Nokia_7100_SuperNova.sf2',
	nyxSC88Horns: 'soundfonts/Nyx_SC-88_Horns.sf2',
	ODCV2: 'soundfonts/ODC_V2.9.sf2',
	ODC: 'soundfonts/ODC.sf2',
	overdrivenGuitarPack: 'soundfonts/Overdriven_Guitar_Pack.sf2',
	rolandSC88BlownBottleC5: 'soundfonts/Roland-SC-88-Blown-Bottle-C5.sf2',
	SCXProTmp: 'soundfonts/SCX_Pro_tmp.sf2',
	steinwayConcertPiano: 'soundfonts/steinway_concert_piano.sf2',
	synthChoir: 'soundfonts/Synth_Choir.sf2',
	taitoBalloonBomber: 'soundfonts/TaitoBalloonBomber.sf2',
	u220MV30FantaBell: 'soundfonts/U220___MV-30_Fanta_Bell.sf2',
	voxatro: 'soundfonts/voxatron.sf',
	Earthbound: 'soundfonts/Earthbound_NEW.sf2'
}

const DEFAULT_SETTINGS = {
	gain: 80,
	velocity: 80,
	maxVelocity: 80,
	minVelocity: 60,
	octave: 3,
	pan: 0
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const lazyResolve = (callback) => {
	const data = { hasResolved: false, resolvedValue: null }

	const resolver = async (...args) => {
		if (data.hasResolved) return data.resolvedValue
		data.resolvedValue = await callback(...args)
		resolver.data = data.resolvedValue
		return data.resolvedValue
	}

	return resolver
}

const loadTone = lazyResolve(() => import('tone'))

const fetchSoundfont = async (url) => {
	const [error, response] = await to(fetch(url))
	// imagine we do error handling here. but there is no error.
	const arrayBuffer = await response?.arrayBuffer()
	const buffer = new Uint8Array(arrayBuffer)
	const parsed = parse(buffer)
	const soundFont = new SoundFont(parsed)
	return soundFont
}

const generateVelocities = (notes, playSettings, defaults) => {
	const { minVelocity, maxVelocity, velocity } = playSettings

	const hasStaticVelocity = numbers.hasNumberProperty('velocity')
	const hasMin = numbers.hasNumberProperty('minVelocity')
	const hasMax = numbers.hasNumberProperty('maxVelocity')

	// If a static velocity is provided, each note gets that velocity.
	const getStaticVelocity = () => numbers.clampVelocity(velocity)
	if (hasStaticVelocity) return notes.map(getStaticVelocity)

	// If no static velocity, minVelocity, or maxVelocity was provided,
	// then each note gets the instrument's default velocity.
	if (!hasMin && !hasMax) return notes.map(() => defaults.velocity)

	// If one of minVelocity or maxVelocity was provided, then
	// that indicates that we need to randomize the velocity
	// for each note between the range of min/max, defaulting
	// either one that was not specified.
	const defaultMin = numbers.clampVelocity(defaults.minVelocity)
	const defaultMax = numbers.clampVelocity(defaults.maxVelocity)

	// Derive the final values from clamping the provided min/max
	// value if it exists, or falling back to the default for that value.
	const minValue = hasMin ? numbers.clampVelocity(minVelocity) : defaultMin
	const maxValue = hasMax ? numbers.clampVelocity(maxVelocity) : defaultMax
	const getRandomVelocity = () => random.int(minValue, maxValue)
	return notes.map(getRandomVelocity)
}

export const createInstrument = async (name, url, settings = {}) => {
	const instrument = {}

	instrument.args = settings
	instrument.args.name = name
	instrument.args.url = url

	instrument.activeNotes = new Map()
	instrument.id = crypto.randomUUID()
	instrument.name = name
	instrument.samples = {}

	instrument.settings = {
		...DEFAULT_SETTINGS,
		...instrument.settings,
		...settings
	}

	const tone = await loadTone()
	const [error, soundfont] = await to(fetchSoundfont(url))
	if (error) return console.error('Failed to load soundfont:', error)
	instrument.soundfont = soundfont

	const channelVolume = tone.gainToDb(instrument.settings.gain / 100) // 0 to 100 -> 0 to 1
	const channelPan = (instrument.settings.pan / 100) * 2 - 1 // 0 to 100 -> -1 to 1

	instrument.masterChannel = new tone.Channel({
		volume: channelVolume,
		pan: channelPan
	}).toDestination()

	instrument.noteToKey = (note) => {
		const octave = parseInt(note.slice(-1))
		const noteName = note.slice(0, -1)
		const incrementedOctave = octave + 1
		const noteIndex = NOTES.indexOf(noteName)
		return 12 * incrementedOctave + noteIndex
	}

	instrument.play = (target, playSettings = {}) => {
		const isTargetArray = Array.isArray(target)
		const notes = isTargetArray ? target : [target]
		const finalSettings = { ...instrument.settings, ...playSettings }
		const velocities = generateVelocities(notes, playSettings, finalSettings)

		notes.forEach((note, index) => {
			const isPlaying = instrument.activeNotes.has(note)
			if (isPlaying) instrument.stop(note)

			const key = instrument.noteToKey(note)
			const velocity = velocities[index]
			const velocityOnScale127 = velocity / 127
			const voice = instrument.soundfont.getVoice(0, 0, key, velocity)
			if (!voice) return console.warn(`No voice found for note ${note}`)
			const params = voice.getAllParams(new Float32Array(256))

			// Fix: Properly convert the sample data
			const sampleData = new Int16Array(voice.sample.buffer)
			const floatArray = new Float32Array(sampleData.length)

			// Convert int16 to float32 (normalize to -1 to 1 range)
			for (let i = 0; i < sampleData.length; i++) {
				floatArray[i] = sampleData[i] / 32768
			}

			const buffer = tone.ToneAudioBuffer.fromArray(floatArray, params.sampleRate)
			const shouldLoop = params.sampleModes === 1

			const player = new tone.Player({
				url: buffer,
				loop: shouldLoop,
				loopStart: params.loopStart / params.sampleRate,
				loopEnd: params.loopEnd / params.sampleRate,
				playbackRate: params.playbackRate,
				fadeIn: finalSettings.attack || params.volAttack,
				fadeOut: finalSettings.release || params.volRelease
			}).connect(instrument.masterChannel)

			const fractionalGain = finalSettings.gain / 100
			player.volume.value = tone.gainToDb(velocityOnScale127 * fractionalGain)
			instrument.activeNotes.set(note, player)
			player.start()
		})
	}

	instrument.getPlayingNotes = () => {
		return Array.from(instrument.activeNotes.keys())
	}

	instrument.stop = (target) => {
		const shouldStopAll = !target
		if (shouldStopAll) return instrument.stopAll()
		const isTargetArray = Array.isArray(target)
		const getPlayingNotes = instrument.getPlayingNotes
		const getAltNotes = () => (shouldStopAll ? getPlayingNotes : [target])
		const notes = isTargetArray ? target : getAltNotes()

		notes.forEach((note) => {
			const player = instrument.activeNotes.get(note)
			if (!player) return

			const fadeOutTime = instrument.settings.release || 0.1
			player.stop('+' + fadeOutTime)

			setTimeout(
				() => {
					player.dispose()
					instrument.activeNotes.delete(note)
				},
				fadeOutTime * 1000 + 100
			)
		})
	}

	instrument.stopAll = () => {
		const activeNotesList = Array.from(instrument.activeNotes.keys())
		instrument.stop(activeNotesList)
	}

	instrument.isLoaded = true
	return instrument
}
