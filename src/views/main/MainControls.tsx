import { Flex } from '#/components/layout/Flex'
import { $output, $project } from '#/stores'
import {
	BaseOctaveController,
	InstrumentSelect,
	ScaleRootNoteSelect,
	MidiOutputSelect,
	OutputTypeSelect,
	ScaleTypeSelect
} from './CommonControls'

export const GlobalControlsRow = () => {
	return (
		<Flex.Row pl="4" gap="2">
			<ScaleRootNoteSelect />
			<ScaleTypeSelect />
			<BaseOctaveController />
		</Flex.Row>
	)
}

export const OutputControlsRow = () => {
	const { outputType } = $output.use()
	const isInstrumentSelected = outputType === 'instrument'

	return (
		<Flex.Row
			px="4"
			height="32px"
			gap="2"
			bg="--sand-4"
			width="100%"
			align="center"
			style={{ position: 'fixed', bottom: 0, left: 0 }}
		>
			<OutputStatusIndicator />
			<OutputTypeSelect />
			{isInstrumentSelected ? <InstrumentSelect /> : <MidiOutputSelect />}
		</Flex.Row>
	)
}

const OutputStatusIndicator = (props) => {
	const background = $output.use.lookup('isOutputActive') ? 'var(--grass-9)' : 'var(--red-9)'
	return <span className="DotIndicator" style={{ marginRight: 4, '--dotColor': background }} {...props} />
}

export const MainControls = () => {
	return (
		<Flex.Row justify="between" className="MainControls" px="1">
			<GlobalControlsRow />
			<OutputControlsRow />
		</Flex.Row>
	)
}
