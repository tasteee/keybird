import './GridSignalRow.css'
import React, { useCallback, useEffect } from 'react'
import { Flex } from '#/components/layout/Flex'
import { $patternEditor } from './patternEditor.store'
import classcat from 'classcat'
import { useDatass } from 'datass'

// A "beat" is 4 divisions. The UI grid is often based on beats.
const DIVISIONS_PER_BEAT = 4
// The width of one division in pixels. (e.g., 32px per beat / 4 divisions per beat = 8px)
const DIVISION_WIDTH_PX = 8

// --- Helper Functions ---
const getMaxDivisions = (beatsLength: number) => beatsLength * DIVISIONS_PER_BEAT
const clampDivision = (division: number, maxDivisions: number) => Math.max(0, Math.min(division, maxDivisions))

// --- Child Components ---

type SignalRowCellsPropsT = { rowId: string }

const SignalRowCells = React.memo(({ rowId }: SignalRowCellsPropsT) => {
	const beatsLength = $patternEditor.beatsLength.use()
	const totalCells = beatsLength // One cell per beat

	const onClick = (beatIndex: number) => (event: React.MouseEvent) => {
		event.stopPropagation()

		const startDivision = beatIndex * DIVISIONS_PER_BEAT
		const endDivision = startDivision + DIVISIONS_PER_BEAT // Default to 1 beat long
		const id = crypto.randomUUID() // Generate a unique ID for the signal

		$patternEditor.addSignal({
			id,
			rowId: rowId,
			startDivision,
			endDivision
		})

		$patternEditor.selectedSignalId.set(id)
	}

	const cells = []
	for (let i = 0; i < totalCells; i++) {
		cells.push(
			<Flex.Row key={`${rowId}-${i}`} className="GridSignalCell" data-column={i + 1} data-row={rowId} onClick={onClick(i)} />
		)
	}

	return <>{cells}</>
})

import { useOnClickOutside } from 'usehooks-ts'
import { useRef } from 'react' // Make sure to import useRef

type DraggableSignalProps = {
	signal: SignalT
	rowId: string
}

const DraggableSignal = React.memo(({ signal, rowId }: DraggableSignalProps) => {
	const { id: signalId, startDivision, endDivision } = signal
	const ref = useRef<HTMLDivElement>(null)

	// --- State & Store Hooks ---
	const isDraggingHandle = useDatass.boolean(false)
	const draggingHandle = useDatass.string('')
	const dragStartX = useDatass.number(0)
	const originalStart = useDatass.number(0)
	const originalEnd = useDatass.number(0)

	// Use the correct selection state object from the store
	const selectedSignalId = $patternEditor.selectedSignalId.use()
	const isSelected = selectedSignalId === signalId

	// --- Event Handlers ---

	// 1. SELECT: Click on the signal to select it.
	const selectSignal = (event: React.MouseEvent) => {
		event.stopPropagation() // Prevent the row's deselect-all from firing
		if (!isSelected) {
			$patternEditor.selectedSignalId.set(signalId)
		}
	}

	// 2. DESELECT: Click outside the signal to deselect it.
	useOnClickOutside(ref, (event) => {
		if (isSelected) {
			$patternEditor.selectedSignalId.set.reset()
			$patternEditor.correctSignalOverlaps(rowId)
		}
	})

	// 3. DELETE: Right-click to delete.
	const onContextMenu = (event: React.MouseEvent) => {
		event.preventDefault()
		event.stopPropagation()
		$patternEditor.removeSignal(signalId)
	}

	// 4. RESIZE: Mouse down on a handle to start resizing.
	const handleMouseDown = (event: React.MouseEvent, handleType: 'left' | 'right') => {
		if (event.button !== 0 || !isSelected) return
		event.stopPropagation()

		isDraggingHandle.set(true)
		draggingHandle.set(handleType)
		dragStartX.set(event.clientX)
		originalStart.set(startDivision)
		originalEnd.set(endDivision)
	}

	// 5. KEYBOARD: Move, resize, and delete with keys when selected.
	useEffect(() => {
		// Only attach listener if this specific signal is selected
		if (!isSelected) return

		const handleKeyDown = (event: KeyboardEvent) => {
			// --- Deletion ---
			if (event.key === 'Backspace' || event.key === 'Delete') {
				event.preventDefault()
				$patternEditor.removeSignal(signalId)
				return
			}

			const allEnabledRows = $patternEditor.enabledSignalRowIds.state
			const currentIndex = allEnabledRows.indexOf(rowId)
			const beatsLength = $patternEditor.beatsLength.state
			const maxDivisions = getMaxDivisions(beatsLength)

			// --- Movement ---
			const moveAmount = event.ctrlKey ? 1 : event.shiftKey ? 8 : DIVISIONS_PER_BEAT

			switch (event.key) {
				case 'ArrowUp': {
					event.preventDefault()
					const prevRowId = currentIndex > 0 ? allEnabledRows[currentIndex - 1] : null
					if (prevRowId) {
						$patternEditor.moveSignal({ id: signalId, rowId: prevRowId })
					}
					break
				}
				case 'ArrowDown': {
					event.preventDefault()
					const nextRowId = currentIndex < allEnabledRows.length - 1 ? allEnabledRows[currentIndex + 1] : null
					if (nextRowId) {
						$patternEditor.moveSignal({ id: signalId, rowId: nextRowId })
					}
					break
				}
				case 'ArrowLeft': {
					event.preventDefault()
					const newStart = signal.startDivision - moveAmount
					if (newStart < 0) return // Boundary check
					const newEnd = signal.endDivision - moveAmount
					$patternEditor.moveSignal({ id: signalId, rowId: signal.rowId, startDivision: newStart, endDivision: newEnd })
					break
				}
				case 'ArrowRight': {
					event.preventDefault()
					const newEnd = signal.endDivision + moveAmount
					if (newEnd > maxDivisions) return // Boundary check
					const newStart = signal.startDivision + moveAmount
					$patternEditor.moveSignal({ id: signalId, rowId: signal.rowId, startDivision: newStart, endDivision: newEnd })
					break
				}
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [isSelected, signal, rowId]) // Re-run if selection or signal data changes

	// Global mouse move/up handler for resizing
	useEffect(() => {
		// Only attach listeners when a drag is active
		if (!isDraggingHandle.state) return

		const handleMouseMove = (event: MouseEvent) => {
			const deltaX = event.clientX - dragStartX.state
			const deltaDivisions = Math.round(deltaX / DIVISION_WIDTH_PX)

			let newStart = originalStart.state
			let newEnd = originalEnd.state

			if (draggingHandle.state === 'left') {
				newStart = clampDivision(originalStart.state + deltaDivisions, getMaxDivisions($patternEditor.beatsLength.state))
				// Prevent resizing past the end handle
				if (newStart >= originalEnd.state) {
					newStart = originalEnd.state - 1
				}
			} else if (draggingHandle.state === 'right') {
				newEnd = clampDivision(originalEnd.state + deltaDivisions, getMaxDivisions($patternEditor.beatsLength.state))
				// Prevent resizing smaller than 1 division
				if (newEnd <= originalStart.state) {
					newEnd = originalStart.state + 1
				}
			}

			// Update the signal in real-time for visual feedback
			$patternEditor.updateSignal({
				id: signalId,
				startDivision: newStart,
				endDivision: newEnd
			})
		}

		const handleMouseUp = () => {
			// Drag is finished, reset state
			isDraggingHandle.set(false)
			draggingHandle.set('')
		}

		document.addEventListener('mousemove', handleMouseMove)
		document.addEventListener('mouseup', handleMouseUp)
		return () => {
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
		}
	}, [isDraggingHandle.state, dragStartX.state, signalId, draggingHandle.state, originalStart.state, originalEnd.state])

	// --- Render ---
	const style = {
		left: startDivision * DIVISION_WIDTH_PX,
		width: (endDivision - startDivision) * DIVISION_WIDTH_PX
	}

	return (
		<div
			ref={ref} // Attach the ref for useOnClickOutside
			className={classcat([
				'DraggableSignal',
				`rowId-${rowId}`,
				isSelected && 'isSelected',
				isDraggingHandle.use() && 'isDragging'
			])}
			style={style}
			onClick={selectSignal}
			onContextMenu={onContextMenu}
		>
			{isSelected && (
				<>
					<span className="signalHandle handleLeft" onMouseDown={(e) => handleMouseDown(e, 'left')} />
					<span className="signalHandle handleRight" onMouseDown={(e) => handleMouseDown(e, 'right')} />
				</>
			)}
		</div>
	)
})

type GridSignalRowProps = { rowId: string }

export const GridSignalRow = React.memo(({ rowId }: GridSignalRowProps) => {
	// FIX: Correctly derive signals for this row
	const row = $patternEditor.rowMap.use.lookup(rowId)
	const signalMap = $patternEditor.signalMap.use()
	const signals = row.signalIds?.map((id) => signalMap[id]).filter(Boolean) || []
	const selectedSignalId = $patternEditor.selectedSignalId.use()

	const classes = classcat([
		'GridSignalRow',
		`rowId-${rowId}`,
		signals.length > 0 && 'hasSignals',
		selectedSignalId.id && 'hasSelectedSignal'
	])

	const deselectAll = (event: React.MouseEvent) => {
		event.preventDefault()
		$patternEditor.selectedSignalId.set.reset()
	}

	return (
		<Flex.Row
			className={classes}
			height="32px"
			width="100%"
			align="center"
			style={{ position: 'relative' }}
			data-row-id={rowId}
			onClick={deselectAll}
		>
			<SignalRowCells rowId={rowId} />
			{signals.map((signal) => (
				<DraggableSignal key={signal.id} signal={signal} rowId={rowId} />
			))}
		</Flex.Row>
	)
})
