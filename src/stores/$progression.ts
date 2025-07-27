import { createProgression, createStep } from '#/modules/creators'
import { observable, action, computed, autorun, toJS } from 'mobx'
import { $output } from './output/$output'
import { $player } from './$player'
import { computedFn } from 'mobx-utils'
import { applyPatternToChord } from '#/modules/patterns/apply'
import { $pattern } from './$pattern'
import { $project } from './$project'
import { useMemo } from 'react'
import store from 'store'
import { midiEngine } from '#/modules/midiEngine'

const savedProgression = store.get('progression') || []

const initialState = createProgression({
	steps: savedProgression.steps,
	id: savedProgression.id || crypto.randomUUID(),
	lengthBars: savedProgression.lengthBars || 4,
	bpm: savedProgression.bpm || 93
})

class ProgressionStore {
	@observable accessor id: string = initialState.id
	@observable accessor lengthBars: number = initialState.lengthBars
	@observable accessor bpm: number = initialState.bpm
	@observable accessor steps: ProgressionStepT[] = initialState.steps
	@observable accessor selectedStepId: string | null = null

	toJS = () => {
		const steps = this.steps.map((step) => toJS(step))
		const selectedStepId = this.selectedStepId
		const bpm = this.bpm
		const lengthBars = this.lengthBars
		const id = this.id
		return { steps, selectedStepId, bpm, lengthBars, id }
	}

	checkIsSelectedId = computedFn((id: string) => {
		if (!this.selectedStepId) return false
		return this.selectedStepId === id
	})

	@computed get stepIds() {
		return this.steps.map((item) => item.id)
	}

	@computed get totalBeats() {
		return this.steps.reduce((total, step) => total + (step.durationBeats || 4), 0)
	}

	@computed get actualLengthBars() {
		return Math.ceil(this.totalBeats / 4)
	}

	@action selectStep = (id: string) => {
		this.selectedStepId = id || null
	}

	@action setlengthBars = (lengthBars: number) => {
		this.lengthBars = lengthBars
	}

	@action setBpm = (bpm: number) => {
		this.bpm = bpm
	}

	@action addStep = (step: Partial<ProgressionStepT>) => {
		const newStep = createStep(step)
		this.steps.push(newStep)
	}

	@action updateStep = (updates: PartialStepWithIdT) => {
		for (const step of this.steps) {
			if (step.id !== updates.id) continue
			Object.assign(step, updates)
			break
		}

		// Update lengthBars if durationBeats was changed
		if ('durationBeats' in updates) {
			this.lengthBars = this.actualLengthBars
		}
	}

	@action moveStep = (id: string, newIndex: number) => {
		const stepIndex = this.steps.findIndex((step) => step.id === id)
		if (stepIndex === -1 || newIndex < 0 || newIndex >= this.steps.length) return

		const [step] = this.steps.splice(stepIndex, 1)
		this.steps.splice(newIndex, 0, step)
	}

	@action deleteStep = (id: string) => {
		const index = this.steps.findIndex((step) => step.id === id)
		this.steps.splice(index, 1)

		// Update lengthBars after deletion
		this.lengthBars = this.actualLengthBars
	}

	@action duplicateStep = (id: string) => {
		const selectedStep = this.steps.find((step) => step.id === id)
		if (!selectedStep) return

		const newId = crypto.randomUUID()
		const base = toJS(selectedStep)

		// Preserve the original color instead of recalculating it
		const newStep = { ...base, id: newId }

		const index = this.steps.indexOf(selectedStep)
		this.steps.splice(index + 1, 0, newStep)
	}

	// When the user chooses a chord from the chord browser,
	// it already has state and such (modifications), so we want
	// to accept that chord into the progression, but without
	// taking it from the browser or accidentally modifying it later.
	// So we clone the chord, ensure some values, and add it.
	@action addChord = (chord) => {
		const newId = crypto.randomUUID()
		const jsChord = toJS(chord)
		jsChord.durationBeats = 4
		jsChord.isRest = false
		jsChord.id = newId
		this.steps.push(jsChord)

		// Update lengthBars based on actual total beats
		this.lengthBars = this.actualLengthBars

		console.log('Added chord:', jsChord, this.steps)
		console.log('Total beats:', this.totalBeats, 'Length bars:', this.lengthBars)
	}

	@action addRest = (args?: { durationBeats?: number }) => {
		const durationBeats = args?.durationBeats ?? 2
		const id = crypto.randomUUID()
		const restChord = { id, isRest: true } as ProgressionRestT
		restChord.symbol = 'Rest'
		restChord.rootNote = 'Rest'
		restChord.notes = []
		restChord.bassNote = ''
		restChord.voicing = 'closed'
		restChord.inversion = 0
		restChord.octaveOffset = 0
		restChord.color = 'gray'
		restChord.durationBeats = durationBeats
		this.steps.push(restChord)

		// Update lengthBars based on actual total beats
		this.lengthBars = this.actualLengthBars
	}

	@action setStepDuration = (durationBeats: number, stepId?: string) => {
		const id = stepId || this.selectedStepId
		if (!id) return
		this.updateStep({ id, durationBeats })
	}

	@action moveStepLeft = (id = this.selectedStepId) => {
		const index = this.steps.findIndex((chord) => chord.id === id)
		const [chord] = this.steps.splice(index, 1)
		this.steps.splice(index - 1, 0, chord)
	}

	@action moveStepRight = (id = this.selectedStepId) => {
		const index = this.steps.findIndex((chord) => chord.id === id)
		const [chord] = this.steps.splice(index, 1)
		this.steps.splice(index + 1, 0, chord)
	}

	getFinalPerformanceNotes = (performances: PerformedNoteT[][]) => {
		// Convert relative timing to absolute timing
		const absolutePerformances: PerformedNoteT[][] = []
		let cumulativeStartTicks = 0
		let cumulativeStartMs = 0

		for (let chordIndex = 0; chordIndex < performances.length; chordIndex++) {
			const chordNotes = performances[chordIndex]

			// Find the maximum end time for this chord to know when the next chord starts
			let maxEndTicks = 0
			let maxEndMs = 0

			// First pass: find the chord duration
			for (const note of chordNotes) {
				maxEndTicks = Math.max(maxEndTicks, note.endTicks)
				maxEndMs = Math.max(maxEndMs, note.endMs)
			}

			// Second pass: create notes with absolute timing
			const absoluteChordNotes: PerformedNoteT[] = chordNotes.map((note) => ({
				...note,
				absoluteStartTicks: cumulativeStartTicks + note.startTicks,
				absoluteEndTicks: cumulativeStartTicks + note.endTicks,
				absoluteStartMs: cumulativeStartMs + note.startMs,
				absoluteEndMs: cumulativeStartMs + note.endMs
			}))

			absolutePerformances.push(absoluteChordNotes)

			// Update cumulative timing for next chord
			cumulativeStartTicks += maxEndTicks
			cumulativeStartMs += maxEndMs
		}

		return absolutePerformances.flat()
	}

	playLoop = () => {
		const performances: PerformedNoteT[][] = this.steps.map((chord) => {
			return applyPatternToChord({
				chord,
				project: $project,
				strategy: 'cycling',
				toneMap: $pattern.signalRows
			})
		})

		const absolutePerformances = this.getFinalPerformanceNotes(performances)
		console.log('Absolute Performances:', absolutePerformances)

		const outputType = $output.outputType
		const output = $output.midiOutput
		const isMidi = outputType === 'midi'

		if (!isMidi) {
			$player.performChord({ notes: absolutePerformances })
			// absolutePerformances.forEach((note) => {
			// 	output.playNote(note.note, {
			// 		time: note.absoluteStartMs,
			// 		duration: note.absoluteEndMs - note.absoluteStartMs,
			// 		rawAttack: note.velocity
			// 	})
			// })
		}

		// performances[0] is an array of the performance pattern applied to the
		// first chord in the progression, performances[1] for the second chord, etc.
		// each performance note has timing (startTicks, endTicks), velocity, note
		// and everything needed to produce midi. (and startMs, endMs for timing too...)

		// please help me now take progressions array and turn it into a a midi format
		// that I can then either (1) play through a midi output using WebMidi or (2)
		// download as a midi file.

		console.log({ performances })
	}

	save = () => {
		store.set('progression', this.toJS())
	}

	useStep = (id: string) => {
		return useMemo(() => {
			return this.steps.find((step) => step.id === id)
		}, [id])
	}
}

export const $progression = new ProgressionStore()
globalThis.$progression = $progression

autorun(() => {
	// Convert MobX store to plain object before passing to engine
	const progressionData = {
		id: $progression.id,
		lengthBars: $progression.lengthBars,
		bpm: $progression.bpm,
		steps: $progression.steps.map((step) => toJS(step))
	}

	if (!midiEngine.isReady) return
	midiEngine.update({ progression: progressionData })
})

setInterval(() => {
	$progression.save()
}, 30000)
