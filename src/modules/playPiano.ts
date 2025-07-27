import { Piano } from 'd-piano'
import { applyBaseOctaveOffset } from './applyBaseOctaveOffset'
import { toJS } from 'mobx'

class PianoPlayer {
	instrument = new Piano({
		velocities: 5 // 5 velocity steps? whatever that means...
	})

	chordNotesMap = new Map<string, string[]>()

	playChord = (chord: ChordT) => {
		const notes = applyBaseOctaveOffset(chord.adjustedNotes)
		this.chordNotesMap.set(chord.id, notes)
		console.log('[playChord]', { chord, notes })
		console.log(toJS({ chord, notes }))

		notes.forEach((note, index) => {
			this.instrument.keyDown({
				note,
				time: `+${index * 0.225}`, // stagger notes by 225ms
				velocity: chord.minVelocity + (chord.maxVelocity - chord.minVelocity) * (index / notes.length)
			})
		})
	}

	stopChord = (chord: ChordT) => {
		const notes = this.chordNotesMap.get(chord.id) || []
		console.log('[stopChord]', { chord, notes })
		this.chordNotesMap.delete(chord.id)

		notes.forEach((note) => {
			this.instrument.keyUp({ note })
		})
	}

	constructor() {
		this.instrument.toDestination()

		this.instrument.load().then(() => {
			console.log('loaded piano!')
		})
	}
}

export const piano = new PianoPlayer()
