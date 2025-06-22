import { Text, Dialog, Button, TextField, TextArea, Switch } from '@radix-ui/themes'
import responses from '#/constants/progressions.json'
import { Flex } from '#/components/layout/Flex'
import { ProgressionChord } from '../ProgressionPanel/ProgressionChord'
import { ProgressionGrid, TempProgressionGrid } from '../ProgressionPanel/ProgressionGrid'

type ProgressionSuggestionT = {
	justification: string
	chords: {
		symbol: string[]
		inversion: number[]
		octave: number[]
		voicing: string[]
	}[]
}

export const SuggestionsDialog = (props) => {
	return (
		<Dialog.Root>
			<Dialog.Trigger>
				<Button color="crimson" variant="solid" size="1">
					AI Suggest
				</Button>
			</Dialog.Trigger>

			<Dialog.Content maxWidth="800px">
				<Dialog.Title>AI Suggestions</Dialog.Title>
				<Dialog.Description size="2" mb="4">
					Make changes to your profile.
				</Dialog.Description>

				<Flex.Column gap="3">
					<TextArea radius="large" placeholder="enter your prompt..." variant="surface" />
					<Text as="label" size="2">
						<Flex.Row gap="2">
							<Switch size="1" defaultChecked />
						</Flex.Row>
					</Text>
				</Flex.Column>

				<Flex.Column gap="8" mt="6">
					{responses.new2.map((suggestion, index) => (
						<Flex.Column key={index} gap="2">
							<Text size="8">{index}.</Text>
							<Text size="2" weight="bold">
								{suggestion.justification}
							</Text>
							<Flex.Row gap="2px">
								<TempProgressionGrid chords={suggestion.chords} />
							</Flex.Row>
						</Flex.Column>
					))}
				</Flex.Column>

				<Flex.Row gap="3" mt="4" justify="end">
					<Dialog.Close>
						<Button variant="soft" color="gray">
							Cancel
						</Button>
					</Dialog.Close>
					<Dialog.Close>
						<Button>Save</Button>
					</Dialog.Close>
				</Flex.Row>
			</Dialog.Content>
		</Dialog.Root>
	)
}

// Please provide me with 10 results objects, each with a brief justification as to why you believe it meets the requirements, andsymbols (string[], an array of chord symbols) that meet my requirements as listed below. You can use any chord that fits in the scale requested, and provide specific octaves, inversions, and voicings in their own arrays that can be matched by index to the chords when I construct them.
// My requirements are:
// scale: F# minor
// vibes: creepy, quirky
// complexity: any
// prompt: 4 chords per progression, kinda fun and funky like 21 pilots, and dark like sub urban / bella poarch. please do not give me very basic, bland chords. give them character
