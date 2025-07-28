/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { say } from '../index'

// Test utilities to capture console.log calls
type ConsoleLogCall = {
	content: string
	styles: string[]
}

const captureConsoleLogs = (): {
	logs: ConsoleLogCall[]
	restore: () => void
} => {
	const logs: ConsoleLogCall[] = []
	const originalConsoleLog = console.log

	console.log = (content: string, ...styles: string[]) => {
		logs.push({ content, styles })
	}

	const restore = () => {
		console.log = originalConsoleLog
	}

	return { logs, restore }
}

describe('whispa logging module', () => {
	let capture: ReturnType<typeof captureConsoleLogs>

	beforeEach(() => {
		capture = captureConsoleLogs()
		// Clear any existing counters between tests
		;(say as any).clearCounters?.()
	})

	afterEach(() => {
		capture.restore()
	})

	describe('basic logging functionality', () => {
		test('say() logs with default styling', () => {
			say('test message')

			expect(capture.logs).toHaveLength(1)
			const log = capture.logs[0]

			expect(log.content).toContain('test message')
			expect(log.content).toMatch(/💎 #\d+ \[.*\]\[.*\]/)
			expect(log.styles.length).toBeGreaterThan(0)
			expect(log.styles[1]).toContain('background: linear-gradient')
			expect(log.styles[1]).toContain('#667eea')
		})

		test('say.error() logs with error styling', () => {
			say.error('error message')

			expect(capture.logs).toHaveLength(1)
			const log = capture.logs[0]

			expect(log.content).toContain('error message')
			expect(log.content).toMatch(/🚨 #\d+ \[.*\]\[.*\]/)
			expect(log.styles[1]).toContain('background: linear-gradient')
			expect(log.styles[1]).toContain('#ff6b6b')
		})

		test('say.warning() logs with warning styling', () => {
			say.warning('warning message')

			expect(capture.logs).toHaveLength(1)
			const log = capture.logs[0]

			expect(log.content).toContain('warning message')
			expect(log.content).toMatch(/⚠️ #\d+ \[.*\]\[.*\]/)
			expect(log.styles[1]).toContain('background: linear-gradient')
			expect(log.styles[1]).toContain('#feca57')
		})
	})

	describe('content formatting', () => {
		test('formats strings correctly', () => {
			say('hello world')

			const log = capture.logs[0]
			expect(log.content).toContain('hello world')
		})

		test('formats numbers correctly', () => {
			say(42)

			const log = capture.logs[0]
			expect(log.content).toContain('42')
		})

		test('formats booleans with icons', () => {
			say(true)
			expect(capture.logs[0].content).toContain('✅ true')

			capture.logs.length = 0 // Clear logs

			say(false)
			expect(capture.logs[0].content).toContain('❌ false')
		})

		test('formats null and undefined with special indicators', () => {
			say(null)
			expect(capture.logs[0].content).toContain('∅ null')

			capture.logs.length = 0

			say(undefined)
			expect(capture.logs[0].content).toContain('⚠️ undefined')
		})

		test('formats empty arrays and objects', () => {
			say([])
			expect(capture.logs[0].content).toContain('📋 []')

			capture.logs.length = 0

			say({})
			expect(capture.logs[0].content).toContain('📦 {}')
		})

		test('formats non-empty arrays with length info', () => {
			say([1, 2, 3])

			const log = capture.logs[0]
			expect(log.content).toContain('📋 Array(3):')
			expect(log.content).toContain('[1,2,3]')
		})

		test('formats objects with key count info', () => {
			say({ a: 1, b: 2, c: 3 })

			const log = capture.logs[0]
			expect(log.content).toContain('📦 Object(3 keys):')
			expect(log.content).toContain('"a": 1')
			expect(log.content).toContain('"b": 2')
			expect(log.content).toContain('"c": 3')
		})

		test('formats functions with name detection', () => {
			const namedFunction = function testFunction() {}
			const anonymousFunction = () => {}

			say(namedFunction)
			expect(capture.logs[0].content).toContain('🔧 Function: testFunction')

			capture.logs.length = 0

			say(anonymousFunction)
			expect(capture.logs[0].content).toContain('🔧 Function: anonymous')
		})
	})

	describe('source tracking', () => {
		test('includes file and function name in logs', () => {
			const testFunction = () => {
				say('test from function')
			}

			testFunction()

			const log = capture.logs[0]
			expect(log.content).toMatch(/\[.*\.test\.ts\]\[testFunction\]/)
		})

		test('increments counter for multiple calls from same function', () => {
			const multipleCallsFunction = () => {
				say('first call')
				say('second call')
				say('third call')
			}

			multipleCallsFunction()

			expect(capture.logs).toHaveLength(3)
			expect(capture.logs[0].content).toMatch(/#1 \[.*\]\[multipleCallsFunction\]/)
			expect(capture.logs[1].content).toMatch(/#2 \[.*\]\[multipleCallsFunction\]/)
			expect(capture.logs[2].content).toMatch(/#3 \[.*\]\[multipleCallsFunction\]/)
		})

		test('maintains separate counters for different functions', () => {
			const functionA = () => say('from A')
			const functionB = () => say('from B')

			functionA()
			functionB()
			functionA()

			expect(capture.logs).toHaveLength(3)
			expect(capture.logs[0].content).toMatch(/#1 \[.*\]\[functionA\]/)
			expect(capture.logs[1].content).toMatch(/#1 \[.*\]\[functionB\]/)
			expect(capture.logs[2].content).toMatch(/#2 \[.*\]\[functionA\]/)
		})
	})

	describe('template system', () => {
		test('prepare() creates a template without title', () => {
			type TestArgsT = { name: string; count: number }

			say.prepare<TestArgsT>('test-template')`
        User: \${args => args.name}
        Count: \${args => args.count}
      `

			// Template creation should not log anything
			expect(capture.logs).toHaveLength(0)
		})

		test('prepare() creates a template with title', () => {
			type TestArgsT = { message: string }

			say.prepare<TestArgsT>('titled-template')`
        # Test Report
        Message: \${args => args.message}
      `

			expect(capture.logs).toHaveLength(0)
		})

		test('preset() renders template without title', () => {
			type TestArgsT = { name: string; age: number }

			say.prepare<TestArgsT>('user-info')`
        Name: \${args => args.name}
        Age: \${args => args.age}
      `

			say.preset('user-info', { name: 'Alice', age: 30 })

			expect(capture.logs).toHaveLength(1)
			const log = capture.logs[0]
			expect(log.content).toContain('Name: Alice')
			expect(log.content).toContain('Age: 30')
		})

		test('preset() renders template with title', () => {
			type TestArgsT = { status: string }

			say.prepare<TestArgsT>('status-report')`
        # System Status
        Current Status: \${args => args.status}
      `

			say.preset('status-report', { status: 'operational' })

			expect(capture.logs).toHaveLength(1)
			const log = capture.logs[0]
			expect(log.content).toContain('System Status')
			expect(log.content).toContain('Current Status: operational')
			expect(log.styles).toHaveLength(3) // Title, header, content
		})

		test('preset() handles complex template expressions', () => {
			type TestArgsT = { items: string[]; isActive: boolean; timestamp: number }

			say.prepare<TestArgsT>('complex-template')`
        Items: \${args => args.items.join(', ')}
        Status: \${args => args.isActive ? 'Active' : 'Inactive'}
        Time: \${args => new Date(args.timestamp).toISOString()}
      `

			const testTimestamp = Date.now()
			say.preset('complex-template', {
				items: ['apple', 'banana', 'cherry'],
				isActive: true,
				timestamp: testTimestamp
			})

			const log = capture.logs[0]
			expect(log.content).toContain('Items: apple, banana, cherry')
			expect(log.content).toContain('Status: Active')
			expect(log.content).toContain('Time: ')
		})

		test('preset() handles template expression errors gracefully', () => {
			type TestArgsT = { data: any }

			say.prepare<TestArgsT>('error-template')`
        Value: \${args => args.data.nonExistent.property}
      `

			say.preset('error-template', { data: {} })

			const log = capture.logs[0]
			expect(log.content).toContain('[Error:')
		})

		test('preset() errors when template key not found', () => {
			say.preset('non-existent-template', { data: 'test' })

			expect(capture.logs).toHaveLength(1)
			const log = capture.logs[0]
			expect(log.content).toContain('Prepared log with key "non-existent-template" not found')
			expect(log.styles[1]).toContain('#ff6b6b') // Error styling
		})

		test('preset() errors when called with null arguments', () => {
			type TestArgsT = { value: string }

			say.prepare<TestArgsT>('null-test')`
        Value: \${args => args.value}
      `

			say.preset('null-test', null)

			expect(capture.logs).toHaveLength(1)
			const log = capture.logs[0]
			expect(log.content).toContain('Cannot call preset with null arguments')
			expect(log.styles[1]).toContain('#ff6b6b') // Error styling
		})
	})

	describe('CSS animation injection', () => {
		test('injects CSS animations only once', () => {
			// Clear any existing styles
			const existingStyle = document.querySelector('#say-animations')
			if (existingStyle) {
				existingStyle.remove()
			}

			say('first log')

			const styleElement = document.querySelector('#say-animations')
			expect(styleElement).toBeTruthy()
			expect(styleElement?.textContent).toContain('@keyframes gradientShift')

			say('second log')

			// Should still only be one style element
			const styleElements = document.querySelectorAll('#say-animations')
			expect(styleElements).toHaveLength(1)
		})
	})

	describe('edge cases and error handling', () => {
		test('handles circular references in objects', () => {
			const circularObj: any = { name: 'test' }
			circularObj.self = circularObj

			expect(() => say(circularObj)).not.toThrow()

			const log = capture.logs[0]
			expect(log.content).toContain('📦 Object')
		})

		test('handles very large objects gracefully', () => {
			const largeObj = {}
			for (let i = 0; i < 1000; i++) {
				;(largeObj as any)[`key${i}`] = `value${i}`
			}

			expect(() => say(largeObj)).not.toThrow()

			const log = capture.logs[0]
			expect(log.content).toContain('📦 Object(1000 keys)')
		})

		test('handles very large arrays gracefully', () => {
			const largeArray = new Array(1000).fill(0).map((_, i) => i)

			expect(() => say(largeArray)).not.toThrow()

			const log = capture.logs[0]
			expect(log.content).toContain('📋 Array(1000)')
		})

		test('handles special values correctly', () => {
			say(NaN)
			expect(capture.logs[0].content).toContain('NaN')

			capture.logs.length = 0

			say(Infinity)
			expect(capture.logs[0].content).toContain('Infinity')

			capture.logs.length = 0

			say(-Infinity)
			expect(capture.logs[0].content).toContain('-Infinity')
		})
	})

	describe('styling integration', () => {
		test('applies correct base styles to all log types', () => {
			say('test')
			say.error('test')
			say.warning('test')

			capture.logs.forEach((log) => {
				expect(log.styles[1]).toContain('font-family: "Input Mono Regular"')
				expect(log.styles[1]).toContain('border-radius: 8px')
				expect(log.styles[1]).toContain('padding: 16px 20px')
				expect(log.styles[1]).toContain('backdrop-filter: blur(10px)')
			})
		})

		test('applies different gradient backgrounds for each type', () => {
			say('default')
			say.error('error')
			say.warning('warning')

			expect(capture.logs[0].styles[1]).toContain('#667eea')
			expect(capture.logs[1].styles[1]).toContain('#ff6b6b')
			expect(capture.logs[2].styles[1]).toContain('#feca57')
		})

		test('includes animation properties in styles', () => {
			say('animated')

			const log = capture.logs[0]
			expect(log.styles[1]).toContain('animation: gradientShift')
			expect(log.styles[1]).toContain('background-size: 200% 200%')
		})
	})
})
