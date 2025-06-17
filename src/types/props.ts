export type CommonElementPropsT = {
  id?: string
  className?: string
  style?: React.CSSProperties
  'data-testid'?: string
  'aria-label'?: string
  'aria-hidden'?: boolean
}

export type OnClickEventT = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void
export type OnMouseEventT = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void
export type OnMouseEnterEventT = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void
export type OnMouseLeaveEventT = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void
export type OnMouseOverEventT = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void
export type OnMouseOutEventT = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void
export type OnMouseMoveEventT = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void
export type OnMouseDownEventT = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void
export type OnMouseUpEventT = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void
export type OnFocusEventT = (event: React.FocusEvent<SVGSVGElement>) => void
export type OnBlurEventT = (event: React.FocusEvent<SVGSVGElement>) => void
export type OnKeyDownEventT = (event: React.KeyboardEvent<SVGSVGElement>) => void
export type OnKeyUpEventT = (event: React.KeyboardEvent<SVGSVGElement>) => void
export type OnKeyPressEventT = (event: React.KeyboardEvent<SVGSVGElement>) => void
export type OnChangeEventT = (event: React.ChangeEvent<SVGSVGElement>) => void
export type OnInputEventT = (event: React.FormEvent<SVGSVGElement>) => void
export type OnSubmitEventT = (event: React.FormEvent<SVGSVGElement>) => void
export type OnSelectEventT = (event: React.SyntheticEvent<SVGSVGElement>) => void
export type OnContextMenuEventT = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void

export type MouseEventPropsT = {
  onClick?: OnClickEventT
  onMouseDown?: OnMouseDownEventT
  onMouseUp?: OnMouseUpEventT
  onMouseOver?: OnMouseOverEventT
  onMouseOut?: OnMouseOutEventT
  onMouseMove?: OnMouseMoveEventT
  onMouseEnter?: OnMouseEnterEventT
  onMouseLeave?: OnMouseLeaveEventT
}

export type KeyboardEventPropsT = {
  onFocus?: OnFocusEventT
  onBlur?: OnBlurEventT
  onKeyDown?: OnKeyDownEventT
  onKeyUp?: OnKeyUpEventT
  onKeyPress?: OnKeyPressEventT
}
