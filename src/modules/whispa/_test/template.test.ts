/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { say } from '../index'

// Mock console.log to test template system in isolation
const mockConsoleLog = vi.fn()
const originalConsoleLog = console.log

describe('whispa template system', () => {
	beforeEach(() => {
		console.log = mockConsoleLog
		mockConsoleLog.mockClear()
	})

	afterEach(() => {
		console.log = originalConsoleLog
	})

	describe('template parsing', () => {
		test('parses template without title correctly', () => {
			type ArgsT = { name: string }

			say.prepare<ArgsT>('simple-template')`
        Hello \${args => args.name}!
        Welcome to the system.
      `

			say.preset('simple-template', { name: 'World' })

			expect(mockConsoleLog).toHaveBeenCalledTimes(1)
			const [content] = mockConsoleLog.mock.calls[0]
			expect(content).toContain('Hello World!')
			expect(content).toContain('Welcome to the system.')
		})

		test('parses template with title correctly', () => {
			type ArgsT = { user: string }

			say.prepare<ArgsT>('titled-template')`
        # Welcome Message
        Hello \${args => args.user}!
        Thanks for joining us.
      `

			say.preset('titled-template', { user: 'Alice' })

			expect(mockConsoleLog).toHaveBeenCalledTimes(1)
			const [content, ...styles] = mockConsoleLog.mock.calls[0]

			// Should have title, header, and content styles
			expect(styles).toHaveLength(3)
			expect(content).toContain('Welcome Message')
			expect(content).toContain('Hello Alice!')
		})

		test('handles multiline template expressions', () => {
			type ArgsT = { items: string[]; total: number }

			say.prepare<ArgsT>('multiline-template')`
        Items: \${args => args.items.map(item => 
          '- ' + item
        ).join('\\n')}
        
        Total: \${args => args.total}
      `

			say.preset('multiline-template', {
				items: ['apple', 'banana', 'cherry'],
				total: 3
			})

			const [content] = mockConsoleLog.mock.calls[0]
			expect(content).toContain('- apple')
			expect(content).toContain('- banana')
			expect(content).toContain('- cherry')
			expect(content).toContain('Total: 3')
		})

		test('preserves whitespace and indentation in templates', () => {
			type ArgsT = { code: string }

			say.prepare<ArgsT>('code-template')`
        # Code Block
        \`\`\`javascript
        \${args => args.code}
        \`\`\`
      `

			say.preset('code-template', {
				code: 'function test() {\\n  return "hello";\\n}'
			})

			const [content] = mockConsoleLog.mock.calls[0]
			expect(content).toContain('```javascript')
			expect(content).toContain('function test()')
		})
	})

	describe('template expression evaluation', () => {
		test('evaluates simple property access', () => {
			type ArgsT = { user: { name: string; age: number } }

			say.prepare<ArgsT>('nested-template')`
        Name: \${args => args.user.name}
        Age: \${args => args.user.age}
      `

			say.preset('nested-template', {
				user: { name: 'Bob', age: 25 }
			})

			const [content] = mockConsoleLog.mock.calls[0]
			expect(content).toContain('Name: Bob')
			expect(content).toContain('Age: 25')
		})

		test('evaluates method calls and computations', () => {
			type ArgsT = { values: number[]; multiplier: number }

			say.prepare<ArgsT>('computation-template')`
        Values: \${args => args.values.join(', ')}
        Sum: \${args => args.values.reduce((a, b) => a + b, 0)}
        Average: \${args => args.values.reduce((a, b) => a + b, 0) / args.values.length}
        Multiplied: \${args => args.values.map(v => v * args.multiplier)}
      `

			say.preset('computation-template', {
				values: [1, 2, 3, 4, 5],
				multiplier: 2
			})

			const [content] = mockConsoleLog.mock.calls[0]
			expect(content).toContain('Values: 1, 2, 3, 4, 5')
			expect(content).toContain('Sum: 15')
			expect(content).toContain('Average: 3')
			expect(content).toContain('Multiplied: 2,4,6,8,10')
		})

		test('evaluates conditional expressions', () => {
			type ArgsT = { score: number; isPassing: boolean }

			say.prepare<ArgsT>('conditional-template')`
        Score: \${args => args.score}/100
        Status: \${args => args.score >= 70 ? 'PASS' : 'FAIL'}
        Grade: \${args => 
          args.score >= 90 ? 'A' :
          args.score >= 80 ? 'B' :
          args.score >= 70 ? 'C' :
          args.score >= 60 ? 'D' : 'F'
        }
        Passing: \${args => args.isPassing ? '✅' : '❌'}
      `

			say.preset('conditional-template', {
				score: 85,
				isPassing: true
			})

			const [content] = mockConsoleLog.mock.calls[0]
			expect(content).toContain('Score: 85/100')
			expect(content).toContain('Status: PASS')
			expect(content).toContain('Grade: B')
			expect(content).toContain('Passing: ✅')
		})

		test('handles Date and time formatting', () => {
			type ArgsT = { timestamp: number }

			say.prepare<ArgsT>('time-template')`
        Timestamp: \${args => args.timestamp}
        ISO: \${args => new Date(args.timestamp).toISOString()}
        Locale: \${args => new Date(args.timestamp).toLocaleString()}
        Relative: \${args => 
          Math.floor((Date.now() - args.timestamp) / 1000) < 60 
            ? 'Just now' 
            : 'Some time ago'
        }
      `

			const testTimestamp = Date.now() - 30000 // 30 seconds ago
			say.preset('time-template', { timestamp: testTimestamp })

			const [content] = mockConsoleLog.mock.calls[0]
			expect(content).toContain(`Timestamp: ${testTimestamp}`)
			expect(content).toContain('ISO: ')
			expect(content).toContain('Locale: ')
			expect(content).toContain('Relative: Just now')
		})
	})

	describe('template error handling', () => {
		test('handles undefined properties gracefully', () => {
			type ArgsT = { data?: { value?: string } }

			say.prepare<ArgsT>('undefined-template')`
        Value: \${args => args.data?.value || 'Not provided'}
      `

			say.preset('undefined-template', {})

			const [content] = mockConsoleLog.mock.calls[0]
			expect(content).toContain('Value: Not provided')
		})

		test('handles null references in expressions', () => {
			type ArgsT = { obj: null | { prop: string } }

			say.prepare<ArgsT>('null-template')`
        Property: \${args => args.obj?.prop ?? 'null object'}
      `

			say.preset('null-template', { obj: null })

			const [content] = mockConsoleLog.mock.calls[0]
			expect(content).toContain('Property: null object')
		})

		test('captures and displays expression errors', () => {
			type ArgsT = { data: any }

			say.prepare<ArgsT>('error-template')`
        Bad Access: \${args => args.data.deeply.nested.property}
      `

			say.preset('error-template', { data: {} })

			const [content] = mockConsoleLog.mock.calls[0]
			expect(content).toContain('[Error:')
			expect(content).toContain('TypeError')
		})

		test('handles syntax errors in expressions', () => {
			type ArgsT = { value: string }

			say.prepare<ArgsT>('syntax-error-template')`
        Invalid: \${args => args.value.}
      `

			say.preset('syntax-error-template', { value: 'test' })

			const [content] = mockConsoleLog.mock.calls[0]
			expect(content).toContain('[Error:')
		})
	})

	describe('template reuse and overwriting', () => {
		test('allows template overwriting with same key', () => {
			type ArgsT = { message: string }

			say.prepare<ArgsT>('reusable-template')`
        First version: \${args => args.message}
      `

			say.prepare<ArgsT>('reusable-template')`
        Second version: \${args => args.message.toUpperCase()}
      `

			say.preset('reusable-template', { message: 'hello' })

			const [content] = mockConsoleLog.mock.calls[0]
			expect(content).toContain('Second version: HELLO')
			expect(content).not.toContain('First version')
		})

		test('maintains separate templates with different keys', () => {
			type ArgsT = { value: number }

			say.prepare<ArgsT>('template-a')`
        Template A: \${args => args.value}
      `

			say.prepare<ArgsT>('template-b')`
        Template B: \${args => args.value * 2}
      `

			say.preset('template-a', { value: 5 })
			say.preset('template-b', { value: 5 })

			expect(mockConsoleLog).toHaveBeenCalledTimes(2)

			const [contentA] = mockConsoleLog.mock.calls[0]
			const [contentB] = mockConsoleLog.mock.calls[1]

			expect(contentA).toContain('Template A: 5')
			expect(contentB).toContain('Template B: 10')
		})
	})

	describe('template with various argument types', () => {
		test('handles complex nested objects in templates', () => {
			type ArgsT = {
				config: {
					database: { host: string; port: number }
					api: { version: string; endpoints: string[] }
				}
			}

			say.prepare<ArgsT>('config-template')`
        # Configuration Report
        Database: \${args => args.config.database.host}:\${args => args.config.database.port}
        API Version: \${args => args.config.api.version}
        Endpoints: \${args => args.config.api.endpoints.join(', ')}
      `

			say.preset('config-template', {
				config: {
					database: { host: 'localhost', port: 5432 },
					api: { version: 'v2', endpoints: ['/users', '/posts', '/comments'] }
				}
			})

			const [content] = mockConsoleLog.mock.calls[0]
			expect(content).toContain('Configuration Report')
			expect(content).toContain('Database: localhost:5432')
			expect(content).toContain('API Version: v2')
			expect(content).toContain('Endpoints: /users, /posts, /comments')
		})

		test('handles array manipulation in templates', () => {
			type ArgsT = { numbers: number[] }

			say.prepare<ArgsT>('array-template')`
        Numbers: \${args => args.numbers}
        Filtered: \${args => args.numbers.filter(n => n > 10)}
        Mapped: \${args => args.numbers.map(n => n * n)}
        Reduced: \${args => args.numbers.reduce((sum, n) => sum + n, 0)}
      `

			say.preset('array-template', { numbers: [5, 10, 15, 20] })

			const [content] = mockConsoleLog.mock.calls[0]
			expect(content).toContain('Numbers: 5,10,15,20')
			expect(content).toContain('Filtered: 15,20')
			expect(content).toContain('Mapped: 25,100,225,400')
			expect(content).toContain('Reduced: 50')
		})
	})
})
