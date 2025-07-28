// A non-reactive, live MIDI model updated by an $effect
// to keep track of the current state of MIDI signals and progression.

// It should be kept in sync with the active chord progression
// and the signals defined in the pattern editor, allowing playback
// of the progression with the pattern applied at any given time,
// and allows for updates that will be reflected during playback.

// So for example if playback is currently active and it is halfway
// through playing an arp pattern on the first chord of the progression,
// and the user changes the first chord in the progression, the playback
// should immediately reflect that change without needing to stop and
// restart playback. So the second half of the arp pattern should be
// played on the new chord. Or if the user changes the pattern while
// playback is active, the new pattern should be applied to the currently
// focused chord in the progression for the remainder of that chord's playback.

// When setProgression is called, we need to, for each chord in the progression,
// create a map of that chord's notes to all of the possible tone ids, T1-2 to T8-2,
// T1-1 to T8-1, T1 to T8, T1+1 to T8+1, and T1+2 to T8+2. THEN, when setSignals
// is called, we can easily map the toneId of each signal to the corresponding
// note for the chord when converting the SignalT[] to MidiT.Signal[].
// ...existing code...

import { accumulator } from './accumulator'
import { $player } from '#/stores/$player'
import { applyPatternToChords } from './applyPatternToChord'
import { SCHEDULE_AHEAD_MS, SCHEDULE_INTERVAL_MS } from '#/constants'
import { DEFAULT_BPM } from '#/constants/state'
import { just } from './just'
import { observable, toJS } from 'mobx'

type ScheduledNoteT = {
	id: string
	noteOffTime: number
}

const createMidiEngine = () => {
	let deps = { tone: null } as any

	const state = observable({
		isReady: false,
		performance: [] as PerformedNoteT[],
		isPlaying: false,
		currentTimeMs: 0,
		startTimeMs: 0,
		scheduledNotes: new Map<string, ScheduledNoteT>(),
		scheduleIntervalId: null as number | null,
		lastScheduledEndMs: 0,
		pattern: {} as any,
		project: {} as any,
		progression: {} as any
	})

	const initializeTone = async () => {
		if (deps.tone) return deps.tone
		const ToneModule = await import('tone')
		deps.tone = ToneModule
		return ToneModule
	}

	const baseUpdate = accumulator((data) => {
		if (!deps.tone) initializeTone()
		state.progression = data.progression
		state.project = data.project
		state.pattern = data.pattern
		state.performance = applyPatternToChords(data)
		state.isReady = true
		console.log('midiEngine update: ', toJS(state))
	})

	const update = just.throttle(100, baseUpdate)

	const getCurrentPlaybackMs = () => {
		const hasNotStarted = !state.isPlaying
		if (hasNotStarted) return 0
		const elapsedMs = Date.now() - state.startTimeMs
		return state.currentTimeMs + elapsedMs
	}

	const getExpectedProgressionDurationMs = () => {
		const hasNoProgression = !state.progression || !state.progression.steps
		if (hasNoProgression) return 0

		const totalBeats = state.progression.steps.reduce((sum, step) => sum + step.durationBeats, 0)
		const msPerBeat = 60000 / DEFAULT_BPM
		const totalMs = totalBeats * msPerBeat
		return totalMs
	}

	const getPerformanceDurationMs = () => {
		const hasNoPerformance = state.performance.length === 0
		if (hasNoPerformance) return 0
		const validNotes = state.performance.filter((n) => n.absoluteEndMs !== undefined)
		const hasNoValidNotes = validNotes.length === 0
		if (hasNoValidNotes) return 0
		const maxEndMs = Math.max(...validNotes.map((n) => n.absoluteEndMs!))
		return maxEndMs
	}

	const scheduleNotes = () => {
		const currentMs = getCurrentPlaybackMs()
		const scheduleUntilMs = currentMs + SCHEDULE_AHEAD_MS

		const notesToSchedule = state.performance.filter((note) => {
			const hasValidTiming = note.absoluteStartMs !== undefined
			if (!hasValidTiming) return false
			const isAlreadyScheduled = state.scheduledNotes.has(note.signalId)
			if (isAlreadyScheduled) return false
			const startsBeforeScheduleWindow = note.absoluteStartMs <= scheduleUntilMs
			const hasNotPassedYet = note.absoluteStartMs >= currentMs
			return startsBeforeScheduleWindow && hasNotPassedYet
		})

		notesToSchedule.forEach((note) => {
			const delayMs = note.absoluteStartMs! - currentMs
			const durationMs = note.absoluteEndMs! - note.absoluteStartMs!

			just.afterMS(Math.max(0, delayMs), () => {
				const hasValidNote = note.note !== null
				if (!hasValidNote) return

				$player.playNote({
					note: note.note,
					velocity: note.velocity,
					duration: durationMs / 1000
				})

				// Track when this note will end
				state.scheduledNotes.set(note.signalId, {
					id: note.signalId,
					noteOffTime: note.absoluteEndMs!
				})
			})

			const timeoutTime = Math.max(0, delayMs + durationMs + 100)
			setTimeout(() => state.scheduledNotes.delete(note.signalId), timeoutTime)
		})

		if (notesToSchedule.length > 0) {
			const maxEndMs = Math.max(...notesToSchedule.map((n) => n.absoluteEndMs!))
			state.lastScheduledEndMs = Math.max(state.lastScheduledEndMs, maxEndMs)
		}

		// Stop when we've passed the full progression duration
		const expectedDurationMs = getExpectedProgressionDurationMs()
		const hasFinishedProgression = currentMs > expectedDurationMs + 100
		if (hasFinishedProgression) stop()
	}

	const start = async () => {
		console.log('---start---', state)
		const isAlreadyPlaying = state.isPlaying
		const hasNoPerformance = state.performance.length === 0
		if (isAlreadyPlaying) return console.warn('already playing')
		if (hasNoPerformance) return console.warn('No performance data to play')
		const tone = await deps.tone

		state.isPlaying = true
		state.currentTimeMs = 0
		state.startTimeMs = Date.now()
		state.scheduledNotes.clear()
		state.lastScheduledEndMs = 0
		tone.start()
		state.scheduleIntervalId = setInterval(scheduleNotes, SCHEDULE_INTERVAL_MS) as unknown as number
		scheduleNotes()
	}

	const stop = () => {
		const wasNotPlaying = !state.isPlaying
		if (wasNotPlaying) return
		state.isPlaying = false

		if (state.scheduleIntervalId !== null) {
			clearInterval(state.scheduleIntervalId)
			state.scheduleIntervalId = null
		}

		$player.stopAllNotes()
		state.scheduledNotes.clear()
	}

	const pause = () => {
		const wasNotPlaying = !state.isPlaying
		if (wasNotPlaying) return
		state.currentTimeMs = getCurrentPlaybackMs()
		state.isPlaying = false

		// Clear scheduling but keep position
		if (state.scheduleIntervalId !== null) {
			clearInterval(state.scheduleIntervalId)
			state.scheduleIntervalId = null
		}

		$player.stopAllNotes()
	}

	const resume = () => {
		const wasPlaying = state.isPlaying
		if (wasPlaying) return

		const hasNoPerformance = state.performance.length === 0
		if (hasNoPerformance) return

		state.isPlaying = true
		state.startTimeMs = Date.now()

		// Restart scheduling
		state.scheduleIntervalId = setInterval(scheduleNotes, SCHEDULE_INTERVAL_MS) as unknown as number
		scheduleNotes()
	}

	const seek = (timeMs: number) => {
		const wasPlaying = state.isPlaying

		// Stop current playback
		if (wasPlaying) {
			pause()
		}

		// Set new position (allow seeking to any time, looping will handle it)
		state.currentTimeMs = Math.max(0, timeMs)
		state.scheduledNotes.clear()

		// Resume if was playing
		if (wasPlaying) {
			resume()
		}
	}

	return {
		state,
		update,
		start,
		stop,
		pause,
		resume,
		seek,

		get isPlaying() {
			return state.isPlaying
		},

		get isReady() {
			return state.isReady
		},

		get currentTimeMs() {
			return getCurrentPlaybackMs()
		},

		get durationMs() {
			// Return the expected progression duration, not just the performance notes duration
			const expectedDurationMs = getExpectedProgressionDurationMs()
			const performanceDurationMs = getPerformanceDurationMs()
			// Use the longer of the two to ensure we don't cut off early
			return Math.max(expectedDurationMs, performanceDurationMs)
		},

		get patternDurationMs() {
			return getPerformanceDurationMs()
		}
	}
}

export const midiEngine = createMidiEngine()
