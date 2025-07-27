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

import type { InstrumentName } from 'soundfont-player'
import { createProgression } from './creators'
import { theory } from './theory'
import { PPQ } from '../constants/state'
import { $output } from '#/stores/output/$output'
import { $player } from '#/stores/$player'
import { just } from './just'
import random from 'random'
import { applyPatternToChords } from './applyPatternToChord'
import { PerformedNoteT } from './patterns/apply'
import { accumulator } from './accumulator'

export const createMidiEngine = () => {
	const store = {} as any
	store.isReady = false
	store.performance = [] as PerformedNoteT[]
	store.isPlaying = false

	const update = accumulator((data) => {
		store.performance = applyPatternToChords(data)
		store.isReady = true
	})

	const start = () => {
		if (store.isPlaying) return
		store.isPlaying = true
		// begin scheduling
	}

	const end = () => {
		store.isPlaying = false
		// clear scheduled
	}

	// ...?

	return {
		update,
		start,
		end,

		get isPlaying() {
			return store.isPlaying
		},

		get isReady() {
			return store.isReady
		}
	}
}

export const midiEngine = createMidiEngine()
