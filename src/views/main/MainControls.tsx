import { Button, Select, Text } from '@radix-ui/themes'
import { Flex } from '#/components/layout/Flex'
import { $output, $project } from '#/stores'
import { KEYS } from '#/constants/keys'

export const OutputTypeSelect = () => {
	const { outputType } = $output.use()
	const text = outputType === 'instrument' ? 'Instrument' : 'MIDI Output'

	const handleChange = (value: string) => {
		$output.set.lookup('outputType', value)
	}

	return (
		<Select.Root size="1" value={outputType} onValueChange={handleChange}>
			<Select.Trigger variant="soft">
				<Text>Output: {text}</Text>
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="midi">MIDI Port</Select.Item>
				<Select.Item value="instrument">Built-In Instrument</Select.Item>
			</Select.Content>
		</Select.Root>
	)
}

export const InstrumentSelect = () => {
	const { instrumentIds, selectedInstrumentName } = $output.use()

	const handleChange = (instrumentName: string) => {
		$output.set.lookup('selectedInstrumentName', instrumentName)
	}

	return (
		<Select.Root size="1" value={selectedInstrumentName} onValueChange={handleChange}>
			<Select.Trigger variant="soft">
				<Text>Instrument: {selectedInstrumentName}</Text>
			</Select.Trigger>
			<Select.Content>
				{instrumentIds.map((name) => (
					<Select.Item key={name} value={name}>
						{name}
					</Select.Item>
				))}
			</Select.Content>
		</Select.Root>
	)
}

export const MidiOutputSelect = () => {
	const { outputType, midiOutputNames, midiOutputName, isMidiEnabled } = $output.use()

	const isMidiOutputSelected = outputType === 'midi'
	const isDisabled = !isMidiEnabled || !isMidiOutputSelected
	const value = isDisabled ? 'Disabled' : midiOutputName

	const handleChange = (newMidiOutputName: string) => {
		$output.set.lookup('midiOutputName', newMidiOutputName)
	}

	return (
		<Select.Root size="1" value={value} onValueChange={handleChange}>
			<Select.Trigger variant="soft">
				<Text>MIDI Output: {value}</Text>
			</Select.Trigger>
			<Select.Content position="popper">
				{midiOutputNames.map((name) => (
					<Select.Item key={name} value={name}>
						{name}
					</Select.Item>
				))}
			</Select.Content>
		</Select.Root>
	)
}

export const BaseOctaveController = () => {
	const baseOctave = $project.use.lookup('baseOctave') as number
	const value = String(baseOctave)

	const handleChange = (newOctave: string) => {
		$project.set.lookup('baseOctave', Number(newOctave))
	}

	return (
		<Select.Root size="1" value={value} onValueChange={handleChange}>
			<Select.Trigger>
				<Text>Octave {baseOctave}</Text>
			</Select.Trigger>
			<Select.Content position="popper">
				{[0, 1, 2, 3, 4, 5, 6, 7, 8].map((octave) => (
					<Select.Item key={octave} value={octave.toString()}>
						{octave}
					</Select.Item>
				))}
			</Select.Content>
		</Select.Root>
	)
}

export const KeyNameSelect = () => {
	const scaleRootNote = $project.use.lookup<string>('scaleRootNote')

	const handleChange = (newRootNote: string) => {
		$project.set.lookup('scaleRootNote', newRootNote)
	}

	return (
		<Select.Root size="1" value={scaleRootNote} onValueChange={handleChange}>
			<Select.Trigger>
				<Text>Key: {scaleRootNote}</Text>
			</Select.Trigger>
			<Select.Content position="popper" variant="soft">
				{KEYS.all.map((key) => (
					<Select.Item key={key} value={key}>
						{key}
					</Select.Item>
				))}
			</Select.Content>
		</Select.Root>
	)
}

export const ScaleTypeSelect = () => {
	const scaleType = $project.use.lookup<string>('scaleType')

	const handleChange = (newScaleType: string) => {
		$project.set.lookup('scaleType', newScaleType)
	}

	return (
		<Select.Root size="1" value={scaleType} onValueChange={handleChange} color="violet">
			<Select.Trigger color="violet">
				<Text>Scale: {scaleType}</Text>
			</Select.Trigger>
			<Select.Content position="popper">
				<Select.Item value="major">major</Select.Item>
				<Select.Item value="minor">minor</Select.Item>
			</Select.Content>
		</Select.Root>
	)
}

export const GlobalControlsRow = () => {
	return (
		<Flex.Row pl="4" gap="2">
			<KeyNameSelect />
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
			<DotIndicator />
			<OutputTypeSelect />
			{isInstrumentSelected ? <InstrumentSelect /> : <MidiOutputSelect />}
		</Flex.Row>
	)
}

const DotIndicator = (props) => {
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
