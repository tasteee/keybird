/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { say } from '../index'

describe('whispa performance and edge cases', () => {
	let originalConsoleLog: typeof console.log
	let mockConsoleLog: ReturnType<typeof vi.fn>

	beforeEach(() => {
		originalConsoleLog = console.log
		mockConsoleLog = vi.fn()
		console.log = mockConsoleLog
	})

	afterEach(() => {
		console.log = originalConsoleLog
		mockConsoleLog.mockClear()
	})

	describe('performance characteristics', () => {
		test('handles large objects efficiently', () => {
			const largeObject: Record<string, any> = {}

			// Create a large object
			for (let i = 0; i < 1000; i++) {
				largeObject[`key${i}`] = {
					id: i,
					name: `item${i}`,
					data: new Array(10).fill(i),
					nested: {
						level1: { level2: { level3: `deep${i}` } }
					}
				}
			}

			const startTime = performance.now()
			say(largeObject)
			const endTime = performance.now()

			expect(endTime - startTime).toBeLessThan(100) // Should complete in under 100ms
			expect(mockConsoleLog).toHaveBeenCalledTimes(1)
		})

		test('handles very deep nesting without stack overflow', () => {
			let deepObject: any = {}
			let current = deepObject

			// Create 100 levels of nesting
			for (let i = 0; i < 100; i++) {
				current.nested = { level: i }
				current = current.nested
			}

			expect(() => say(deepObject)).not.toThrow()
			expect(mockConsoleLog).toHaveBeenCalledTimes(1)
		})

		test('handles rapid consecutive calls efficiently', () => {
			const startTime = performance.now()

			// Make 100 rapid calls
			for (let i = 0; i < 100; i++) {
				say(`Message ${i}`)
			}

			const endTime = performance.now()

			expect(endTime - startTime).toBeLessThan(200) // Should complete in under 200ms
			expect(mockConsoleLog).toHaveBeenCalledTimes(100)
		})

		test('CSS animation injection only happens once across many calls', () => {
			// Remove any existing style element
			const existingStyle = document.querySelector('#say-animations')
			if (existingStyle) {
				existingStyle.remove()
			}

			// Make multiple calls
			say('first call')
			say('second call')
			say('third call')

			// Should only have one style element
			const styleElements = document.querySelectorAll('#say-animations')
			expect(styleElements).toHaveLength(1)

			const styleElement = styleElements[0]
			expect(styleElement.textContent).toContain('@keyframes gradientShift')
		})
	})

	describe('error resilience', () => {
		test('handles circular references gracefully', () => {
			const circular: any = { name: 'root' }
			circular.self = circular
			circular.child = { parent: circular }

			expect(() => say(circular)).not.toThrow()
			expect(mockConsoleLog).toHaveBeenCalledTimes(1)

			const [logContent] = mockConsoleLog.mock.calls[0]
			expect(logContent).toContain('📦 Object')
		})

		test('handles objects with problematic properties', () => {
			const problematicObject = {
				normal: 'value',
				get thrower() {
					throw new Error('Property access error')
				},
				symbol: Symbol('test'),
				func: () => 'function value'
			}

			expect(() => say(problematicObject)).not.toThrow()
			expect(mockConsoleLog).toHaveBeenCalledTimes(1)
		})

		test('handles null prototype objects', () => {
			const nullProtoObject = Object.create(null)
			nullProtoObject.key = 'value'
			nullProtoObject.number = 42

			expect(() => say(nullProtoObject)).not.toThrow()
			expect(mockConsoleLog).toHaveBeenCalledTimes(1)
		})

		test('handles objects with non-enumerable properties', () => {
			const obj = { visible: 'yes' }
			Object.defineProperty(obj, 'hidden', {
				value: 'no',
				enumerable: false
			})

			expect(() => say(obj)).not.toThrow()
			expect(mockConsoleLog).toHaveBeenCalledTimes(1)

			const [logContent] = mockConsoleLog.mock.calls[0]
			expect(logContent).toContain('"visible": "yes"')
			// Non-enumerable properties won't appear in JSON.stringify
		})
	})

	describe('memory usage', () => {
		test('does not leak memory with many template creations', () => {
			// Create many templates to test for memory leaks
			for (let i = 0; i < 100; i++) {
				type TestArgsT = { id: number }

				say.prepare<TestArgsT>(`template-${i}`)`
          Template ${i}: \${args => args.id}
        `
			}

			// Use some templates
			for (let i = 0; i < 10; i++) {
				say.preset(`template-${i}`, { id: i })
			}

			expect(mockConsoleLog).toHaveBeenCalledTimes(10)
		})

		test('handles template overwriting without memory leaks', () => {
			type TestArgsT = { value: string }

			// Overwrite the same template multiple times
			for (let i = 0; i < 50; i++) {
				say.prepare<TestArgsT>('reused-template')`
          Version ${i}: \${args => args.value}
        `
			}

			say.preset('reused-template', { value: 'final' })

			expect(mockConsoleLog).toHaveBeenCalledTimes(1)
			const [logContent] = mockConsoleLog.mock.calls[0]
			expect(logContent).toContain('Version 49: final')
		})
	})

	describe('browser compatibility', () => {
		test('works without performance API', () => {
			const originalPerformance = globalThis.performance
			// @ts-ignore - Testing browser compatibility
			delete globalThis.performance

			expect(() => say('test without performance API')).not.toThrow()
			expect(mockConsoleLog).toHaveBeenCalledTimes(1)

			globalThis.performance = originalPerformance
		})

		test('works without document.querySelector', () => {
			const originalQuerySelector = document.querySelector
			// @ts-ignore - Testing browser compatibility
			document.querySelector = undefined

			expect(() => say('test without querySelector')).not.toThrow()
			expect(mockConsoleLog).toHaveBeenCalledTimes(1)

			document.querySelector = originalQuerySelector
		})

		test('handles missing stack trace gracefully', () => {
			const originalStack = Error.prototype.stack

			Object.defineProperty(Error.prototype, 'stack', {
				get() {
					return undefined
				},
				configurable: true
			})

			expect(() => say('test without stack trace')).not.toThrow()
			expect(mockConsoleLog).toHaveBeenCalledTimes(1)

			const [logContent] = mockConsoleLog.mock.calls[0]
			expect(logContent).toContain('[unknown][anonymous]')

			Object.defineProperty(Error.prototype, 'stack', {
				get() {
					return originalStack
				},
				configurable: true
			})
		})
	})

	describe('concurrent usage', () => {
		test('handles multiple simultaneous calls correctly', async () => {
			const promises = []

			// Create 20 concurrent logging operations
			for (let i = 0; i < 20; i++) {
				promises.push(
					new Promise((resolve) => {
						setTimeout(() => {
							say(`Concurrent message ${i}`)
							resolve(i)
						}, Math.random() * 10)
					})
				)
			}

			await Promise.all(promises)

			expect(mockConsoleLog).toHaveBeenCalledTimes(20)
		})

		test('maintains separate counters in concurrent scenarios', async () => {
			const functionA = async (id: number) => {
				await new Promise((resolve) => setTimeout(resolve, Math.random() * 5))
				say(`Function A: ${id}`)
			}

			const functionB = async (id: number) => {
				await new Promise((resolve) => setTimeout(resolve, Math.random() * 5))
				say(`Function B: ${id}`)
			}

			// Run functions concurrently
			await Promise.all([functionA(1), functionB(1), functionA(2), functionB(2), functionA(3), functionB(3)])

			expect(mockConsoleLog).toHaveBeenCalledTimes(6)

			// Check that counters are maintained correctly
			const calls = mockConsoleLog.mock.calls
			const functionACalls = calls.filter((call) => call[0].includes('Function A'))
			const functionBCalls = calls.filter((call) => call[0].includes('Function B'))

			expect(functionACalls).toHaveLength(3)
			expect(functionBCalls).toHaveLength(3)
		})
	})

	describe('edge case inputs', () => {
		test('handles all JavaScript primitive types', () => {
			const testValues = [
				'string',
				42,
				BigInt(9007199254740991),
				true,
				false,
				null,
				undefined,
				Symbol('test'),
				Symbol.for('global-symbol')
			]

			expect(() => {
				testValues.forEach((value) => say(value))
			}).not.toThrow()

			expect(mockConsoleLog).toHaveBeenCalledTimes(testValues.length)
		})

		test('handles special objects', () => {
			const specialObjects = [
				new Date(),
				new RegExp('test'),
				new Map([['key', 'value']]),
				new Set([1, 2, 3]),
				new WeakMap(),
				new WeakSet(),
				new ArrayBuffer(8),
				new Int32Array([1, 2, 3]),
				new Float64Array([1.1, 2.2, 3.3]),
				new Error('test error'),
				new TypeError('type error'),
				Promise.resolve('promise'),
				async function () {
					return 'async'
				},
				function* generator() {
					yield 1
				}
			]

			expect(() => {
				specialObjects.forEach((obj) => say(obj))
			}).not.toThrow()

			expect(mockConsoleLog).toHaveBeenCalledTimes(specialObjects.length)
		})
	})
})
