import React from 'react'
import ReactWebComponent from 'react-web-component'

interface FlexRowProps {
	x?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
	y?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
	wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
	gap?: string
	gapx?: string
	gapy?: string
	children?: React.ReactNode
}

const FlexRow: React.FC<FlexRowProps> = ({ x = 'start', y = 'center', wrap = 'nowrap', gap, gapx, gapy, children }) => {
	const style: React.CSSProperties = {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: mapAlign(x),
		alignItems: mapAlign(y),
		flexWrap: wrap
	}

	// Handle gap logic, flexbox supports gap but fallback with margins if needed
	if (gap) {
		style.gap = gap
	}
	if (!gap && (gapx || gapy)) {
		style.columnGap = gapx
		style.rowGap = gapy
	}

	return <div style={style}>{children}</div>
}

function mapAlign(value: string | undefined) {
	// Map custom x,y values to valid CSS flexbox alignment
	switch (value) {
		case 'start':
			return 'flex-start'
		case 'end':
			return 'flex-end'
		case 'center':
			return 'center'
		case 'stretch':
			return 'stretch'
		case 'baseline':
			return 'baseline'
		default:
			return undefined
	}
}

export default FlexRow

ReactWebComponent.create(<FlexRow />, 'flex-row')
