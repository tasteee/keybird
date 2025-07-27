import { Icon } from '../common/Icon'
import { NumberInput } from '../common/NumberInput'
import { $progression } from '#/stores/$progression'
import { Button } from '@radix-ui/themes'
import { Flex } from '#/components/common/Flex'
import { $progressionPanel } from './$progressionPanel'
import { observer } from 'mobx-react-lite'
import { ControlBox } from '../common/ControlBox'

export const ProgressionChordControls = observer(() => {
	const selectedChordId = $progressionPanel.selectedChordId
	const chords = $progression.steps
	const chord = chords.find((chord) => chord.id === selectedChordId) || null

	// Chord can be moved left if it is NOT the first chord in the progression.
	// Chord can be moved right if it is NOT the last chord in the progression.
	// If there is only one chord, it cannot be moved.
	const hasSelectedChord = chord !== null
	const canMoveLeft = hasSelectedChord && chords.length > 1 && chord.id !== chords[0].id
	const canMoveRight = hasSelectedChord && chords.length > 1 && chord.id !== chords[chords.length - 1].id

	const handleMoveLeft = () => {
		$progression.moveStepLeft(selectedChordId)
	}

	const handleMoveRight = () => {
		$progression.moveStepRight(selectedChordId)
	}

	const handleDelete = () => {
		$progressionPanel.setSelectedChordId('') // Clear selection after deletion
		$progression.deleteStep(selectedChordId)
	}

	const handleDuplicate = () => {
		$progression.duplicateStep(selectedChordId)
	}

	const handleDurationChange = (args: { value: number }) => {
		$progression.setStepDuration(args.value, selectedChordId)
	}

	return (
		<Flex.Row gap="3" className="ChordOptions" align="center" position="relative">
			{hasSelectedChord && (
				<ControlBox bottom="10px" position="relative">
					<Button className="leftArrowIconButton" size="1" variant="ghost" onClick={handleMoveLeft} disabled={!canMoveLeft}>
						<Icon color="white" name="arrowLeft0" width="16px" height="16px" />
					</Button>

					<Button className="rightArrowIconButton" size="1" variant="ghost" onClick={handleMoveRight} disabled={!canMoveRight}>
						<Icon color="white" name="arrowRight0" width="16px" height="16px" />
					</Button>

					<Button size="1" variant="ghost" onClick={handleDelete}>
						<Icon color="white" name="trash0" width="16px" height="16px" />
					</Button>

					<Button size="1" variant="ghost" onClick={handleDuplicate}>
						<Icon color="white" name="cil:clone" width="16px" height="16px" />
					</Button>

					<div id="SEPARATOR" style={{ height: 50, minHeight: '100%', minWidth: 1, background: 'var(--gray-5)' }} />

					<NumberInput
						label="Duration"
						subLabel="(Beats)"
						value={chord.durationBeats}
						onChange={handleDurationChange}
						dragStep={0.25}
						min={1}
						max={16}
						step={1}
						testId="duration"
					/>
				</ControlBox>
			)}
		</Flex.Row>
	)
})
