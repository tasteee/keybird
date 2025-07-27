// Generic common props that can be used with any HTML element
type CommonPropsT<TElement = HTMLDivElement> = {
	className?: string
	style?: React.CSSProperties
	children?: React.ReactNode
	id?: string
	'data-testid'?: string
	onClick?: React.MouseEventHandler<TElement>
	onMouseEnter?: React.MouseEventHandler<TElement>
	onMouseLeave?: React.MouseEventHandler<TElement>
	onFocus?: React.FocusEventHandler<TElement>
	onBlur?: React.FocusEventHandler<TElement>
	onKeyDown?: React.KeyboardEventHandler<TElement>
	onKeyUp?: React.KeyboardEventHandler<TElement>
	onContextMenu?: (event: React.MouseEvent<TElement>) => void
	onDragStart?: (event: React.DragEvent<TElement>) => void
	onDragEnd?: (event: React.DragEvent<TElement>) => void
	onDragOver?: (event: React.DragEvent<TElement>) => void
	onDragEnter?: (event: React.DragEvent<TElement>) => void
	onDragLeave?: (event: React.DragEvent<TElement>) => void
	onDrop?: (event: React.DragEvent<TElement>) => void
	onScroll?: (event: React.UIEvent<TElement>) => void
	onTouchStart?: (event: React.TouchEvent<TElement>) => void
	onTouchEnd?: (event: React.TouchEvent<TElement>) => void
	onTouchMove?: (event: React.TouchEvent<TElement>) => void
	onTouchCancel?: (event: React.TouchEvent<TElement>) => void
	onMouseDown?: (event: React.MouseEvent<TElement>) => void
	onMouseUp?: (event: React.MouseEvent<TElement>) => void
	onMouseMove?: (event: React.MouseEvent<TElement>) => void
	onMouseOut?: (event: React.MouseEvent<TElement>) => void
	onMouseOver?: (event: React.MouseEvent<TElement>) => void
	onSelect?: (event: React.SyntheticEvent<TElement>) => void
	onCopy?: (event: React.ClipboardEvent<TElement>) => void
	onCut?: (event: React.ClipboardEvent<TElement>) => void
	onPaste?: (event: React.ClipboardEvent<TElement>) => void
	onAnimationStart?: (event: React.AnimationEvent<TElement>) => void
	onAnimationEnd?: (event: React.AnimationEvent<TElement>) => void
	onAnimationIteration?: (event: React.AnimationEvent<TElement>) => void
	onTransitionEnd?: (event: React.TransitionEvent<TElement>) => void
	onWheel?: (event: React.WheelEvent<TElement>) => void
	onFocusCapture?: (event: React.FocusEvent<TElement>) => void
	onBlurCapture?: (event: React.FocusEvent<TElement>) => void
	onKeyDownCapture?: (event: React.KeyboardEvent<TElement>) => void
}

// Specific common props for different elements
type DivPropsT = CommonPropsT<HTMLDivElement>
type ButtonPropsT = CommonPropsT<HTMLButtonElement>
type InputPropsT = CommonPropsT<HTMLInputElement>
type SpanPropsT = CommonPropsT<HTMLSpanElement>
type AnchorPropsT = CommonPropsT<HTMLAnchorElement>

// For form elements that need onChange
type FormElementPropsT<TElement = HTMLInputElement> = CommonPropsT<TElement> & {
	onChange?: React.ChangeEventHandler<TElement>
	onSubmit?: React.FormEventHandler<HTMLFormElement>
}
