const SHARP_KEYS = ['C#', 'Db', 'D#', 'Eb', 'F#', 'Gb', 'G#', 'Ab', 'A#', 'Bb']
const FLAT_KEYS = ['Fb', 'Cb', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Bb', 'Eb', 'Ab']
const ALL_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export const KEYS = {
	sharp: SHARP_KEYS,
	flat: FLAT_KEYS,
	all: ALL_KEYS
} as Record<string, string[]>
