import './NumberInput.css'
import React, { useRef, useState, useEffect } from 'react'
import { Flex } from './Flex'
import { Icon } from './Icon'
import classNames from 'classnames'

type ArgsT = {
	value: number
	onChange: (args: { value: number }) => void
	min?: number
	max?: number
	step?: number
	dragStep?: number
	onDragChange?: (args: { value: number }) => void
	label?: string
	subLabel?: string
	className?: string
	testId?: string
	disabled?: boolean
}

export const NumberInput = (args: ArgsT) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)
	const [isDragging, setIsDragging] = useState(false)
	const [dragStartY, setDragStartY] = useState(0)
	const [dragStartValue, setDragStartValue] = useState(0)

	const minValue = args.min ?? Number.MIN_SAFE_INTEGER
	const maxValue = args.max ?? Number.MAX_SAFE_INTEGER
	const stepValue = args.step ?? 1
	const dragStepValue = args.dragStep ?? stepValue

	const clampValue = (value: number): number => {
		const clampedValue = Math.max(minValue, Math.min(maxValue, value))
		return Math.round(clampedValue / stepValue) * stepValue
	}

	const clampDragValue = (value: number): number => {
		const clampedValue = Math.max(minValue, Math.min(maxValue, value))
		return Math.round(clampedValue / dragStepValue) * dragStepValue
	}

	const handleIncrement = () => {
		if (args.disabled) return
		const newValue = clampValue(args.value + stepValue)
		args.onChange({ value: newValue })
	}

	const handleDecrement = () => {
		if (args.disabled) return
		const newValue = clampValue(args.value - stepValue)
		args.onChange({ value: newValue })
	}

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (args.disabled) return
		const inputValue = parseFloat(event.target.value)
		if (!isNaN(inputValue)) {
			const newValue = clampValue(inputValue)
			args.onChange({ value: newValue })
		}
	}

	const handleInputMouseDown = (event: React.MouseEvent) => {
		if (args.disabled) return
		const isLeftButton = event.button === 0
		if (!isLeftButton) return

		// Allow normal text selection if user clicks and doesn't drag
		const startX = event.clientX
		const startY = event.clientY
		const threshold = 3 // pixels

		const checkForDrag = (moveEvent: MouseEvent) => {
			const deltaX = Math.abs(moveEvent.clientX - startX)
			const deltaY = Math.abs(moveEvent.clientY - startY)

			if (deltaX > threshold || deltaY > threshold) {
				// User is dragging, prevent text selection and start drag mode
				event.preventDefault()
				document.removeEventListener('mousemove', checkForDrag)

				setIsDragging(true)
				setDragStartY(startY)
				setDragStartValue(args.value)

				document.addEventListener('mousemove', handleMouseMove)
				document.addEventListener('mouseup', handleMouseUp)
			}
		}

		const handleInitialMouseUp = () => {
			document.removeEventListener('mousemove', checkForDrag)
			document.removeEventListener('mouseup', handleInitialMouseUp)
		}

		document.addEventListener('mousemove', checkForDrag)
		document.addEventListener('mouseup', handleInitialMouseUp)
	}

	const handleMouseMove = (event: MouseEvent) => {
		if (!isDragging) return

		const deltaY = dragStartY - event.clientY
		const sensitivity = 3 // Pixels per dragStep unit - adjust for responsiveness
		const deltaValue = Math.round(deltaY / sensitivity) * dragStepValue
		const newValue = clampDragValue(dragStartValue + deltaValue)

		if (args.onDragChange) {
			args.onDragChange({ value: newValue })
		} else {
			args.onChange({ value: newValue })
		}
	}

	const handleMouseUp = () => {
		setIsDragging(false)
		document.removeEventListener('mousemove', handleMouseMove)
		document.removeEventListener('mouseup', handleMouseUp)
	}

	useEffect(() => {
		return () => {
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
		}
	}, [])

	const containerClassName = classNames('NumberInput', args.className, {
		'NumberInput--dragging': isDragging,
		'NumberInput--disabled': args.disabled
	})

	return (
		<Flex.Column className={containerClassName} testId={args.testId}>
			{args.label && (
				<label className="NumberInput__label" htmlFor={`number-input-${args.testId}`}>
					{args.label} {args.subLabel && <span className="NumberInput__subLabel">{args.subLabel}</span>}
				</label>
			)}

			<Flex.Row
				className="NumberInput__container"
				align="center"
				height="var(--space-6)"
				ref={containerRef}
				style={{ cursor: isDragging ? 'ns-resize' : 'default' }}
			>
				<button
					type="button"
					className="NumberInput__button NumberInput__button--decrement"
					onClick={handleDecrement}
					disabled={args.disabled || args.value <= minValue}
				>
					<Icon name="rivet-icons:minus" width="12px" height="12px" color="white" />
				</button>

				<input
					ref={inputRef}
					id={`number-input-${args.testId}`}
					type="number"
					className="NumberInput__input"
					value={args.value}
					min={args.min}
					max={args.max}
					step={args.step}
					onChange={handleInputChange}
					onMouseDown={handleInputMouseDown}
					style={{ cursor: isDragging ? 'ns-resize' : 'text' }}
					disabled={args.disabled}
				/>

				<button
					type="button"
					className="NumberInput__button NumberInput__button--increment"
					onClick={handleIncrement}
					disabled={args.disabled || args.value >= maxValue}
				>
					<Icon name="rivet-icons:plus" width="12px" height="12px" color="white" />
				</button>
			</Flex.Row>
		</Flex.Column>
	)
}
