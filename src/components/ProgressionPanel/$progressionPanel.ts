import { datass } from 'datass'

const $selectedChordId = datass.string('')

const useIsSelected = (id: string) => {
	return $selectedChordId.use() === id
}

export const $progressionPanel = {
	selectedChordId: $selectedChordId,
	useIsSelected
}
