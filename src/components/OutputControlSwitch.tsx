import { $output } from '#/stores'
import { Switch } from '@radix-ui/themes/dist/esm/components/index.js'

export const OutputControlSwitch = () => {
	const isOutputEnabled = $output.use.lookup<boolean>('isOutputEnabled')

	const toggleOutput = (value) => {
		$output.set.lookup('isOutputEnabled', value)
	}

	return (
		<Switch
			size="1"
			checked={isOutputEnabled}
			onCheckedChange={toggleOutput}
			className="OutputControlSwitch"
			style={{ marginRight: 3 }}
		/>
	)
}
