import * as React from 'react'
import * as Menubar from '@radix-ui/react-menubar'
import { CheckIcon, ChevronRightIcon, DotFilledIcon } from '@radix-ui/react-icons'
import './MenuBar.css'

export const MenuBar = () => {
	const [showGrid, setShowGrid] = React.useState(true)
	const [snapToGrid, setSnapToGrid] = React.useState(false)
	const [zoomLevel, setZoomLevel] = React.useState('100%')
	const [currentProject, setCurrentProject] = React.useState('Untitled')

	return (
		<Menubar.Root className="MenubarRoot" style={{ scale: 0.8 }}>
			<Menubar.Menu>
				<Menubar.Trigger className="MenubarTrigger">Project</Menubar.Trigger>
				<Menubar.Portal>
					<Menubar.Content className="MenubarContent" align="start" sideOffset={5} alignOffset={-3}>
						<Menubar.Item className="MenubarItem">
							New Project
							<div className="RightSlot">⌘ N</div>
						</Menubar.Item>
						<Menubar.Item className="MenubarItem">
							Open Project…
							<div className="RightSlot">⌘ O</div>
						</Menubar.Item>
						<Menubar.Item className="MenubarItem">
							Save Project
							<div className="RightSlot">⌘ S</div>
						</Menubar.Item>
						<Menubar.Separator className="MenubarSeparator" />
						<Menubar.Item className="MenubarItem">Export MIDI…</Menubar.Item>
						<Menubar.Item className="MenubarItem">Import MIDI…</Menubar.Item>
					</Menubar.Content>
				</Menubar.Portal>
			</Menubar.Menu>

			<Menubar.Menu>
				<Menubar.Trigger className="MenubarTrigger">Edit</Menubar.Trigger>
				<Menubar.Portal>
					<Menubar.Content className="MenubarContent" align="start" sideOffset={5} alignOffset={-3}>
						<Menubar.Item className="MenubarItem">
							Undo
							<div className="RightSlot">⌘ Z</div>
						</Menubar.Item>
						<Menubar.Item className="MenubarItem">
							Redo
							<div className="RightSlot">⇧ ⌘ Z</div>
						</Menubar.Item>
						<Menubar.Separator className="MenubarSeparator" />
						<Menubar.Item className="MenubarItem">Cut</Menubar.Item>
						<Menubar.Item className="MenubarItem">Copy</Menubar.Item>
						<Menubar.Item className="MenubarItem">Paste</Menubar.Item>
						<Menubar.Separator className="MenubarSeparator" />
						<Menubar.Item className="MenubarItem">Select All</Menubar.Item>
						<Menubar.Item className="MenubarItem">Clear Selection</Menubar.Item>
					</Menubar.Content>
				</Menubar.Portal>
			</Menubar.Menu>

			<Menubar.Menu>
				<Menubar.Trigger className="MenubarTrigger">View</Menubar.Trigger>
				<Menubar.Portal>
					<Menubar.Content className="MenubarContent" align="start" sideOffset={5} alignOffset={-14}>
						<Menubar.CheckboxItem className="MenubarCheckboxItem inset" checked={showGrid} onCheckedChange={setShowGrid}>
							<Menubar.ItemIndicator className="MenubarItemIndicator">
								<CheckIcon />
							</Menubar.ItemIndicator>
							Show Grid
						</Menubar.CheckboxItem>
						<Menubar.CheckboxItem className="MenubarCheckboxItem inset" checked={snapToGrid} onCheckedChange={setSnapToGrid}>
							<Menubar.ItemIndicator className="MenubarItemIndicator">
								<CheckIcon />
							</Menubar.ItemIndicator>
							Snap to Grid
						</Menubar.CheckboxItem>
						<Menubar.Separator className="MenubarSeparator" />
						<Menubar.Sub>
							<Menubar.SubTrigger className="MenubarSubTrigger">
								Zoom
								<div className="RightSlot">
									<ChevronRightIcon />
								</div>
							</Menubar.SubTrigger>
							<Menubar.Portal>
								<Menubar.SubContent className="MenubarSubContent" alignOffset={-5}>
									<Menubar.RadioGroup value={zoomLevel} onValueChange={setZoomLevel}>
										<Menubar.RadioItem className="MenubarRadioItem inset" value="50%">
											<Menubar.ItemIndicator className="MenubarItemIndicator">
												<DotFilledIcon />
											</Menubar.ItemIndicator>
											50%
										</Menubar.RadioItem>
										<Menubar.RadioItem className="MenubarRadioItem inset" value="100%">
											<Menubar.ItemIndicator className="MenubarItemIndicator">
												<DotFilledIcon />
											</Menubar.ItemIndicator>
											100%
										</Menubar.RadioItem>
										<Menubar.RadioItem className="MenubarRadioItem inset" value="200%">
											<Menubar.ItemIndicator className="MenubarItemIndicator">
												<DotFilledIcon />
											</Menubar.ItemIndicator>
											200%
										</Menubar.RadioItem>
									</Menubar.RadioGroup>
								</Menubar.SubContent>
							</Menubar.Portal>
						</Menubar.Sub>
						<Menubar.Separator className="MenubarSeparator" />
						<Menubar.Item className="MenubarItem inset">Toggle Fullscreen</Menubar.Item>
					</Menubar.Content>
				</Menubar.Portal>
			</Menubar.Menu>

			<Menubar.Menu>
				<Menubar.Trigger className="MenubarTrigger">Tools</Menubar.Trigger>
				<Menubar.Portal>
					<Menubar.Content className="MenubarContent" align="start" sideOffset={5} alignOffset={-3}>
						<Menubar.Item className="MenubarItem">Quantize</Menubar.Item>
						<Menubar.Item className="MenubarItem">Transpose</Menubar.Item>
						<Menubar.Item className="MenubarItem">Velocity Editor</Menubar.Item>
						<Menubar.Item className="MenubarItem">Piano Roll</Menubar.Item>
						<Menubar.Separator className="MenubarSeparator" />
						<Menubar.Item className="MenubarItem">Preferences…</Menubar.Item>
					</Menubar.Content>
				</Menubar.Portal>
			</Menubar.Menu>
		</Menubar.Root>
	)
}
