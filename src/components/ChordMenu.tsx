import { Flex } from '#/components/layout/Flex'
import { Box, Text, ContextMenu, Select, TextField, Button } from '@radix-ui/themes'
import { TinyStat } from './TinyStat'
import './ChordMenu.css'
import { getAccentColorClassName } from '#/modules/color'
import { Icon } from './Icon'

type PropsT = {
	setVoicing?: (value: string) => void
	setInversion?: (value: number) => void
	setOctaveOffset?: (value: number) => void
	addChord?: () => void
	removeChord?: () => void
	setMinVelocity?: (value: number) => void
	setMaxVelocity?: (value: number) => void
	state: CustomChordT
	children?: React.ReactNode
}

export const ChordMenu = (props: PropsT) => {
	const accentsClassName = getAccentColorClassName(props.state.rootNote)

	return (
		<ContextMenu.Root modal={false}>
			<ContextMenu.Trigger>{props.children}</ContextMenu.Trigger>
			<ContextMenu.Content className={`ChordMenu ${accentsClassName}`}>
				<Flex.Row gap="2" align="center" justify="center">
					<span className="coloredCircle" />
					<Text>{props.state.symbol}</Text>
				</Flex.Row>

				<ContextMenu.Separator />

				<Flex.Column minWidth="220px" p="4px" gap="3">
					<Flex.Row gap="2" width="100%">
						<TinyStat.Number
							label="Octave Offset"
							min={-3}
							max={8}
							step={1}
							value={props.state.octaveOffset}
							style={{ width: '50%', flexGrow: 1 }}
							onValueChange={(value) => props.setOctaveOffset(value)}
						/>
						<TinyStat.Number
							label="Inversion"
							min={-3}
							max={3}
							step={1}
							value={props.state.inversion}
							style={{ width: '50%', flexGrow: 1 }}
							onValueChange={(value) => props.setInversion(value)}
						/>
					</Flex.Row>

					<Flex.Row gap="2" width="100%">
						<TinyStat.Number
							label="Min. Velocity"
							min={0}
							max={127}
							step={5}
							value={props.state.minVelocity}
							style={{ width: '50%', flexGrow: 1 }}
							onValueChange={(value) => props.setMinVelocity(value)}
						/>
						<TinyStat.Number
							label="Max. Velocity"
							min={0}
							max={127}
							step={5}
							value={props.state.maxVelocity}
							style={{ width: '50%', flexGrow: 1 }}
							onValueChange={(value) => props.setMaxVelocity(value)}
						/>
					</Flex.Row>

					<ContextMenu.Separator />

					<Flex.Row gap="2" width="100%">
						<Select.Root size="3" value={props.state.voicing} onValueChange={(value) => props.setVoicing(value)}>
							<Select.Trigger style={{ width: '100%' }}>
								<Text className="normalFont">Voicing: {props.state.voicing}</Text>
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="closed">Closed</Select.Item>
								<Select.Item value="open">Open</Select.Item>
								<Select.Item value="drop2">Drop 2</Select.Item>
								<Select.Item value="drop3">Drop 3</Select.Item>
								<Select.Item value="drop2and4">Drop 2 & 4</Select.Item>
								<Select.Item value="rootless">Rootless</Select.Item>
								<Select.Item value="spread">Spread</Select.Item>
								<Select.Item value="cluster">Cluster</Select.Item>
							</Select.Content>
						</Select.Root>
					</Flex.Row>
					{/* <Flex.Row gap="2" width="100%">
						<Button size="2" variant="soft" color="teal" style={{ flex: 1 }}>
							<Icon name="thumbsUp1" size="12px" color="white" />
							<Text>Like</Text>
						</Button>
						<Button size="2" variant="soft" color="crimson" style={{ flex: 1 }}>
							<Icon name="thumbsDown1" size="12px" color="white" />
							<Text>Dislike</Text>
						</Button>
					</Flex.Row> */}
				</Flex.Column>
			</ContextMenu.Content>
		</ContextMenu.Root>
	)
}
