import { motion } from 'motion/react'
import React, { useRef, useCallback, useState, useEffect } from 'react'
import { Flex } from '#/components/layout/Flex'
import { Text } from '@radix-ui/themes'
import { $patternEditor } from './patternEditor.store'
import range from 'array-range'
import classcat from 'classcat'
import { $keysPressed, useKeyComboHandler } from '#/modules/$keysPressed.store'
import { useClickAway } from 'react-use'
import { useOnClickOutside } from 'usehooks-ts'
import { useDatass } from 'datass'

const SIGNAL_INDEXES = range(1, 256)

type SignalRowCellsPropsT = {
	beatsLength: number
	rowId: string
}

const SignalRowCells = React.memo((props: SignalRowCellsPropsT) => {
	const cells = []

	for (let i = 0; i < props.beatsLength; i++) {
		cells.push(
			<Flex.Row
				key={`${props.rowId}-${i}`}
				className="GridSignalCell"
				data-column={i + 1}
				data-row={props.rowId}
				style={{ width: props.beatsLength / SIGNAL_INDEXES.length + 'px' }}
			/>
		)
	}

	return cells
})

const divisionWidth = 32 / 4
const cellWidth = 32
const getDivisionsCount = (width: number) => Math.floor(width / divisionWidth)
const getCellsCount = (width: number) => Math.floor(width / cellWidth)
const getMaxDivisions = (patternLength: number) => 128
const clampDivision = (division: number, maxDivisions: number) => Math.max(0, Math.min(division, maxDivisions))

const getVelocityText = (signal: SignalT) => {
	const min = signal.minVelocity || 59
	const max = signal.maxVelocity || 85
	const isVelocityStatic = min === max
	const velocityRangeText = `${min}-${max}`
	return isVelocityStatic ? max.toString() : velocityRangeText
}

const signalTextStyle = {
	color: 'white',
	pointerEvents: 'none'
}

const baseDraggableStyles = {
	height: '28px',
	cursor: 'pointer',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	zIndex: 10,
	userSelect: 'none',
	position: 'absolute'
}

const handleStyles = {
	position: 'absolute',
	top: 0,
	bottom: 0,
	width: '16px',
	backgroundColor: 'transparent',
	cursor: 'ew-resize',
	zIndex: 11
}

type DraggableSignalProps = {
	signal: SignalT
	rowId: string
}

const DraggableSignal = React.memo((props: DraggableSignalProps) => {
	const { signal, rowId } = props
	const signalId = signal.id
	const baseDraggableRef = useRef<HTMLDivElement>(null)
	const isDraggingHandle = useDatass.boolean(false)
	const tempDraggingLeft = useDatass.number(0)
	const tempDraggingRight = useDatass.number(0)
	const draggingHandle = useDatass.string('')
	const dragStartX = useDatass.number(0)
	const originalStart = useDatass.number(0)
	const originalEnd = useDatass.number(0)
	const selectedSignalData = $patternEditor.selectedSignalData.use()
	const isSelected = selectedSignalData.id === signal.id

	const deleteSignal = () => $patternEditor.removeSignal({ rowId: rowId, signalId: signalId })
	const selectSignalId = () => $patternEditor.selectedSignalData.set.lookup('id', signal.id)
	const selectRowId = () => $patternEditor.selectedSignalData.set.lookup('rowId', rowId)
	// Calculate current display values during drag
	const displayStart = draggingHandle.state === 'left' ? tempDraggingLeft.state || signal.startDivision : signal.startDivision
	const displayEnd = draggingHandle.state === 'right' ? tempDraggingRight.state || signal.endDivision : signal.endDivision
	const displayLength = displayEnd - displayStart

	const onClick = (event) => {
		event.preventDefault()
		event.stopPropagation()
		if (isSelected) return
		selectRowId()
		selectSignalId()
	}

	const onContextMenu = (event) => {
		event.preventDefault()
		event.stopPropagation()
		console.warn('onContextMenu', event)
		return deleteSignal()
	}

	const handleMouseDown = (event: React.MouseEvent, handleType: 'left' | 'right') => {
		if (event.button !== 0) return
		if (event.ctrlKey || event.metaKey || event.shiftKey) return
		if (!isSelected) return
		event.preventDefault()
		event.stopPropagation()
		console.warn('handleMouseDown', event)
		selectRowId()
		selectSignalId()
		draggingHandle.set(handleType)
		dragStartX.set(event.clientX)
		originalStart.set(signal.startDivision)
		originalEnd.set(signal.endDivision)
		isDraggingHandle.set(true)
		tempDraggingLeft.set(originalStart.state)
		tempDraggingRight.set(originalEnd.state)
	}

	// Handle mouse move during drag
	React.useEffect(() => {
		if (!draggingHandle.state) return

		const handleMouseMove = (event: MouseEvent) => {
			if (event.buttons !== 1) return
			const deltaX = event.clientX - dragStartX.state
			const deltaDivisions = Math.round(deltaX / divisionWidth)
			const isLeft = draggingHandle.state === 'left'
			const isRight = draggingHandle.state === 'right'

			console.log('isLeft:', isLeft, 'isRight:', isRight, 'deltaDivisions:', deltaDivisions)

			let newStart = originalStart.state
			let newEnd = originalEnd.state

			if (isLeft) {
				newStart = Math.max(0, originalStart.state + deltaDivisions)
				// Ensure minimum width of 1 division
				if (newStart >= originalEnd.state) {
					newStart = originalEnd.state - 1
				}
				tempDraggingLeft.set(newStart)
			} else if (draggingHandle.state === 'right') {
				newEnd = Math.max(originalStart.state + 1, originalEnd.state + deltaDivisions)
				// You might want to add a maximum constraint here based on pattern length
				const maxDivisions = getMaxDivisions(128) // or whatever your pattern length is
				newEnd = Math.min(newEnd, maxDivisions)
				tempDraggingRight.set(newEnd)
			}
		}

		const handleMouseUp = () => {
			if (draggingHandle.state) {
				const isLeft = draggingHandle.state === 'left'
				const isRight = draggingHandle.state === 'right'
				const newStart = isLeft ? tempDraggingLeft.state : originalStart.state
				const newEnd = isRight ? tempDraggingRight.state : originalEnd.state
				console.warn('handleMouseUp', {
					event,
					isLeft,
					tempDraggingLeft,
					newStart,
					newEnd,
					start: originalStart.state,
					end: originalEnd.state
				})

				$patternEditor.updateSignal({
					rowId,
					signalId: signal.id,
					startDivision: newStart,
					endDivision: newEnd
				})
			}

			// Reset drag state
			draggingHandle.set(null)
			isDraggingHandle.set(false)
			tempDraggingLeft.set(0)
			tempDraggingRight.set(0)
		}

		document.addEventListener('mousemove', handleMouseMove)
		document.addEventListener('mouseup', handleMouseUp)

		return () => {
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
		}
	}, [draggingHandle.state, dragStartX.state, originalStart.state, originalEnd.state, rowId, signal])

	const baseClassNames = classcat([
		'DraggableSignal',
		`noteId-${signal.noteId}`,
		`rowId-${rowId}`,
		isSelected && 'isSelected',
		isDraggingHandle.use() && 'isDragging'
	])

	const style = {
		...baseDraggableStyles,
		top: 2,
		left: displayStart * divisionWidth,
		width: displayLength * divisionWidth
	}

	return (
		<motion.div
			ref={baseDraggableRef}
			className={baseClassNames}
			onClick={onClick}
			onDoubleClick={onContextMenu}
			onContextMenu={onContextMenu}
			// @ts-ignore
			transition={{ type: 'spring', duration: 0.2, delay: 0, ease: [0, 0.71, 0.2, 1.01] }}
			style={style}
			initial={{ top: 0, left: displayStart * divisionWidth - 45, opacity: 0, scale: 0 }}
			animate={{
				top: 2,
				left: displayStart * divisionWidth,
				opacity: 1,
				scale: 1,
				width: displayLength * divisionWidth,
				x: 0,
				y: 0
			}}
		>
			{/* Left resize handle */}
			{isSelected && (
				<span
					className="signalHandle handleLeft"
					style={{ ...handleStyles, left: -4 }}
					onContextMenu={onContextMenu}
					onDoubleClick={onContextMenu}
					onClick={(event) => event.stopPropagation()}
					onMouseDown={(e) => handleMouseDown(e, 'left')}
				/>
			)}
			{/* 
			<Text size="1" style={signalTextStyle as any} className="signalLabel">
				{velocityText}
			</Text> */}

			{/* Right resize handle */}
			{isSelected && (
				<span
					className="signalHandle handleRight"
					style={{ ...handleStyles, right: -4 }}
					onContextMenu={onContextMenu}
					onDoubleClick={onContextMenu}
					onMouseDown={(e) => handleMouseDown(e, 'right')}
				/>
			)}
		</motion.div>
	)
})

type GridSignalRowProps = {
	rowId: string
	rowIds: string[]
}

const getSiblingRowIds = (rowId: string, rowIds: string[]) => {
	const index = rowIds.indexOf(rowId)
	const nextRowId = index < rowIds.length - 1 ? rowIds[index + 1] : null
	const prevRowId = index > 0 ? rowIds[index - 1] : null
	return { nextRowId, prevRowId }
}

const GridSignalRow = React.memo((props: GridSignalRowProps) => {
	const { rowId, rowIds } = props
	const { nextRowId, prevRowId } = getSiblingRowIds(rowId, rowIds as string[])
	const signals = $patternEditor.useSignalRow(rowId).signals || []
	const selectedSignalData = $patternEditor.selectedSignalData.use()

	const onClick = (event: React.MouseEvent) => {
		event.stopPropagation()
		$patternEditor.selectedSignalData.set.reset()

		// Don't create new signals if we just finished moving via keyboard
		// (You can add this back if you want to create signals on click)
		const rect = event.currentTarget.getBoundingClientRect()
		const clickX = event.clientX - rect.left
		const clickedDivision = getDivisionsCount(clickX)
		const clickedCell = getCellsCount(clickX)
		const signalId = crypto.randomUUID()

		$patternEditor.addSignal({
			signalRowId: rowId,
			signal: {
				id: signalId,
				noteId: rowId,
				startDivision: clickedCell * 4,
				endDivision: clickedCell * 4 + 4
			}
		})

		$patternEditor.selectedSignalData.set({
			id: signalId,
			rowId,
			isTemporaryMove: false,
			originalPosition: null,
			overlappingSignals: [],
			temporarySignalModifications: []
		})
	}

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (!selectedSignalData.id || !selectedSignalData.rowId) return
			if (selectedSignalData.rowId !== rowId) return // Only handle keys for the current row

			// move 1/2 cell when ctrl pressed. 1 cell when not.
			const cellSize = 4 // divisions per cell
			const movement = event.ctrlKey ? 1 : event.shiftKey ? 8 : cellSize

			const isArrowUp = event.key === 'ArrowUp'
			const isArrowDown = event.key === 'ArrowDown'
			const isArrowLeft = event.key === 'ArrowLeft'
			const isArrowRight = event.key === 'ArrowRight'
			const isBackspace = event.key === 'Backspace'
			const isDelete = event.key === 'Delete'
			const isEscape = event.key === 'Escape'
			const isEnter = event.key === 'Enter'

			const isArrowKey = isArrowUp || isArrowDown || isArrowLeft || isArrowRight
			const isEraserKey = isBackspace || isDelete

			const signal = signals.find((s) => s.id === selectedSignalData.id)
			if (!signal) return

			if (isArrowUp && prevRowId) {
				event.preventDefault()

				$patternEditor.selectedSignalData.set.lookup('rowId', prevRowId)
				$patternEditor.moveSignal({
					fromRowId: rowId,
					toRowId: prevRowId,
					signalId: signal.id,
					startDivision: signal.startDivision,
					endDivision: signal.endDivision
				})
				return
			}

			if (isArrowDown && nextRowId) {
				event.preventDefault()
				$patternEditor.selectedSignalData.set.lookup('rowId', nextRowId)

				$patternEditor.moveSignal({
					fromRowId: rowId,
					toRowId: nextRowId,
					signalId: signal.id,
					startDivision: signal.startDivision,
					endDivision: signal.endDivision
				})

				return
			}

			if (isArrowLeft || isArrowRight) {
				event.preventDefault()

				const direction = isArrowLeft ? -1 : 1
				const newValueStart = signal.startDivision + direction * movement
				const newValueEnd = signal.endDivision + direction * movement

				const isStartTooLow = newValueStart < 0
				const isEndTooHigh = newValueEnd > getMaxDivisions($patternEditor.beatsLength.state)

				if (isStartTooLow || isEndTooHigh) {
					console.warn('Signal movement out of bounds:', newValueStart, newValueEnd)
					return
				}

				const newEnd = clampDivision(newValueEnd, getMaxDivisions($patternEditor.beatsLength.state))
				const newStart = clampDivision(newValueStart, getMaxDivisions($patternEditor.beatsLength.state))

				$patternEditor.updateSignal({
					rowId,
					signalId: signal.id,
					startDivision: newStart,
					endDivision: newEnd
				})
			}
		},
		[selectedSignalData.id, signals, rowId, prevRowId, nextRowId]
	)

	// Handle deselection to commit or cancel temporary moves
	const handleDeselection = {}

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [handleKeyDown])

	const classes = classcat([
		'GridSignalRow',
		'noteId-' + rowId,
		signals.length > 0 && 'hasSignals',
		selectedSignalData.id && 'hasSelectedSignal'
	])

	return (
		<Flex.Row
			className={classes}
			height="32px"
			width="100%"
			align="center"
			style={{ position: 'relative' }}
			onClick={onClick}
			data-row-id={rowId}
			onContextMenu={(event) => {
				event.preventDefault()
				event.stopPropagation()
				console.warn('onContextMenu', event)
				return $patternEditor.selectedSignalData.set.reset()
			}}
		>
			<SignalRowCells beatsLength={$patternEditor.beatsLength.state} rowId={rowId} />

			{/* Signals overlaid on top */}
			{signals.map((signal) => (
				<DraggableSignal key={signal.id} signal={signal} rowId={rowId} />
			))}
		</Flex.Row>
	)
})

export { GridSignalRow }
