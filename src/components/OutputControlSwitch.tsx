import { $output } from '#/stores'
import { Switch } from '@radix-ui/themes/dist/esm/components/index.js'
import { observer } from 'mobx-react-lite'

export const OutputControlSwitch = observer(() => {
	const toggleOutput = (value: boolean) => {
		$output.isOutputEnabled = value
	}

	return (
		<Switch
			size="1"
			checked={$output.isOutputEnabled}
			onCheckedChange={toggleOutput}
			className="OutputControlSwitch"
			style={{ marginRight: 3 }}
		/>
	)
})
