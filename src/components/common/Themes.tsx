import { Theme as RadixTheme } from '@radix-ui/themes'

export const GrayTheme = (props) => {
	return <RadixTheme accentColor="gray" grayColor="sand" radius="small" scaling="90%" {...props} />
}

export const Themes = {
	GrayTheme
}
