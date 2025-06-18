import { Flex as RadixFlex, FlexProps } from '@radix-ui/themes'
import { useTestId } from '#/utilities/props'
import React from 'react'

type PropsT = FlexProps & {
	testId?: string
	width?: string | number
	height?: string | number
	style?: React.CSSProperties
	className?: string
	radius?: string | number
	bg?: string
	as?: string
}

type CreateFlexBoxOptionsT = {
	componentId: string
	direction: 'row' | 'column'
}

const getStyle = (props: PropsT) => {
	const { width, height, style, radius, bg } = props
	if (!width && !height && !bg && !radius) return style

	const background = bg && (bg.startsWith('--') ? `var(${bg})` : bg)
	const radiuss = radius ? `${radius}` : undefined
	if (!style) return { width, height, background, borderRadius: radiuss }

	const _style: React.CSSProperties = { ...style }
	if (width) _style.width = width
	if (height) _style.height = height
	if (radiuss) _style.borderRadius = radiuss
	if (background) _style.background = background
	return _style
}

const createFlexBoxComponent = (options: CreateFlexBoxOptionsT) => {
	return React.forwardRef<HTMLDivElement, PropsT>((props: PropsT, ref) => {
		const { testId, width, height, ...otherProps } = props
		const style = getStyle(props)
		const _testId = useTestId(options.componentId, props)
		const updatedProps = { ...otherProps, direction: options.direction } as FlexProps
		return <RadixFlex ref={ref} {...updatedProps} data-testid={_testId} style={style} />
	})
}

export const Flex = {
	Row: createFlexBoxComponent({ componentId: 'Flex.Row', direction: 'row' }),
	Column: createFlexBoxComponent({ componentId: 'Flex.Column', direction: 'column' })
}
