import './PatternEditor.css'
import { Flex } from '#/components/common/Flex'
import { IconButton, SegmentedControl, Separator, Slider, Text, TextField } from '@radix-ui/themes'
import range from 'array-range'
import { $pattern } from '#/stores/$pattern'
import { $progression } from '#/stores'
import { GridSignalRow } from './GridSignalRow'
import { Icon } from '#/components/common/Icon'
import { observer } from 'mobx-react-lite'
import { PlaybackMarkerPattern } from './PlaybackMarkerPattern'
import { ensureChordSelection, playPreviewNote } from '#/modules/patternPreview'
import { useEffect } from 'react'

const SIGNAL_INDEXES = range(1, 256)

// This is the top row, like the header labels
// for each column. (1, 2, 3... etc).
const GridColumnMarkersRow = observer(() => {
	const maxWidth = $pattern.lengthBeats * 32 + 'px'

	return (
		<Flex.Row
			className="GridColumnMarkersRow"
			height="24px"
			minWidth={maxWidth}
			maxWidth={maxWidth}
			width="100%"
			overflowX="hidden"
		>
			{SIGNAL_INDEXES.map((signalIndex) => (
				<Flex.Row className="markerCell" key={signalIndex} height="24px" align="center">
					<Text>{signalIndex}</Text>
				</Flex.Row>
			))}
		</Flex.Row>
	)
})

// This adds a spacer above the left side (row labels)
// so that they align with the grid to their rigt, below the column lables.
const LeftColumnSpacerRow = () => {
	return (
		<Flex.Row className="LeftColumnSpacerRow" height="24px" width="100%" pt="7px" pl="2px">
			<Icon name="note0" size="12px" />
		</Flex.Row>
	)
}

// We are creating MIDI patternsthat can be applied to any
// chord progressions we pair the pattern with in the future.
// So we have a midi roll kind of interface, but instead of notes
// on the left, we have  M0 for the root note of a chord, N1 for
// the first note, ...etc. Then our midi roll also covers up to 2
// more octaves in both directions, so we have N0M1O (which means
// note 1 minus 1 octave). N2M1O, etc, etc, N7M2O...
// And goingup, we have N1A1O, N2M1O, etc, etc.

export const PatternEditor = observer(() => {
	// Ensure a chord is selected when the pattern editor is displayed or progression changes
	useEffect(() => {
		ensureChordSelection({})
	}, [$progression.steps.length])

	const deselect = (event: React.MouseEvent) => {
		event.preventDefault() // Prevent default context menu on right-click
		event.stopPropagation() // Stop the event from bubbling up
		$pattern.selectedSignalId = '' // Deselect on right-click
	}

	return (
		<Flex.Column className="PatternEditor" pr="2" pb="1" position="relative" onContextMenu={deselect}>
			<Flex.Row className="mainContainer">
				<Flex.Column className="rowLabelsColumn" pr="8px">
					<LeftColumnSpacerRow />
					<RowLabels />
				</Flex.Column>
				<GridContainerColumn />
			</Flex.Row>
		</Flex.Column>
	)
})

const RowLabels = observer(() => {
	return (
		<>
			{$pattern.activeToneIds.map((toneId) => (
				<RowLabel key={toneId} toneId={toneId} />
			))}
		</>
	)
})

const RowLabel = observer((props: { toneId: string }) => {
	const onClick = () => {
		playPreviewNote({ toneId: props.toneId, duration: 1.0 })

		// TODO: Select all signals in this row
		// const rowSignals = $pattern.toneMap[props.toneId]?.signalIds || []
		// rowSignals.forEach(signalId => {
		//   // Add logic to select multiple signals if needed
		// })
	}

	return (
		<Flex.Row key={props.toneId} className="rowLabelBox" align="center" onClick={onClick} style={{ cursor: 'pointer' }}>
			<Text className="rowIdLabel">{props.toneId}</Text>
		</Flex.Row>
	)
})

// This is the main container for the top (column labels)
// row and the whole grid below it. It is used to track its
// width so we can adjust the cignal ells to fill up the space.
export const GridContainerColumn = observer((props) => {
	const maxWidth = $pattern.lengthBeats * 32

	return (
		<Flex.Column className="GridColumn" width="100%" position="relative">
			<PlaybackMarkerPattern containerWidth={maxWidth} />
			<GridColumnMarkersRow />
			{$pattern.activeToneIds.map((toneId) => (
				<GridSignalRow key={toneId} toneId={toneId} />
			))}
		</Flex.Column>
	)
})
