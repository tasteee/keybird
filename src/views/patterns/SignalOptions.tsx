import * as Label from '@radix-ui/react-label'
import { TextField, Button, IconButton } from '@radix-ui/themes'
import { Flex } from '#/components/layout/Flex'
import { $patternEditor } from './patternEditor.store'
import { $progression } from '#/stores'
import { SpeakerLoudIcon, SpeakerOffIcon, ArrowLeftIcon, ArrowRightIcon, TrashIcon, CopyIcon } from '@radix-ui/react-icons'

export const SignalOptions = () => {
	const selection = $patternEditor.selectedSignalData.use()
	const signal = $patternEditor.useSignal({ rowId: selection.rowId, signalId: selection.id })
	// Get all signals in this row for move logic
	const row = $patternEditor.useSignalRow(selection.rowId)
	const signals = row.signals
	const index = signals.findIndex((s) => s.id === selection.id)
	const isFirst = index === 0
	const isLast = index === signals.length - 1

	// Handlers
	const handleMuteToggle = () => {
		$patternEditor.toggleMuteSignal({ rowId: selection.rowId, signalId: selection.id })
	}

	const handleMoveLeft = () => {
		// if (!isFirst) $patternEditor.moveSignal({ rowId: selection.rowId, signalId: selection.id, direction: 'left',  })
	}

	const handleMoveRight = () => {
		// if (!isLast) $patternEditor.moveSignal({ rowId: selection.rowId, signalId: selection.id, direction: 'right' })
	}

	const handleDelete = () => {
		$patternEditor.selectedSignalData.set.reset() // Clear selection after deletion
		$patternEditor.removeSignal({ rowId: selection.rowId, signalId: selection.id })
	}

	const handleVelocityChange = (e) => {
		const velocity = parseInt(e.target.value, 10)
		if (!isNaN(velocity)) {
			// $patternEditor.updateSignalVelocity({ rowId: selection.rowId, signalId: selection.id, velocity })
		}
	}

	if (!selection || !signal) return null

	// UI
	return (
		<Flex.Row gap="4" align="center" className="SignalOptions" style={{ position: 'absolute', right: 16 }}>
			{/* Velocity */}
			<Flex.Column gap="1" align="start">
				<Label.Root htmlFor="velocity" style={{ fontSize: 12 }}>
					Velocity
				</Label.Root>
				<TextField.Root
					id="velocity"
					size="1"
					type="number"
					min="1"
					max="127"
					value={signal.velocity}
					onChange={handleVelocityChange}
					style={{ width: 60 }}
				/>
			</Flex.Column>

			{/* Mute / Unmute */}
			<IconButton
				size="1"
				variant={signal.muted ? 'soft' : 'solid'}
				color={signal.muted ? 'gray' : 'green'}
				onClick={handleMuteToggle}
				aria-label={signal.muted ? 'Unmute Signal' : 'Mute Signal'}
			>
				{signal.muted ? <SpeakerOffIcon /> : <SpeakerLoudIcon />}
			</IconButton>

			{/* Move Left */}
			<IconButton size="1" variant="outline" onClick={handleMoveLeft} aria-label="Move Left">
				<ArrowLeftIcon />
			</IconButton>

			{/* Move Right */}
			<IconButton size="1" variant="outline" onClick={handleMoveRight} aria-label="Move Right">
				<ArrowRightIcon />
			</IconButton>

			{/* Delete */}
			<IconButton size="1" variant="ghost" color="red" onClick={handleDelete} aria-label="Delete Signal">
				<TrashIcon />
			</IconButton>
		</Flex.Row>
	)
}
