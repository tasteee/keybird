import getDiff from 'array-differ'

export const getDifference = (outdated: string[], updated: string[]) => {
	const stoppedNotes = getDiff(outdated, updated)
	const startedNotes = getDiff(updated, outdated)
	return [startedNotes, stoppedNotes]
}
