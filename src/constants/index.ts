export const DEFAULT_PLAYER_SETTINGS = {
	gain: 75,
	pan: 0,
	velocity: 65,
	minVelocity: 50,
	maxVelocity: 75,
	duration: 1.5,
	fadeOutTime: 0.05,
	fadeInTime: 2
}

// Schedule ahead by this many milliseconds
export const SCHEDULE_AHEAD_MS = 200
// Check for new notes to schedule every this many milliseconds
export const SCHEDULE_INTERVAL_MS = 50

// A "beat" is 4 divisions. The UI grid is often based on beats.
export const DIVISIONS_PER_BEAT = 4
// The width of one division in pixels. (e.g., 32px per beat / 4 divisions per beat = 8px)
export const DIVISION_WIDTH_PX = 8

export const TOTAL_BEATS = 16 // e.g., 4 bars of 4/4

export const BEAT_DURATIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16']

export const BAR_DURATIONS = [
	'1/8 bar',
	'1/4 bar',
	'1/2 bar',
	'1 bar',
	'1 1/8 bar',
	'1 1/4 bar',
	'1 1/2 bar',
	'2 bars',
	'2 1/8 bar',
	'2 1/4 bar',
	'2 1/2 bar',
	'3 bars',
	'3 1/8 bar',
	'3 1/4 bar',
	'3 1/2 bar',
	'4 bars'
]

export const QWERTY_CHORD_KEYS = [
	'Digit1',
	'Digit2',
	'Digit3',
	'Digit4',
	'Digit5',
	'Digit6',
	'Digit7',
	'Digit8',
	'Digit9',
	'Digit0',
	'Minus',
	'Equal',
	'KeyQ',
	'KeyW',
	'KeyE',
	'KeyR',
	'KeyT',
	'KeyY',
	'KeyU',
	'KeyI',
	'KeyO',
	'KeyP',
	'BracketLeft',
	'BracketRight',
	'KeyA',
	'KeyS',
	'KeyD',
	'KeyF',
	'KeyG',
	'KeyH',
	'KeyJ',
	'KeyK',
	'KeyL',
	'Semicolon',
	'Quote',
	'KeyZ',
	'KeyX',
	'KeyC',
	'KeyV',
	'KeyB',
	'KeyN',
	'KeyM',
	'Comma',
	'Period',
	'Slash'
]
