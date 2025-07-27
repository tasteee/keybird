import './ControlBox.css'
import React from 'react'
import classNames from 'classnames'

type ArgsT = {
	children: React.ReactNode
	className?: string
	testId?: string
	height?: string
	width?: string
	position?: 'absolute' | 'relative' | 'fixed' | 'sticky'
	top?: string
	left?: string
	right?: string
	bottom?: string
	zIndex?: number
	style?: React.CSSProperties
	id?: string
}

export const ControlBox = (args: ArgsT) => {
	const className = classNames('ControlBox', args.className)

	const style: React.CSSProperties = {
		height: args.height,
		width: args.width,
		position: args.position,
		top: args.top,
		left: args.left,
		right: args.right,
		bottom: args.bottom,
		zIndex: args.zIndex,
		...(args.style || {})
	}

	return (
		<div className={className} data-testid={args.testId} id={args.id} style={style}>
			{args.children}
		</div>
	)
}
