import './PatternEditor.css'
import { NOTE_IDS } from '#/configuration/keyboard/constants/noteIds'
import { Flex } from '#/components/layout/Flex'
import { SegmentedControl, Separator, Text, TextField } from '@radix-ui/themes'
import React, { useEffect } from 'react'
import { useComponentSize } from 'react-use-size'
import range from 'array-range'
import { $patternEditor } from './patternEditor.store'
import { GridSignalRow } from './GridSignalRow'
import { useHotkeys } from '#/modules/hooks'
import { $keysPressed } from '#/modules/$keysPressed.store'
import { Icon } from '#/components/Icon'
import { ToolSelector } from '#/components/ToolSelector'
import { InfoBox } from '#/components/InfoBox'
import { useDatass } from 'datass'
import MenubarDemo from '#/components/MenuBar'
import { $project } from '#/stores'

const SIGNAL_INDEXES = range(1, 33)

const useGridColumnAndSignalCellWidth = () => {
	// TIDIL find a hook to react to window resize
	// so this will update when the window resizes.
	const { ref, width } = useComponentSize()
	const signalCellWidth = $patternEditor.cellWidth.use()

	React.useEffect(() => {
		if (!width) return
		const final = Math.floor(width / SIGNAL_INDEXES.length)
		const flooredWidth = Math.floor(width)
		if (final === signalCellWidth) return
		console.log('Setting signal cell width to:', final, 'from width:', flooredWidth)
		$patternEditor.cellWidth.set(final)
	}, [width])

	return { ref, width, cellWidth: signalCellWidth }
}

// This is the top row, like the header labels
// for each column. (1, 2, 3... etc).
const GridColumnMarkersRow = () => {
	return (
		<Flex.Row className="GridColumnMarkersRow" height="32px">
			{SIGNAL_INDEXES.map((signalIndex) => (
				<Flex.Row className="markerCell" key={signalIndex} width="32px" height="32px" align="center">
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
		<Flex.Row className="LeftColumnSpacerRow" height="33px" width="100%" style={{ paddingTop: 8 }}>
			<Icon name="note0" size="18px" />
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
	const enabledSignalRowIds = $patternEditor.enabledSignalRowIds.use()

	return (
		<Flex.Column className="PatternEditor" pr="2" pb="1">
			<ToolBar />
			<Flex.Row className="mainContainer">
				<Flex.Column className="topRow" width="16px" align="center">
					<Flex.Row className="topRowContent" width="100%" height="32px" align="center"></Flex.Row>
				</Flex.Column>
				<Flex.Column className="rowLabelsColumn" maxWidth="32px" pr="8px">
					<LeftColumnSpacerRow />
					{enabledSignalRowIds.map((rowId) => (
						<Flex.Row key={rowId} className="rowLabelBox" align="center">
							<Text className="noteIdLabel">{rowId}</Text>
						</Flex.Row>
					))}
				</Flex.Column>
				<GridContainerColumn enabledIds={enabledSignalRowIds} />
			</Flex.Row>
		</Flex.Column>
	)
}

const ToolBar = () => {
	const activeTool = $patternEditor.activeTool.use()
	const project = $project.use()

	return (
		<Flex.Row
			className="headerRow"
			align="center"
			// justify="between"
			height="32px"
			width="100%"
			px="2"
			style={{ background: 'var(--sand-2)', borderBottom: '1px solid var(--color-border)', position: 'sticky', left: 1 }}
		>
			<ProjectNameController />
			<MenubarDemo />
			<Flex.Row align="center"></Flex.Row>
		</Flex.Row>
	)
}

const ProjectNameController = () => {
	return (
		<TextField.Root
			placeholder="project name..."
			size="2"
			value={$project.use.lookup('name')}
			onChange={(e) => $project.set.lookup('name', e.target.value)}
			variant="soft"
			className="projectNameInput"
			style={{ width: '200px' }}
		>
			<TextField.Slot>
				<Icon name="edit0" size="12px" color="sand-10" />
			</TextField.Slot>
		</TextField.Root>
	)
}

// This is the main container for the top (column labels)
// row and the whole grid below it. It is used to track its
// width so we can adjust the cignal ells to fill up the space.
export const GridContainerColumn = (props) => {
	return (
		<Flex.Column className="GridColumn" width="100%">
			<GridColumnMarkersRow />
			{props.enabledIds.map((rowId) => (
				<GridSignalRow key={rowId} rowId={rowId} rowIds={props.enabledIds} />
			))}
		</Flex.Column>
	)
}

const ToolsSelector = () => {
	return (
		<SegmentedControl.Root className="ToolSelector">
			<SegmentedControl.Item
				value="add"
				className="ToolSelectorOption"
				style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
			>
				{/* <Icon name="addBox0" size="12px" color="sand-11" /> */}
				<Text size="1" style={{ marginLeft: '4px' }}>
					Add
				</Text>
			</SegmentedControl.Item>
			<SegmentedControl.Item
				value="subtract"
				className="ToolSelectorOption"
				style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
			>
				{/* <Icon name="xBox0" size="18px" color="sand-11" /> */}
				<Text size="1" style={{ marginLeft: '4px' }}>
					Remove
				</Text>
			</SegmentedControl.Item>
			<SegmentedControl.Item
				value="move"
				className="ToolSelectorOption"
				style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
			>
				{/* <Icon name="move0" size="20px" color="sand-11" /> */}
				<Text size="1" style={{ marginLeft: '4px' }}>
					Move
				</Text>
			</SegmentedControl.Item>
			<SegmentedControl.Item
				value="resize"
				className="ToolSelectorOption"
				style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
			>
				{/* <Icon name="resize0" size="20px" color="sand-11" /> */}
				<Text size="1" style={{ marginLeft: '4px' }}>
					Resize
				</Text>
			</SegmentedControl.Item>
		</SegmentedControl.Root>
	)
}
