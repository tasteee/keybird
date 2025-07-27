import './ProgressionChord.css'
import { $progression } from '#/stores/$progression'
import { observer } from 'mobx-react-lite'
import { InnerProgressionChord } from './InnerProgressionChord'

type PropsT = {
	id: string
}

export const ProgressionChord = observer((props: PropsT) => {
	const chord = $progression.useStep(props.id)
	if (!chord) return null

	const setMinVelocity = (value: number) => {
		$progression.updateStep({ id: props.id, minVelocity: value })
	}

	const setMaxVelocity = (value: number) => {
		$progression.updateStep({ id: props.id, maxVelocity: value })
	}

	const setOctaveOffset = (value: number) => {
		$progression.updateStep({ id: props.id, octaveOffset: value })
	}

	const setInversion = (value: number) => {
		$progression.updateStep({ id: props.id, inversion: value })
	}

	const setBassNote = (value: string) => {
		$progression.updateStep({ id: props.id, bassNote: value })
	}

	const setVoicing = (value: string) => {
		$progression.updateStep({ id: props.id, voicing: value })
	}

	return (
		<InnerProgressionChord
			{...chord}
			setMinVelocity={setMinVelocity}
			setMaxVelocity={setMaxVelocity}
			setOctaveOffset={setOctaveOffset}
			setInversion={setInversion}
			setBassNote={setBassNote}
			setVoicing={setVoicing}
		/>
	)
})
