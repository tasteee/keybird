type PreparedLogArgsT = Record<string, any>

type LogCounterT = {
	[functionName: string]: number
}

type PreparedLogT<ArgsT = Record<string, any>> = {
	template: string
	hasTitle: boolean
	title?: string
}

type PreparedLogsT = {
	[key: string]: PreparedLogT<any>
}

const logCounters: LogCounterT = {}
const preparedLogs: PreparedLogsT = {}

const getCallerInfo = (): { fileName: string; functionName: string } => {
	const stack = new Error().stack || ''
	const stackLines = stack.split('\n')

	// Find the line that's not from this module and not a browser internal
	const callerLine = stackLines.find((line, index) => {
		if (index < 3) return false // Skip Error constructor and our own functions
		return !line.includes('say.ts') && line.includes('at ')
	})

	if (!callerLine) {
		return { fileName: 'unknown', functionName: 'anonymous' }
	}

	// Extract function name and file path
	const functionMatch = callerLine.match(/at (\w+)/)
	const fileMatch = callerLine.match(/([^/\\]+):\d+:\d+/)

	const functionName = functionMatch?.[1] || 'anonymous'
	const fileName = fileMatch?.[1] || 'unknown'

	return { fileName, functionName }
}

const incrementLogCounter = (functionName: string): number => {
	if (!logCounters[functionName]) {
		logCounters[functionName] = 0
	}
	logCounters[functionName]++
	return logCounters[functionName]
}

const createStyledLog = (args: { type: 'default' | 'error' | 'warning'; content: any; title?: string }): void => {
	const { fileName, functionName } = getCallerInfo()
	const logNumber = incrementLogCounter(`${fileName}:${functionName}`)

	const baseStyles = [
		'font-family: "Input Mono Regular", "SF Mono", Monaco, "Cascadia Code", monospace',
		'border-radius: 8px',
		'padding: 16px 20px',
		'margin: 6px 0',
		'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
		'border: 1px solid rgba(255, 255, 255, 0.15)',
		'position: relative',
		'backdrop-filter: blur(10px)'
	].join('; ')

	const typeStyles = {
		default: [
			'background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
			'background-size: 200% 200%',
			'animation: gradientShift 6s ease infinite',
			'color: #ffffff',
			'text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3)'
		].join('; '),

		error: [
			'background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 50%, #c44569 100%)',
			'background-size: 200% 200%',
			'animation: gradientShift 4s ease infinite',
			'color: #ffffff',
			'text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4)'
		].join('; '),

		warning: [
			'background: linear-gradient(135deg, #feca57 0%, #ff9ff3 50%, #54a0ff 100%)',
			'background-size: 200% 200%',
			'animation: gradientShift 5s ease infinite',
			'color: #2d3436',
			'text-shadow: 0 1px 1px rgba(255, 255, 255, 0.3)'
		].join('; ')
	}

	const headerStyles = [
		'font-weight: 700',
		'font-size: 10px',
		'opacity: 0.85',
		'letter-spacing: 1px',
		'text-transform: uppercase',
		'margin-bottom: 4px',
		'padding: 4px 8px',
		'background: rgba(0, 0, 0, 0.2)',
		'border-radius: 4px',
		'display: inline-block'
	].join('; ')

	const contentStyles = [
		'font-weight: 400',
		'font-size: 13px',
		'line-height: 1.5',
		'margin-top: 8px',
		'white-space: pre-wrap'
	].join('; ')

	const titleStyles = [
		'font-weight: 800',
		'font-size: 15px',
		'margin-bottom: 12px',
		'padding-bottom: 8px',
		'border-bottom: 2px solid rgba(255, 255, 255, 0.3)',
		'text-transform: uppercase',
		'letter-spacing: 0.5px'
	].join('; ')

	// Inject CSS animation if not already present
	if (!document.querySelector('#say-animations')) {
		const style = document.createElement('style')
		style.id = 'say-animations'
		style.textContent = `
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `
		document.head.appendChild(style)
	}

	const fullStyles = `${baseStyles}; ${typeStyles[args.type]}`

	// Create the log content with beautiful emoji prefixes
	const typeEmojis = {
		default: '💎',
		error: '🚨',
		warning: '⚠️'
	}

	const logHeader = `${typeEmojis[args.type]} #${logNumber} [${fileName}][${functionName}]`
	let logContent = ''

	if (args.title) {
		logContent += `%c${args.title}\n`
	}

	logContent += `%c${logHeader}\n%c${formatContent(args.content)}`

	const styles = [
		args.title ? `${fullStyles}; ${titleStyles}` : '',
		`${fullStyles}; ${headerStyles}`,
		`${fullStyles}; ${contentStyles}`
	].filter(Boolean)

	console.log(logContent, ...styles)
}

const formatContent = (content: any): string => {
	if (typeof content === 'string') {
		return content
	}

	if (typeof content === 'number') {
		return content.toString()
	}

	if (typeof content === 'boolean') {
		return content ? '✅ true' : '❌ false'
	}

	if (content === null) {
		return '∅ null'
	}

	if (content === undefined) {
		return '⚠️ undefined'
	}

	if (Array.isArray(content)) {
		if (content.length === 0) {
			return '📋 []'
		}
		return `📋 Array(${content.length}):\n${JSON.stringify(content, null, 2)}`
	}

	if (typeof content === 'object') {
		const keys = Object.keys(content)
		if (keys.length === 0) {
			return '📦 {}'
		}
		return `📦 Object(${keys.length} keys):\n${JSON.stringify(content, null, 2)}`
	}

	if (typeof content === 'function') {
		return `🔧 Function: ${content.name || 'anonymous'}`
	}

	return String(content)
}

const parseTemplate = (template: string): PreparedLogT => {
	const lines = template.split('\n')
	const firstLine = lines[0]?.trim()

	const hasTitle = firstLine.startsWith('#')

	if (hasTitle) {
		const title = firstLine.substring(1).trim()
		const remainingTemplate = lines.slice(1).join('\n').trim()

		return {
			template: remainingTemplate,
			hasTitle: true,
			title
		}
	}

	return {
		template: template.trim(),
		hasTitle: false
	}
}

const processTemplate = <ArgsT extends PreparedLogArgsT>(args: { template: string; templateArgs: ArgsT }): string => {
	return args.template.replace(/\$\{([^}]+)\}/g, (match, expression) => {
		try {
			// Create a function that takes args and evaluates the expression
			const evaluator = new Function('args', `return ${expression}`)
			const result = evaluator(args.templateArgs)
			return String(result)
		} catch (error) {
			return `[Error: ${error}]`
		}
	})
}

// Main say function
const say = (content: any): void => {
	createStyledLog({
		type: 'default',
		content
	})
}

// Error logging
say.error = (content: any): void => {
	createStyledLog({
		type: 'error',
		content
	})
}

// Warning logging
say.warning = (content: any): void => {
	createStyledLog({
		type: 'warning',
		content
	})
}

// Prepare method for creating template logs
say.prepare = <ArgsT extends PreparedLogArgsT>(key: string) => {
	return (strings: TemplateStringsArray, ...values: any[]): void => {
		// Combine template strings and values
		let template = strings[0]
		for (let i = 0; i < values.length; i++) {
			template += String(values[i]) + strings[i + 1]
		}

		const parsed = parseTemplate(template)
		preparedLogs[key] = parsed
	}
}

// Preset method for invoking prepared logs
say.preset = <ArgsT extends PreparedLogArgsT>(key: string, templateArgs: ArgsT | null): void => {
	if (templateArgs === null) {
		// TypeScript should catch this, but runtime guard for safety
		say.error(`Cannot call preset with null arguments for key "${key}"`)
		return
	}

	const preparedLog = preparedLogs[key]

	if (!preparedLog) {
		say.error(`Prepared log with key "${key}" not found`)
		return
	}

	const processedContent = processTemplate({
		template: preparedLog.template,
		templateArgs
	})

	createStyledLog({
		type: 'default',
		content: processedContent,
		title: preparedLog.title
	})
}

export { say }
