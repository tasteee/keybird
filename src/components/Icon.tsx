import { Icon as IconifyIcon } from '@iconify/react'
import classNames from 'classnames'
import type { CommonElementPropsT, OnClickEventT } from '../types/props'
import { ICON_NAME_MAP } from '#/configuration/keyboard/constants/iconNameMap'

type PropsT = CommonElementPropsT & {
	name: string
	width?: string
	height?: string
	size?: string
	color?: string

	onClick?: OnClickEventT
	isActive?: boolean
	isDisabled?: boolean
}

const DEFAULT_PROPS = {
	color: 'zinc-7',
	size: '24px'
}

export const Icon = (inputProps: PropsT) => {
	const props = { ...DEFAULT_PROPS, ...inputProps }
	const name = getIconName(props)
	const sizes = getSizeProps(props)
	const color = `var(--${props.color})` || 'white'

	const classes = classNames('Icon', props.className, {
		isDisabled: props.isDisabled,
		isActive: props.isActive
	})

	return (
		<IconifyIcon
			id={props.id}
			className={classes}
			icon={name}
			width={sizes.width}
			height={sizes.height}
			color={color}
			onClick={props.onClick}
			style={props.style}
		/>
	)
}

const getSizeProps = (props: PropsT) => {
	const width = props.width || props.size || '24px'
	const height = props.height || props.width || props.size || '24px'
	return { width, height }
}

const getIconName = (props: PropsT) => {
	const name = ICON_NAME_MAP[props.name] || props.name
	return name
}

// type CommonIconPropsT = {
//   name: string
//   size?: string
// }

// export const CommonIcon = (props: CommonIconPropsT) => {}

// const InfoIcon = <Icon name="icon-park-outline:info" size="16px" color="var(--mantine-primary-color-filled)" />
// const RocketIcon = <Icon name="akar-icons:info" size="24px" color="var(--mantine-primary-color-filled)" />
// const GitHubLogoIcon = <Icon name="mage:github" size="24px" color="var(--mantine-primary-color-filled)" />
// const LightningBoltIcon = <Icon name="bxs:bolt" size="24px" color="var(--mantine-primary-color-filled)" />
// const StarIcon = <Icon name="f7:star" size="24px" color="var(--mantine-primary-color-filled)" />
// const DashboardIcon = <Icon name="f7:chart-bar" size="24px" color="var(--mantine-primary-color-filled)" />
