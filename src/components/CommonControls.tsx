import appConfig from '#/configuration/app.config.json'
import { KEYS } from '#/constants/keys'
import { $output, $project, $player } from '#/stores'
import { Text, Select } from '@radix-ui/themes'
import { observer } from 'mobx-react-lite'
import { SheSelect } from '#/components/common/Select'

export const ScaleRootNoteSelect = observer(() => {
	const scaleRootNote = $project.scaleRootNote

	const handleChange = (newRootNote: string) => {
		$project.setScaleRootNote(newRootNote)
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
})

export const ScaleTypeSelect = observer(() => {
	const scaleType = $project.scaleType

	const handleChange = (newScaleType: string) => {
		$project.setScaleType(newScaleType)
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
})

export const BaseOctaveController = observer(() => {
	const defaultOctave = $project.baseOctave
	const value = String(defaultOctave)

	const handleChange = (newOctave: string) => {
		$project.baseOctave = Number(newOctave)
	}

	return (
		<Select.Root size="1" value={value} onValueChange={handleChange}>
			<Select.Trigger>
				<Text>Base Octave {defaultOctave}</Text>
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
})

const outputTargetOptionsMap = {
	instrument: 'Built-In Instrument',
	midi: 'MIDI Port'
}

export const OutputTypeSelect = observer(() => {
	const text = $output.outputType === 'instrument' ? 'Instrument' : 'MIDI Output'

	const handleChange = (value: string) => {
		$output.outputType = value as 'instrument' | 'midi'
	}

	return (
		<SheSelect value={$output.outputType} onChange={handleChange} label={`Output: ${text}`} options={outputTargetOptionsMap} />
	)
})

const instrumentOptions = appConfig.instrumentNames.map((name) => {
	const value = name.replace(/ /g, '_')
	return [value, name] as [string, string]
})

export const InstrumentSelect = observer(() => {
	const handleChange = (instrumentName: string) => {
		$player.selectInstrument(instrumentName)
	}

	return (
		<SheSelect.Paginated
			value={$player.instrumentName}
			onChange={handleChange}
			label={`Instrument: ${$player.instrumentName}`}
			options={instrumentOptions}
			itemsPerPage={15}
		/>
	)
})

export const MidiOutputSelect = observer(() => {
	const isMidiOutputSelected = $output.outputType === 'midi'
	const isDisabled = !$output.isMidiEnabled || !isMidiOutputSelected
	const value = isDisabled ? 'Disabled' : $output.midiOutputName

	const handleChange = (newMidiOutputName: string) => {
		$output.setMidiOutput({ outputId: newMidiOutputName })
	}

	return (
		<Select.Root size="1" value={value} onValueChange={handleChange}>
			<Select.Trigger variant="soft">
				<Text>MIDI Output: {value}</Text>
			</Select.Trigger>
			<Select.Content position="popper">
				{$output.midiOutputIds.map((name) => (
					<Select.Item key={name} value={name}>
						{name}
					</Select.Item>
				))}
			</Select.Content>
		</Select.Root>
	)
})
