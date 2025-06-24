import { datass } from 'datass'
export { $progression } from './progressions/$progression'
export { $output } from './$output'
export { $project } from './$project'

export const $main = {
	isPreviewingChord: datass.boolean(false),
	isPlayingProgressions: datass.boolean(false),
	chordKeyBinds: {}
}
