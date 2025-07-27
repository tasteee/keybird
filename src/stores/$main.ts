import { observable } from 'mobx'

class MMainStore {
	@observable accessor isPreviewingChord = false
	@observable accessor isPlayingProgressions = false
	@observable accessor chordKeyBinds = {}
}

export const $main = new MMainStore()
globalThis.$main = $main
