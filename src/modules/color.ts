import appConfig from '#/configuration/app.config.json'

export const cssColorVars = (rootNote) => {
	const color = appConfig.rootNoteColors[rootNote]

	return {
		'--accented0': `var(--${color}-0)`,
		'--accented1': `var(--${color}-1)`,
		'--accented2': `var(--${color}-2)`,
		'--accented3': `var(--${color}-3)`,
		'--accented4': `var(--${color}-4)`,
		'--accented5': `var(--${color}-5)`,
		'--accented6': `var(--${color}-6)`,
		'--accented7': `var(--${color}-7)`,
		'--accented8': `var(--${color}-8)`,
		'--accented9': `var(--${color}-9)`,
		'--accented10': `var(--${color}-10)`,
		'--accented11': `var(--${color}-11)`,
		'--accented12': `var(--${color}-12)`,
		'--accentedA0': `var(--${color}-a0)`,
		'--accentedA1': `var(--${color}-a1)`,
		'--accentedA2': `var(--${color}-a2)`,
		'--accentedA3': `var(--${color}-a3)`,
		'--accentedA4': `var(--${color}-a4)`,
		'--accentedA5': `var(--${color}-a5)`,
		'--accentedA6': `var(--${color}-a6)`,
		'--accentedA7': `var(--${color}-a7)`,
		'--accentedA8': `var(--${color}-a8)`,
		'--accentedA9': `var(--${color}-a9)`,
		'--accentedA10': `var(--${color}-a10)`,
		'--accentedA11': `var(--${color}-a11)`,

		'--accent-0': `var(--${color}-0)`,
		'--accent-1': `var(--${color}-1)`,
		'--accent-2': `var(--${color}-2)`,
		'--accent-3': `var(--${color}-3)`,
		'--accent-4': `var(--${color}-4)`,
		'--accent-5': `var(--${color}-5)`,
		'--accent-6': `var(--${color}-6)`,
		'--accent-7': `var(--${color}-7)`,
		'--accent-8': `var(--${color}-8)`,
		'--accent-9': `var(--${color}-9)`,
		'--accent-10': `var(--${color}-10)`,
		'--accent-11': `var(--${color}-11)`,
		'--accent-12': `var(--${color}-12)`,
		'--accent-a0': `var(--${color}-a0)`,
		'--accent-a1': `var(--${color}-a1)`,
		'--accent-a2': `var(--${color}-a2)`,
		'--accent-a3': `var(--${color}-a3)`,
		'--accent-a4': `var(--${color}-a4)`,
		'--accent-a5': `var(--${color}-a5)`,
		'--accent-a6': `var(--${color}-a6)`,
		'--accent-a7': `var(--${color}-a7)`,
		'--accent-a8': `var(--${color}-a8)`,
		'--accent-a9': `var(--${color}-a9)`,
		'--accent-a10': `var(--${color}-a10)`,
		'--accent-a11': `var(--${color}-a11)`
	}
}

export const getAccentColorClassName = (rootNote) => {
	const color = appConfig.rootNoteColors[rootNote]
	if (!color) return null
	return `${color}Accents`
}
