import './MainControls.css'

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
import { Switch } from '@radix-ui/themes/dist/esm/components/index.js'
import { OutputControlSwitch } from './OutputControlSwitch'

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
		<Flex.Row px="4" height="32px" gap="2" bg="--sand-4" width="100%" align="center" className="OutputControlsRow">
			<OutputControlSwitch />
			<OutputTypeSelect />
			{isInstrumentSelected ? <InstrumentSelect /> : <MidiOutputSelect />}
		</Flex.Row>
	)
}

const OutputStatusIndicator = (props) => {
	const pulseColor = $output.use.lookup('isOutputEnabled') ? 'var(--grass-9)' : 'var(--red-9)'
	const style = { '--pulseColor': pulseColor, '--dotColor': pulseColor, marginRight: 3 } as React.CSSProperties
	return <span className="DotIndicator" style={style} {...props} />
}

export const MainControls = () => {
	return (
		<Flex.Row justify="between" className="MainControls" px="1">
			<GlobalControlsRow />
			<OutputControlsRow />
		</Flex.Row>
	)
}
