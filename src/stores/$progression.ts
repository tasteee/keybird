import type { BaseChordT, ProgressionChordT } from '#/types'
import { datass, type PreparedArrayStoreT } from 'datass'

const createProgressionChord = (baseChord: any = {}) => {
  return {
    id: crypto.randomUUID(),
    durationBeats: 4,
    rootNote: baseChord.rootNote,
    quality: baseChord.quality,
    isSpread: baseChord.isSpread,
    isOpen: baseChord.isOpen,
    voicing: baseChord.voicing,
    shortName: baseChord.shortName,
    longName: baseChord.longName,
    extensions: [...baseChord.extensions],
    octaveOffset: baseChord.octaveOffset,
    type: baseChord.type || 'chord',
    degree: baseChord.degree || [],
    notes: baseChord.notes || [],
    symbol: baseChord.symbol || ''
  }
}

type ProgressionStoreT = PreparedArrayStoreT<ProgressionChordT> & {
  actions: {
    addChord: (baseChord: any) => void
    removeChord: (chordId: string) => void
    playLoop: () => void
  }
}

export const $progression = datass.array([]) as ProgressionStoreT

$progression.actions = {} as any

$progression.actions.addChord = (baseChord: any) => {
  const newChord = createProgressionChord(baseChord)
  $progression.set.append(newChord)
}

$progression.actions.removeChord = (chordId: string) => {
  const filtered = $progression.state.filter((chord) => chord.id !== chordId)
  $progression.set(filtered)
}

$progression.actions.playLoop = () => {
  console.log('Playing progression loop...')
  // Implement the logic to play the progression loop
  const playChord = (chord: ProgressionChordT) => {
    console.log(`Playing chord: ${chord.symbol}`)
  }

  $progression.state.forEach(playChord)
}
