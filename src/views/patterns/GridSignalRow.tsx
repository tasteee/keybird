import './GridSignalRow.css'
import React, { useEffect } from 'react'
import { Flex } from '#/components/common/Flex'
import { $pattern } from '#/stores/$pattern'
import classcat from 'classcat'
import { useDatass } from 'datass'
import { useOnClickOutside } from 'usehooks-ts'
import { useRef } from 'react'
import { observer } from 'mobx-react-lite'

// A "beat" is 4 divisions. The UI grid is often based on beats.
const DIVISIONS_PER_BEAT = 4
// The width of one division in pixels. (e.g., 32px per beat / 4 divisions per beat = 8px)
const DIVISION_WIDTH_PX = 8

// --- Helper Functions ---
const getMaxDivisions = (lengthBeats: number) => lengthBeats * DIVISIONS_PER_BEAT
const clampDivision = (division: number, maxDivisions: number) => Math.max(0, Math.min(division, maxDivisions))

// --- Child Components ---

type SignalRowCellsPropsT = { toneId: string }

const SignalRowCells = observer(({ toneId }: SignalRowCellsPropsT) => {
	const totalCells = $pattern.lengthBeats // One cell per beat

	const onClick = (beatIndex: number) => (event: React.MouseEvent) => {
		event.stopPropagation()

		const startDivision = beatIndex * DIVISIONS_PER_BEAT
		const id = crypto.randomUUID() as string // Generate a unique ID for the signal

		$pattern.addSignal({
			id,
			toneId: toneId,
			startDivision
		})

		$pattern.selectedSignalId = id
	}

	const cells = []
	for (let i = 0; i < totalCells; i++) {
		cells.push(
			<Flex.Row key={`${toneId}-${i}`} className="GridSignalCell" data-column={i + 1} data-row={toneId} onClick={onClick(i)} />
		)
	}

	return <>{cells}</>
})

type DraggableSignalProps = {
	signal: SignalT
	toneId: string
}

const DraggableSignal = observer(({ signal, toneId }: DraggableSignalProps) => {
	const { id: signalId, startDivision, endDivision } = signal
	const ref = useRef<HTMLDivElement>(null)

	// --- State & Store Hooks ---
	const isDraggingHandle = useDatass.boolean(false)
	const draggingHandle = useDatass.string('')
	const dragStartX = useDatass.number(0)
	const originalStart = useDatass.number(0)
	const originalEnd = useDatass.number(0)

	// Use the correct selection state object from the store
	const isSelected = $pattern.selectedSignalId === signalId

	// --- Event Handlers ---

	// 1. SELECT: Click on the signal to select it.
	const selectSignal = (event: React.MouseEvent) => {
		event.stopPropagation() // Prevent the row's deselect-all from firing
		if (!isSelected) {
			$pattern.selectedSignalId = signalId
		}
	}

	// 2. DESELECT: Click outside the signal to deselect it.
	useOnClickOutside(ref, (event) => {
		if (isSelected) {
			$pattern.selectedSignalId = ''
		}
	})

	// 3. DELETE: Right-click to delete.
	const onContextMenu = (event: React.MouseEvent) => {
		event.preventDefault()
		event.stopPropagation()
		$pattern.removeSignal(signalId)
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
		if (!isSelected) return

		const handleKeyDown = (event: KeyboardEvent) => {
			// --- Deletion ---
			if (event.key === 'Backspace' || event.key === 'Delete') {
				event.preventDefault()
				$pattern.removeSignal(signalId)
				return
			}

			const allEnabledRows = $pattern.activeToneIds
			const currentIndex = allEnabledRows.indexOf(toneId)
			const lengthBeats = $pattern.lengthBeats
			const maxDivisions = getMaxDivisions(lengthBeats)

			// --- Movement ---
			const moveAmount = event.ctrlKey ? 1 : event.shiftKey ? 8 : DIVISIONS_PER_BEAT

			switch (event.key) {
				case 'ArrowUp': {
					event.preventDefault()
					const prevRowId = currentIndex > 0 ? allEnabledRows[currentIndex - 1] : null
					if (prevRowId) {
						$pattern.moveSignal({ id: signalId, toneId: prevRowId })
					}
					break
				}
				case 'ArrowDown': {
					event.preventDefault()
					const nextRowId = currentIndex < allEnabledRows.length - 1 ? allEnabledRows[currentIndex + 1] : null
					if (nextRowId) {
						$pattern.moveSignal({ id: signalId, toneId: nextRowId })
					}
					break
				}
				case 'ArrowLeft': {
					event.preventDefault()
					const newStart = signal.startDivision - moveAmount
					if (newStart < 0) return // Boundary check
					const newEnd = signal.endDivision - moveAmount
					$pattern.moveSignal({ id: signalId, toneId: signal.toneId, startDivision: newStart, endDivision: newEnd })
					break
				}
				case 'ArrowRight': {
					event.preventDefault()
					const newEnd = signal.endDivision + moveAmount
					if (newEnd > maxDivisions) return // Boundary check
					const newStart = signal.startDivision + moveAmount
					$pattern.moveSignal({ id: signalId, toneId: signal.toneId, startDivision: newStart, endDivision: newEnd })
					break
				}
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [isSelected, signal, toneId]) // Re-run if selection or signal data changes

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
				newStart = clampDivision(originalStart.state + deltaDivisions, getMaxDivisions($pattern.lengthBeats))
				// Prevent resizing past the end handle
				if (newStart >= originalEnd.state) {
					newStart = originalEnd.state - 1
				}
			} else if (draggingHandle.state === 'right') {
				newEnd = clampDivision(originalEnd.state + deltaDivisions, getMaxDivisions($pattern.lengthBeats))
				// Prevent resizing smaller than 1 division
				if (newEnd <= originalStart.state) {
					newEnd = originalStart.state + 1
				}
			}

			// Update the signal in real-time for visual feedback
			$pattern.updateSignal({
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
				`toneId-${toneId}`,
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

type GridSignalRowProps = { toneId: string }

export const GridSignalRow = observer((props: GridSignalRowProps) => {
	// FIX: Correctly derive signals for this row
	const { toneId } = props
	const row = $pattern.toneMap[props.toneId]
	const signals = row?.signalIds?.map((id) => $pattern.signalMap[id]).filter(Boolean) || []

	const classes = classcat([
		'GridSignalRow',
		`toneId-${toneId}`,
		signals.length > 0 && 'hasSignals',
		$pattern.selectedSignalId && 'hasSelectedSignal'
	])

	const deselectAll = (event: React.MouseEvent) => {
		event.preventDefault()
		$pattern.selectedSignalId = ''
	}

	return (
		<Flex.Row
			className={classes}
			height="32px"
			width="100%"
			align="center"
			style={{ position: 'relative' }}
			data-row-id={toneId}
			onClick={deselectAll}
		>
			<SignalRowCells toneId={toneId} />
			{signals.map((signal) => (
				<DraggableSignal key={signal.id} signal={signal} toneId={toneId} />
			))}
		</Flex.Row>
	)
})
