import { $input } from '#/stores/$input'
import { Text } from '@radix-ui/themes'

export const QwertyTargetIndicator = (props) => {
	const qwertyTarget = $input.qwertyPerformTarget.use()
	const isQuertyTarget = qwertyTarget === props.target
	if (!isQuertyTarget) return null

	return (
		<Text size="1" color="gray">
			[QUERTY TARGET]
		</Text>
	)
}
