import './TopBar.css'
import { Flex } from '#/components/layout/Flex'
import { Text, Box, Link, Tabs, Select } from '@radix-ui/themes'
import { useLocation } from 'wouter'
import { BaseOctaveController, ScaleRootNoteSelect, ScaleTypeSelect } from '#/views/main/CommonControls'

export const TopBar = () => {
	const [location, setLocation] = useLocation()
	const value = location.startsWith('/patterns') ? '/patterns' : '/chords'

	const onChange = (path) => {
		setLocation(path || '/chords')
	}

	return (
		<Flex.Row className="TopBar" align="center" px="4" gap="4" justify="between">
			<Flex.Row align="center" gap="4">
				<img src="/images/keybirdLogo.svg" className="Logo" style={{ maxWidth: 80 }} />
				<ViewSelect value={value} onChange={onChange} />
			</Flex.Row>
			<Flex.Row align="center" gap="2">
				<ScaleRootNoteSelect />
				<ScaleTypeSelect />
				<BaseOctaveController />
			</Flex.Row>
		</Flex.Row>
	)
}

const ViewSelect = (props) => {
	return (
		<Select.Root value={props.value} size="1" onValueChange={props.onChange}>
			<Select.Trigger variant="soft" />
			<Select.Content>
				<Select.Item value="/chords">Chords</Select.Item>
				<Select.Item value="/patterns">Patterns</Select.Item>
			</Select.Content>
		</Select.Root>
	)
}
