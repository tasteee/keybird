import './MainMenuBar.css'
import { Flex } from '#/components/layout/Flex'
import { Text, Box, Link, Tabs } from '@radix-ui/themes'
import { useLocation } from 'wouter'
import { Spacer } from '../layout/Spacer'

export const MainMenuBar = () => {
	const [location, setLocation] = useLocation()

	const routeToChordBrowser = () => {
		setLocation('/')
	}

	const routeToPatternEditor = () => {
		setLocation('/patternEditor')
	}

	const routeToKeyboard = () => {
		setLocation('/keyboard')
	}

	return (
		<Flex.Column p="4" gap="3" data-testid="MainMenuBar" className="MainMenuBar">
			<Flex.Row gap="4" align="center" className="MainMenuBarRow" wrap="wrap">
				<Flex.Row justify="start" align="center" gap="6">
					<img src="/images/keybirdLogo.svg" className="MainMenuBarLogo" />
				</Flex.Row>
				<Spacer width="24px" />
				<Flex.Row className="LinksSwitch" gap="6">
					<Link className="MainMenuBarLink" onClick={routeToKeyboard}>
						Keyboard
					</Link>
					<Link className="MainMenuBarLink" onClick={routeToChordBrowser}>
						Chords
					</Link>
					<Link className="MainMenuBarLink" onClick={routeToPatternEditor}>
						Patterns
					</Link>
				</Flex.Row>
			</Flex.Row>
		</Flex.Column>
	)
}

export const TopBar = () => {
	return (
		<Flex.Row className="TopBar" align="center" px="4" gap="2">
			<img src="/images/keybirdLogo.svg" className="Logo" style={{ maxWidth: 80 }} />
			<Tabs.Root defaultValue="account" onValueChange={(value) => console.log('Tab changed to:', value)}>
				<Tabs.List highContrast color="gray" className="TopBarTabs">
					<Tabs.Trigger value="account">Chords</Tabs.Trigger>
					<Tabs.Trigger value="documents">Patterns</Tabs.Trigger>
					<Tabs.Trigger value="settings">Settings</Tabs.Trigger>
				</Tabs.List>
			</Tabs.Root>
		</Flex.Row>
	)
}
