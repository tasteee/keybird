import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Callout } from '@radix-ui/themes'

export const InfoBox = (props) => {
	return (
		<Callout.Root size="1" variant="surface">
			<Callout.Icon>
				<InfoCircledIcon />
			</Callout.Icon>
			<Callout.Text>{props.children}</Callout.Text>
		</Callout.Root>
	)
}
