import './PatternEditor.css'
import { Flex } from '#/components/layout/Flex'
import { IconButton, SegmentedControl, Separator, Slider, Text, TextField } from '@radix-ui/themes'
import range from 'array-range'
import { $patternEditor } from './patternEditor.store'
import { GridSignalRow } from './GridSignalRow'
import { Icon } from '#/components/Icon'

const SIGNAL_INDEXES = range(1, 256)

// This is the top row, like the header labels
// for each column. (1, 2, 3... etc).
const GridColumnMarkersRow = () => {
	const beatsLength = $patternEditor.beatsLength.use()
	const maxWidth = beatsLength * 32 + 'px'

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
}

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

export const PatternEditor = () => {
	const deselect = (event) => {
		event.preventDefault() // Prevent default context menu on right-click
		event.stopPropagation() // Stop the event from bubbling up
		$patternEditor.selectedSignalId.set.reset() // Deselect on right-click
	}

	return (
		<Flex.Column className="PatternEditor" pr="2" pb="1" position="relative" onContextMenu={deselect}>
			<Flex.Row className="mainContainer">
				<Flex.Column className="rowLabelsColumn" maxWidth="32px" pr="8px">
					<LeftColumnSpacerRow />
					<RowLabels />
				</Flex.Column>
				<GridContainerColumn />
			</Flex.Row>
		</Flex.Column>
	)
}

const RowLabels = () => {
	return (
		<>
			{$patternEditor.enabledSignalRowIds.use().map((rowId) => (
				<Flex.Row key={rowId} className="rowLabelBox" align="center">
					<Text className="rowIdLabel">{rowId}</Text>
				</Flex.Row>
			))}
		</>
	)
}

// This is the main container for the top (column labels)
// row and the whole grid below it. It is used to track its
// width so we can adjust the cignal ells to fill up the space.
export const GridContainerColumn = (props) => {
	return (
		<Flex.Column className="GridColumn" width="100%">
			<GridColumnMarkersRow />
			{$patternEditor.enabledSignalRowIds.use().map((rowId) => (
				<GridSignalRow key={rowId} rowId={rowId} />
			))}
		</Flex.Column>
	)
}
