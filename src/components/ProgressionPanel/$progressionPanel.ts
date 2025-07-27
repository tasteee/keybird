import { observable, action, computed } from 'mobx'
import { computedFn } from 'mobx-utils'

class ProgressionPanelStore {
	@observable accessor selectedChordId: string = ''
	@observable accessor isEditing: boolean = false
	@observable accessor isDragging: boolean = false
	@observable accessor isResizing: boolean = false

	checkSelectedIdMatch = computedFn((id: string) => {
		return this.selectedChordId === id
	})

	@action setSelectedChordId = (id: string) => {
		this.selectedChordId = id
	}
}

export const $progressionPanel = new ProgressionPanelStore()
