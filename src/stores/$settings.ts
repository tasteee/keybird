import { observable, action } from 'mobx'

type GridSizeT = 'small' | 'medium' | 'large'
type ThemeT = 'light' | 'dark'

class SettingsStore {
	@observable accessor gridSize: GridSizeT
	@observable accessor theme: ThemeT
	@observable accessor isChordBrowserCompact: boolean = false

	constructor() {
		this.gridSize = 'medium'
		this.theme = 'light'
	}

	@action setGridSize = (size: GridSizeT) => {
		this.gridSize = size
	}

	@action setTheme = (theme: ThemeT) => {
		this.theme = theme
	}

	@action toggleChordBrowserCompact = () => {
		this.isChordBrowserCompact = !this.isChordBrowserCompact
	}
}

export const $settings = new SettingsStore()
