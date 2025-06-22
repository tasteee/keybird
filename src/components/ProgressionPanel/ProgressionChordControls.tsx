import * as Label from '@radix-ui/react-label'
import { Icon } from '../Icon'
import { $progression } from '#/stores'
import { TextField, Button } from '@radix-ui/themes'
import { Flex } from '#/components/layout/Flex'
import { $progressionPanel } from './$progressionPanel'

export const ProgressionChordControls = () => {
	const selectedChordId = $progressionPanel.selectedChordId.use()
	const chords = $progression.use()
	const chord = chords.find((chord) => chord.id === selectedChordId) || null
	console.log('ProgressionChordControls', chord, chords, selectedChordId)
	if (!chord) return null

	const canMoveLeft = chords.length > 1 && chord.id !== chords[0].id
	const canMoveRight = chords.length > 1 && chord.id !== chords[chords.length - 1].id

	const handleMoveLeft = () => {
		$progression.moveChordLeft(selectedChordId)
	}

	const handleMoveRight = () => {
		$progression.moveChordRight(selectedChordId)
	}

	const handleDelete = () => {
		$progressionPanel.selectedChordId.set('') // Clear selection after deletion
		$progression.deleteChord(selectedChordId)
	}

	const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newDuration = parseInt(event.target.value, 10)

		if (!isNaN(newDuration)) {
			$progression.updateChordDuration(chord.id, newDuration)
		}
	}

	return (
		<Flex.Row gap="3" className="ChordOptions" align="center" style={{ position: 'absolute', right: 16 }}>
			<Flex.Row gap="2" align="center">
				<Label.Root className="LabelRoot" htmlFor="duration">
					Duration
				</Label.Root>
				<TextField.Root
					size="1"
					className="durationInput"
					type="number"
					min="1"
					max="16"
					id="duration"
					step="1"
					value={chord.durationBeats}
					onChange={handleDurationChange}
				/>
			</Flex.Row>

			{canMoveLeft && (
				<Button className="leftArrowIconButton" size="1" variant="surface" onClick={handleMoveLeft}>
					<Icon color="white" name="arrowLeft0" width="16px" height="16px" />
				</Button>
			)}
			{canMoveRight && (
				<Button className="rightArrowIconButton" size="1" variant="surface" onClick={handleMoveRight}>
					<Icon color="white" name="arrowRight0" width="16px" height="16px" />
				</Button>
			)}

			<Button size="1" variant="outline" onClick={handleDelete}>
				<Icon color="white" name="trash0" width="16px" height="16px" />
			</Button>
		</Flex.Row>
	)
}
