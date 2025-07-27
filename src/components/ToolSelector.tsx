import * as React from 'react'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { Icon } from './common/Icon' // Adjust import path as needed
import classNames from 'classnames'
import { SegmentedControl } from '@radix-ui/themes'

type ToolSelectorPropsT = {
	value?: string
	onValueChange?: (value: string) => void
	defaultValue?: string
	className?: string
}

export const ToolSelector: React.FC<ToolSelectorPropsT> = (props) => {
	const className = classNames('ToolSelector', props.className)

	// return (
	// 	<SegmentedControl.Root defaultValue="inbox">
	// 		<SegmentedControl.Item value="inbox">Inbox</SegmentedControl.Item>
	// 		<SegmentedControl.Item value="drafts">Drafts</SegmentedControl.Item>
	// 		<SegmentedControl.Item value="sent">Sent</SegmentedControl.Item>
	// 	</SegmentedControl.Root>
	// )

	return (
		<ToggleGroup.Root
			className={className}
			type="single"
			value={props.value}
			onValueChange={props.onValueChange}
			defaultValue={props.defaultValue}
			aria-label="Tool selector"
		>
			<ToggleGroup.Item className="ToggleGroupItem" value="add" aria-label="Add tool">
				<Icon name="addBox0" />
			</ToggleGroup.Item>
			<ToggleGroup.Item className="ToggleGroupItem" value="subtract" aria-label="Subtract tool">
				<Icon name="subtractBox0" />
			</ToggleGroup.Item>
			<ToggleGroup.Item className="ToggleGroupItem" value="move" aria-label="Move tool">
				<Icon name="move0" />
			</ToggleGroup.Item>
			<ToggleGroup.Item className="ToggleGroupItem" value="resize" aria-label="Resize tool">
				<Icon name="resize0" />
			</ToggleGroup.Item>
		</ToggleGroup.Root>
	)
}
