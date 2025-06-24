import { KEYS } from '#/constants/keys'
import { $output, $project } from '#/stores'
import { Text, Select, Flex, Button } from '@radix-ui/themes'

export const ScaleRootNoteSelect = () => {
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
		<Select.Root size="1" value={scaleType} onValueChange={handleChange}>
			<Select.Trigger color="gray">
				<Text>Scale: {scaleType}</Text>
			</Select.Trigger>
			<Select.Content position="popper">
				<Select.Item value="major">major</Select.Item>
				<Select.Item value="minor">minor</Select.Item>
			</Select.Content>
		</Select.Root>
	)
}

export const BaseOctaveController = () => {
	const defaultOctave = $project.use.lookup('defaultOctave') as number
	const value = String(defaultOctave)

	const handleChange = (newOctave: string) => {
		$project.set.lookup('defaultOctave', Number(newOctave))
	}

	return (
		<Select.Root size="1" value={value} onValueChange={handleChange}>
			<Select.Trigger>
				<Text>Base Octave {defaultOctave}</Text>
			</Select.Trigger>
			<Select.Content position="popper">
				{[-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8].map((octave) => (
					<Select.Item key={octave} value={octave.toString()}>
						{octave}
					</Select.Item>
				))}
			</Select.Content>
		</Select.Root>
	)
}

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
	const { outputType, midiOutputIds, midiOutputName, isMidiEnabled } = $output.use()
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
				{midiOutputIds.map((name) => (
					<Select.Item key={name} value={name}>
						{name}
					</Select.Item>
				))}
			</Select.Content>
		</Select.Root>
	)
}
