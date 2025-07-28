import { $progressionPanel } from '#/components/ProgressionPanel/$progressionPanel'
import { $progression } from '#/stores'
import { mapToneToNote } from '#/modules/applyPatternToChord'
import { $player } from '#/stores/$player'

type EnsureChordSelectionArgsT = {
	// No args needed - just ensure something is selected
}

export const ensureChordSelection = (args: EnsureChordSelectionArgsT) => {
	const hasNoSelection = $progressionPanel.selectedChordId === ''
	if (!hasNoSelection) return

	const hasNoSteps = $progression.steps.length === 0
	if (hasNoSteps) return

	// Select the first chord if none is selected
	const firstChord = $progression.steps[0]
	$progressionPanel.setSelectedChordId(firstChord.id)
}

type GetSelectedChordArgsT = {
	// No args needed
}

export const getSelectedChord = (args: GetSelectedChordArgsT) => {
	ensureChordSelection({})

	const selectedChordId = $progressionPanel.selectedChordId
	const hasNoSelection = selectedChordId === ''
	if (hasNoSelection) return null

	const selectedChord = $progression.steps.find((step) => step.id === selectedChordId)
	return selectedChord || null
}

type PlayPreviewNoteArgsT = {
	toneId: string
	duration?: number
}

export const playPreviewNote = (args: PlayPreviewNoteArgsT) => {
	const selectedChord = getSelectedChord({})
	const hasNoSelectedChord = !selectedChord
	if (hasNoSelectedChord) return

	const isRest = selectedChord.isRest
	if (isRest) return

	const mappedNote = mapToneToNote({
		toneId: args.toneId,
		chord: selectedChord
	})

	const hasNoMappedNote = !mappedNote
	if (hasNoMappedNote) return

	const duration = args.duration || 1.0 // Default 1 second

	$player.playNote({
		note: mappedNote,
		velocity: 65,
		duration
	})
}
