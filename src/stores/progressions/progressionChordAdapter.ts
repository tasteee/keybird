import { $progression } from '../$progression'
import { getAdjustedNotes } from '#/modules/getAdjustedNotes'
import { $project } from '../$project'
import { useMemo } from 'react'

/**
 * Adapter that wraps a progression chord (plain object) with the same
 * interface as ChordStore, allowing progression chords to be used in
 * the same UI components as non-progression chords without duplicating code.
 */
export class ProgressionChordAdapter {
	private stepId: string

	constructor(stepId: string) {
		this.stepId = stepId
	}

	private get step() {
		return $progression.steps.find((step) => step.id === this.stepId)
	}

	get id() {
		return this.step?.id || ''
	}

	get notes() {
		return this.step?.notes || []
	}

	get rootNote() {
		return this.step?.rootNote || this.step?.tonic || ''
	}

	get symbol() {
		return this.step?.symbol || ''
	}

	get degree() {
		return this.step?.degree || ''
	}

	get octaveOffset() {
		return this.step?.octaveOffset || 0
	}

	get voicing() {
		return this.step?.voicing || 'closed'
	}

	get inversion() {
		return this.step?.inversion || 0
	}

	get durationBeats() {
		return this.step?.durationBeats || 4
	}

	get bassNote() {
		return this.step?.bassNote || this.rootNote
	}

	get minVelocity() {
		return this.step?.minVelocity || 65
	}

	get maxVelocity() {
		return this.step?.maxVelocity || 85
	}

	get color() {
		return this.step?.color || ''
	}

	get adjustedNotes() {
		if (!this.step) return []
		return getAdjustedNotes(this.step)
	}

	// Modifier methods that delegate to the progression store
	setOctaveOffset = (value: number) => {
		$progression.updateStep({
			id: this.stepId,
			octaveOffset: value
		})
	}

	setInversion = (value: number) => {
		$progression.updateStep({
			id: this.stepId,
			inversion: value
		})
	}

	setDurationBeats = (value: number) => {
		$progression.updateStep({
			id: this.stepId,
			durationBeats: value
		})
	}

	setVoicing = (value: string) => {
		$progression.updateStep({
			id: this.stepId,
			voicing: value
		})
	}

	setMinVelocity = (value: number) => {
		$progression.updateStep({
			id: this.stepId,
			minVelocity: value
		})
	}

	setMaxVelocity = (value: number) => {
		$progression.updateStep({
			id: this.stepId,
			maxVelocity: value
		})
	}
}

export const useProgressionChordAdapter = (stepId: string) => {
	return useMemo(() => {
		return new ProgressionChordAdapter(stepId)
	}, [stepId])
}
