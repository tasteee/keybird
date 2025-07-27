// A chord that has been added to a progression.
// This differs from a normal ChordT in that it
// now exists in a time concerned context.
type ProgressionChordT = ChordT & {
	durationBeats: number
	isRest: boolean
}

// Other than a ProgressionChordT, a progression
// may have rests that need to fulfill the same
// interface as a ProgressionChordT for simplicity (TS).
type ProgressionRestT = ProgressionChordT & {
	isRest: boolean
	symbol: 'Rest'
	color: 'gray'
}

type ProgressionStepT = ProgressionChordT | ProgressionRestT
type PartialStepWithIdT = Partial<ProgressionStepT> & { id: string }
type PartialStepT = Partial<ProgressionStepT>

type ProgressionT = {
	id: string
	bpm: number
	lengthBars: number
	steps: ProgressionStepT[]
}
