import { describe, it, expect } from 'vitest'
import { applyPatternToChord } from '../applyPatternToChord'

const createMockChord = (args) => {
	return {
		id: args.id,
		rootNote: 'C',
		adjustedNotes: args.adjustedNotes,
		durationBeats: args.durationBeats,
		minVelocity: args.minVelocity || 60,
		maxVelocity: args.maxVelocity || 100
	}
}

const createMockRest = (args) => {
	return {
		id: 'rest',
		rootNote: '',
		adjustedNotes: [],
		durationBeats: args.durationBeats,
		minVelocity: 0,
		maxVelocity: 0,
		isRest: true,
		symbol: 'Rest',
		color: 'gray'
	}
}

const createMockProgression = (args) => {
	return {
		id: 'test-progression',
		bpm: args.bpm || 120,
		lengthBars: args.lengthBars || 4,
		steps: args.steps
	}
}

const createMockProject = (args) => {
	return {
		id: 'test-project',
		ppqResolution: args.ppqResolution || 480
	}
}

const createMockSignal = (args) => {
	return {
		id: args.id,
		toneId: args.toneId,
		startDivision: args.startDivision,
		endDivision: args.endDivision,
		minVelocity: args.minVelocity || 0,
		maxVelocity: args.maxVelocity || 0,
		isMuted: args.isMuted || false
	}
}

const createMockPattern = (args) => {
	return {
		id: 'test-pattern',
		lengthBars: args.lengthBars || 1,
		signals: args.signals
	}
}

const createMockToneMap = () => {
	return {
		id: 'test-tonemap'
	}
}

describe('applyPatternToChord', () => {
	it('should return empty array when progression has no steps', () => {
		const progression = createMockProgression({ steps: [] })
		const pattern = createMockPattern({ signals: {} })
		const project = createMockProject({})
		const toneMap = createMockToneMap()

		const result = applyPatternToChord({
			toneMap,
			progression,
			project,
			pattern
		})

		expect(result).toEqual([])
	})

	it('should return empty array when pattern has no signals', () => {
		const chord = createMockChord({
			id: 'cmaj',
			adjustedNotes: ['C4', 'E4', 'G4'],
			durationBeats: 4
		})
		const progression = createMockProgression({ steps: [chord] })
		const pattern = createMockPattern({ signals: {} })
		const project = createMockProject({})
		const toneMap = createMockToneMap()

		const result = applyPatternToChord({
			toneMap,
			progression,
			project,
			pattern
		})

		expect(result).toEqual([])
	})

	it('should generate notes for single chord and single signal', () => {
		const chord = createMockChord({
			id: 'cmaj',
			adjustedNotes: ['C4', 'E4', 'G4'],
			durationBeats: 4
		})
		const progression = createMockProgression({ steps: [chord] })

		const signal = createMockSignal({
			id: 'signal1',
			toneId: 'T1',
			startDivision: 0,
			endDivision: 4,
			minVelocity: 80,
			maxVelocity: 100
		})
		const pattern = createMockPattern({ signals: { signal1: signal } })
		const project = createMockProject({})
		const toneMap = createMockToneMap()

		const result = applyPatternToChord({
			toneMap,
			progression,
			project,
			pattern
		})

		expect(result).toHaveLength(1)
		expect(result[0].note).toBe('C4')
		expect(result[0].toneId).toBe('T1')
		expect(result[0].signalId).toBe('signal1')
		expect(result[0].velocity).toBeGreaterThanOrEqual(80)
		expect(result[0].velocity).toBeLessThanOrEqual(100)
	})

	it('should map different tone IDs to correct chord notes', () => {
		const chord = createMockChord({
			id: 'cmaj',
			adjustedNotes: ['C4', 'E4', 'G4'],
			durationBeats: 4
		})
		const progression = createMockProgression({ steps: [chord] })

		const signal1 = createMockSignal({
			id: 'signal1',
			toneId: 'T1',
			startDivision: 0,
			endDivision: 4
		})
		const signal2 = createMockSignal({
			id: 'signal2',
			toneId: 'T2',
			startDivision: 4,
			endDivision: 8
		})
		const signal3 = createMockSignal({
			id: 'signal3',
			toneId: 'T3',
			startDivision: 8,
			endDivision: 12
		})

		const pattern = createMockPattern({
			signals: { signal1, signal2, signal3 }
		})
		const project = createMockProject({})
		const toneMap = createMockToneMap()

		const result = applyPatternToChord({
			toneMap,
			progression,
			project,
			pattern
		})

		expect(result).toHaveLength(3)
		expect(result[0].note).toBe('C4') // T1 -> first note
		expect(result[1].note).toBe('E4') // T2 -> second note
		expect(result[2].note).toBe('G4') // T3 -> third note
	})

	it('should cycle through chord notes for higher tone IDs', () => {
		const chord = createMockChord({
			id: 'cmaj',
			adjustedNotes: ['C4', 'E4', 'G4'],
			durationBeats: 4
		})
		const progression = createMockProgression({ steps: [chord] })

		const signal = createMockSignal({
			id: 'signal4',
			toneId: 'T4', // Should cycle back to first note (C4)
			startDivision: 0,
			endDivision: 4
		})

		const pattern = createMockPattern({ signals: { signal4: signal } })
		const project = createMockProject({})
		const toneMap = createMockToneMap()

		const result = applyPatternToChord({
			toneMap,
			progression,
			project,
			pattern
		})

		expect(result).toHaveLength(1)
		expect(result[0].note).toBe('C5') // Cycles and shifts octave up
	})

	it('should handle octave offsets in tone IDs', () => {
		const chord = createMockChord({
			id: 'cmaj',
			adjustedNotes: ['C4', 'E4', 'G4'],
			durationBeats: 4
		})
		const progression = createMockProgression({ steps: [chord] })

		const signal = createMockSignal({
			id: 'signal1',
			toneId: 'T1+1', // First note plus one octave
			startDivision: 0,
			endDivision: 4
		})

		const pattern = createMockPattern({ signals: { signal1: signal } })
		const project = createMockProject({})
		const toneMap = createMockToneMap()

		const result = applyPatternToChord({
			toneMap,
			progression,
			project,
			pattern
		})

		expect(result).toHaveLength(1)
		expect(result[0].note).toBe('C5') // C4 + 1 octave = C5
	})

	it('should skip signals during rests', () => {
		const chord = createMockChord({
			id: 'cmaj',
			adjustedNotes: ['C4', 'E4', 'G4'],
			durationBeats: 2
		})
		const rest = createMockRest({ durationBeats: 2 })
		const progression = createMockProgression({ steps: [chord, rest] })

		const signal1 = createMockSignal({
			id: 'signal1',
			toneId: 'T1',
			startDivision: 0, // During chord
			endDivision: 4
		})
		const signal2 = createMockSignal({
			id: 'signal2',
			toneId: 'T1',
			startDivision: 8, // During rest
			endDivision: 12
		})

		const pattern = createMockPattern({
			signals: { signal1, signal2 }
		})
		const project = createMockProject({})
		const toneMap = createMockToneMap()

		const result = applyPatternToChord({
			toneMap,
			progression,
			project,
			pattern
		})

		expect(result).toHaveLength(1)
		expect(result[0].signalId).toBe('signal1') // Only signal during chord
	})

	it('should skip muted signals', () => {
		const chord = createMockChord({
			id: 'cmaj',
			adjustedNotes: ['C4', 'E4', 'G4'],
			durationBeats: 4
		})
		const progression = createMockProgression({ steps: [chord] })

		const signal1 = createMockSignal({
			id: 'signal1',
			toneId: 'T1',
			startDivision: 0,
			endDivision: 4,
			isMuted: false
		})
		const signal2 = createMockSignal({
			id: 'signal2',
			toneId: 'T2',
			startDivision: 4,
			endDivision: 8,
			isMuted: true
		})

		const pattern = createMockPattern({
			signals: { signal1, signal2 }
		})
		const project = createMockProject({})
		const toneMap = createMockToneMap()

		const result = applyPatternToChord({
			toneMap,
			progression,
			project,
			pattern
		})

		expect(result).toHaveLength(1)
		expect(result[0].signalId).toBe('signal1')
	})

	it('should repeat pattern for longer progressions', () => {
		const chord1 = createMockChord({
			id: 'cmaj',
			adjustedNotes: ['C4', 'E4', 'G4'],
			durationBeats: 4
		})
		const chord2 = createMockChord({
			id: 'fmaj',
			adjustedNotes: ['F4', 'A4', 'C5'],
			durationBeats: 4
		})
		const progression = createMockProgression({ steps: [chord1, chord2] }) // 8 beats total

		const signal = createMockSignal({
			id: 'signal1',
			toneId: 'T1',
			startDivision: 0,
			endDivision: 4
		})

		const pattern = createMockPattern({
			signals: { signal1: signal },
			lengthBars: 1 // 4 beats
		})
		const project = createMockProject({})
		const toneMap = createMockToneMap()

		const result = applyPatternToChord({
			toneMap,
			progression,
			project,
			pattern
		})

		expect(result).toHaveLength(2)
		expect(result[0].note).toBe('C4') // First repetition on chord1
		expect(result[1].note).toBe('F4') // Second repetition on chord2
	})

	it('should use chord velocity when signal velocity is zero', () => {
		const chord = createMockChord({
			id: 'cmaj',
			adjustedNotes: ['C4', 'E4', 'G4'],
			durationBeats: 4,
			minVelocity: 70,
			maxVelocity: 90
		})
		const progression = createMockProgression({ steps: [chord] })

		const signal = createMockSignal({
			id: 'signal1',
			toneId: 'T1',
			startDivision: 0,
			endDivision: 4,
			minVelocity: 0,
			maxVelocity: 0
		})

		const pattern = createMockPattern({ signals: { signal1: signal } })
		const project = createMockProject({})
		const toneMap = createMockToneMap()

		const result = applyPatternToChord({
			toneMap,
			progression,
			project,
			pattern
		})

		expect(result).toHaveLength(1)
		expect(result[0].velocity).toBeGreaterThanOrEqual(70)
		expect(result[0].velocity).toBeLessThanOrEqual(90)
	})

	it('should calculate correct timing values', () => {
		const chord = createMockChord({
			id: 'cmaj',
			adjustedNotes: ['C4', 'E4', 'G4'],
			durationBeats: 4
		})
		const progression = createMockProgression({
			steps: [chord],
			bpm: 120
		})

		const signal = createMockSignal({
			id: 'signal1',
			toneId: 'T1',
			startDivision: 0, // 0 beats
			endDivision: 4 // 1 beat
		})

		const pattern = createMockPattern({ signals: { signal1: signal } })
		const project = createMockProject({ ppqResolution: 480 })
		const toneMap = createMockToneMap()

		const result = applyPatternToChord({
			toneMap,
			progression,
			project,
			pattern
		})

		expect(result).toHaveLength(1)

		const note = result[0]
		expect(note.startTicks).toBe(0)
		expect(note.endTicks).toBe(480) // 1 beat * 480 PPQ
		expect(note.startMs).toBe(0)
		expect(note.endMs).toBe(500) // 1 beat at 120 BPM = 500ms
	})

	it('should handle progression with multiple chord types', () => {
		const chord = createMockChord({
			id: 'cmaj',
			adjustedNotes: ['C4', 'E4', 'G4'],
			durationBeats: 2
		})
		const rest = createMockRest({ durationBeats: 1 })
		const chord2 = createMockChord({
			id: 'fmaj',
			adjustedNotes: ['F4', 'A4', 'C5'],
			durationBeats: 1
		})

		const progression = createMockProgression({ steps: [chord, rest, chord2] })

		const signal1 = createMockSignal({
			id: 'signal1',
			toneId: 'T1',
			startDivision: 0, // During first chord
			endDivision: 2
		})
		const signal2 = createMockSignal({
			id: 'signal2',
			toneId: 'T2',
			startDivision: 8, // During rest
			endDivision: 10
		})
		const signal3 = createMockSignal({
			id: 'signal3',
			toneId: 'T1',
			startDivision: 12, // During second chord
			endDivision: 14
		})

		const pattern = createMockPattern({
			signals: { signal1, signal2, signal3 }
		})
		const project = createMockProject({})
		const toneMap = createMockToneMap()

		const result = applyPatternToChord({
			toneMap,
			progression,
			project,
			pattern
		})

		expect(result).toHaveLength(2)
		expect(result[0].note).toBe('C4') // First chord, T1
		expect(result[1].note).toBe('F4') // Second chord, T1
	})
})
