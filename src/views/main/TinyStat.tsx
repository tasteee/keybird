import { Icon } from '#/components/Icon'
import { Flex } from '#/components/layout/Flex'
import { Spacer } from '#/components/layout/Spacer'
import { Text } from '@radix-ui/themes'

type PropsT = {
	label: string
	value: string | number
	onClick: () => void
}

export const TinyStat = (props: PropsT) => {
	return (
		<Flex.Column onClick={props.onClick} className="TinyStat" bg="--sand-4" p="2" radius="4px">
			<Text size="1">{props.label.toUpperCase()}</Text>
			<Text size="2" weight="bold">
				{props.value}
			</Text>
		</Flex.Column>
	)
}

type TinyStatNumberPropsT = {
	label: string
	value: number | string
	min?: number
	max?: number
	step?: number
	onValueChange?: (value: number) => void
	onIncrementClick?: () => void
	onDecrementClick?: () => void
}

TinyStat.Number = (props: TinyStatNumberPropsT) => {
	const onIncrementClick = () => {
		const number = typeof props.value === 'number' ? props.value : parseFloat(props.value)
		const newValue = number + (props.step || 1)
		const clamped = props.max !== undefined ? Math.min(newValue, props.max) : newValue
		props.onValueChange(clamped)
	}

	const onDecrementClick = () => {
		const number = typeof props.value === 'number' ? props.value : parseFloat(props.value)
		const newValue = number - (props.step || 1)
		const clamped = props.min !== undefined ? Math.max(newValue, props.min) : newValue
		props.onValueChange(clamped)
	}

	return (
		<Flex.Column className="TinyStat TinyStatNumber" bg="--sand-4" p="2" radius="4px">
			<Text size="1" mx="auto">
				{props.label.toUpperCase()}
			</Text>
			<Spacer size="4px" />
			<Flex.Row align="center" justify="center" gap="2">
				<Icon className="crementIcon" name="ic:baseline-remove" size="12px" color="sand-11" onClick={onDecrementClick} />
				<Text size="3" weight="bold">
					{props.value}
				</Text>
				<Icon className="crementIcon" name="ic:baseline-add" size="12px" color="sand-11" onClick={onIncrementClick} />
			</Flex.Row>
		</Flex.Column>
	)
}
