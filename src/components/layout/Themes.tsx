import { Theme as RadixTheme } from '@radix-ui/themes'

export const GrayTheme = (props) => {
	return (
		<RadixTheme
			// data-testid="GrayTheme"
			// className="GrayTheme sandTheme sand"
			// appearance="dark"
			// accentColor="sand"
			// grayColor="sand"
			// panelBackground="solid"
			// scaling="90%"
			// radius="small"
			accentColor="gray"
			grayColor="gray"
			radius="small"
			scaling="90%"
			{...props}
		/>
	)
}
