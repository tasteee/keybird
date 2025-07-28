/**
 * @vitest-environment jsdom
 */
import { describe, test, expect } from 'vitest'
import { say } from '../index'

// Access the formatContent function for direct testing
// We'll need to extract this from the module for isolated testing
const getFormattedContent = (content: any): string => {
	// Capture the formatted content by mocking console.log
	let capturedContent = ''
	const originalConsoleLog = console.log

	console.log = (logContent: string) => {
		// Extract the actual content part (after the header)
		const parts = logContent.split('\n')
		capturedContent = parts[parts.length - 1] || ''
	}

	say(content)
	console.log = originalConsoleLog

	return capturedContent
}

describe('whispa content formatting', () => {
	describe('primitive types', () => {
		test('formats strings without modification', () => {
			const result = getFormattedContent('hello world')
			expect(result).toBe('hello world')
		})

		test('formats empty strings', () => {
			const result = getFormattedContent('')
			expect(result).toBe('')
		})

		test('formats strings with special characters', () => {
			const result = getFormattedContent('Hello\nWorld\t!')
			expect(result).toBe('Hello\nWorld\t!')
		})

		test('formats numbers as strings', () => {
			expect(getFormattedContent(42)).toBe('42')
			expect(getFormattedContent(3.14159)).toBe('3.14159')
			expect(getFormattedContent(0)).toBe('0')
			expect(getFormattedContent(-42)).toBe('-42')
		})

		test('formats special numeric values', () => {
			expect(getFormattedContent(NaN)).toBe('NaN')
			expect(getFormattedContent(Infinity)).toBe('Infinity')
			expect(getFormattedContent(-Infinity)).toBe('-Infinity')
		})

		test('formats booleans with emoji indicators', () => {
			expect(getFormattedContent(true)).toBe('✅ true')
			expect(getFormattedContent(false)).toBe('❌ false')
		})

		test('formats null with special indicator', () => {
			expect(getFormattedContent(null)).toBe('∅ null')
		})

		test('formats undefined with warning indicator', () => {
			expect(getFormattedContent(undefined)).toBe('⚠️ undefined')
		})
	})

	describe('array formatting', () => {
		test('formats empty arrays', () => {
			const result = getFormattedContent([])
			expect(result).toBe('📋 []')
		})

		test('formats arrays with length info and JSON content', () => {
			const result = getFormattedContent([1, 2, 3])
			expect(result).toContain('📋 Array(3):')
			expect(result).toContain('[\n  1,\n  2,\n  3\n]')
		})

		test('formats arrays with mixed types', () => {
			const result = getFormattedContent([1, 'hello', true, null])
			expect(result).toContain('📋 Array(4):')
			expect(result).toContain('1')
			expect(result).toContain('"hello"')
			expect(result).toContain('true')
			expect(result).toContain('null')
		})

		test('formats nested arrays', () => {
			const result = getFormattedContent([
				[1, 2],
				[3, 4]
			])
			expect(result).toContain('📋 Array(2):')
			expect(result).toContain('[\n  [\n    1,\n    2\n  ],')
		})

		test('formats large arrays', () => {
			const largeArray = new Array(100).fill(0).map((_, i) => i)
			const result = getFormattedContent(largeArray)
			expect(result).toContain('📋 Array(100):')
			expect(result).toContain('[')
			expect(result).toContain('99')
		})
	})

	describe('object formatting', () => {
		test('formats empty objects', () => {
			const result = getFormattedContent({})
			expect(result).toBe('📦 {}')
		})

		test('formats objects with key count and JSON content', () => {
			const result = getFormattedContent({ a: 1, b: 2, c: 'hello' })
			expect(result).toContain('📦 Object(3 keys):')
			expect(result).toContain('"a": 1')
			expect(result).toContain('"b": 2')
			expect(result).toContain('"c": "hello"')
		})

		test('formats nested objects', () => {
			const result = getFormattedContent({
				user: { name: 'Alice', age: 30 },
				settings: { theme: 'dark', notifications: true }
			})
			expect(result).toContain('📦 Object(2 keys):')
			expect(result).toContain('"user"')
			expect(result).toContain('"name": "Alice"')
			expect(result).toContain('"settings"')
			expect(result).toContain('"theme": "dark"')
		})

		test('formats objects with array properties', () => {
			const result = getFormattedContent({
				items: ['apple', 'banana'],
				count: 2
			})
			expect(result).toContain('📦 Object(2 keys):')
			expect(result).toContain('"items": [\n    "apple",\n    "banana"\n  ]')
			expect(result).toContain('"count": 2')
		})

		test('formats objects with null and undefined values', () => {
			const result = getFormattedContent({
				value: null,
				other: undefined,
				number: 42
			})
			expect(result).toContain('📦 Object(3 keys):')
			expect(result).toContain('"value": null')
			expect(result).toContain('"other": null') // JSON.stringify converts undefined to null
			expect(result).toContain('"number": 42')
		})
	})

	describe('function formatting', () => {
		test('formats named functions', () => {
			function testFunction() {
				return 'test'
			}
			const result = getFormattedContent(testFunction)
			expect(result).toBe('🔧 Function: testFunction')
		})

		test('formats anonymous functions', () => {
			const anonymousFunc = function () {
				return 'anonymous'
			}
			const result = getFormattedContent(anonymousFunc)
			expect(result).toBe('🔧 Function: anonymous')
		})

		test('formats arrow functions', () => {
			const arrowFunc = () => 'arrow'
			const result = getFormattedContent(arrowFunc)
			expect(result).toBe('🔧 Function: anonymous')
		})

		test('formats named arrow functions', () => {
			const namedArrow = function namedArrowFunc() {
				return 'named'
			}
			const result = getFormattedContent(namedArrow)
			expect(result).toBe('🔧 Function: namedArrowFunc')
		})

		test('formats class constructors', () => {
			class TestClass {}
			const result = getFormattedContent(TestClass)
			expect(result).toBe('🔧 Function: TestClass')
		})
	})

	describe('complex data structures', () => {
		test('formats Date objects', () => {
			const date = new Date('2023-01-01T00:00:00.000Z')
			const result = getFormattedContent(date)
			expect(result).toContain('📦 Object')
			expect(result).toContain('2023-01-01T00:00:00.000Z')
		})

		test('formats RegExp objects', () => {
			const regex = /test[0-9]+/gi
			const result = getFormattedContent(regex)
			expect(result).toContain('📦 Object')
		})

		test('formats Map objects', () => {
			const map = new Map([
				['key1', 'value1'],
				['key2', 'value2']
			])
			const result = getFormattedContent(map)
			expect(result).toContain('📦 Object')
		})

		test('formats Set objects', () => {
			const set = new Set([1, 2, 3, 3, 4])
			const result = getFormattedContent(set)
			expect(result).toContain('📦 Object')
		})

		test('formats Error objects', () => {
			const error = new Error('Test error message')
			const result = getFormattedContent(error)
			expect(result).toContain('📦 Object')
			expect(result).toContain('Test error message')
		})
	})

	describe('edge cases', () => {
		test('handles objects with toJSON method', () => {
			const objWithToJSON = {
				value: 42,
				toJSON() {
					return { serialized: true, originalValue: this.value }
				}
			}
			const result = getFormattedContent(objWithToJSON)
			expect(result).toContain('📦 Object')
			expect(result).toContain('"serialized": true')
			expect(result).toContain('"originalValue": 42')
		})

		test('handles objects with circular references', () => {
			const circular: any = { name: 'test' }
			circular.self = circular

			// Should not throw an error, but may show [Circular] or similar
			expect(() => getFormattedContent(circular)).not.toThrow()
		})

		test('handles very deeply nested objects', () => {
			let deepObj: any = {}
			let current = deepObj
			for (let i = 0; i < 10; i++) {
				current.nested = {}
				current = current.nested
			}
			current.value = 'deep'

			const result = getFormattedContent(deepObj)
			expect(result).toContain('📦 Object')
			expect(result).toContain('"value": "deep"')
		})

		test('handles objects with symbol keys', () => {
			const sym = Symbol('testSymbol')
			const objWithSymbol = { [sym]: 'symbol value', regular: 'regular value' }
			const result = getFormattedContent(objWithSymbol)
			expect(result).toContain('📦 Object')
			expect(result).toContain('"regular": "regular value"')
			// Symbol keys are typically not included in JSON.stringify
		})

		test('handles objects with non-enumerable properties', () => {
			const obj = {}
			Object.defineProperty(obj, 'hidden', {
				value: 'not enumerable',
				enumerable: false
			})
			Object.defineProperty(obj, 'visible', {
				value: 'enumerable',
				enumerable: true
			})

			const result = getFormattedContent(obj)
			expect(result).toContain('📦 Object')
			expect(result).toContain('"visible": "enumerable"')
			// Non-enumerable properties typically not included in JSON.stringify
		})
	})

	describe('formatting consistency', () => {
		test('maintains consistent formatting across multiple calls', () => {
			const testData = { count: 42, items: [1, 2, 3] }
			const result1 = getFormattedContent(testData)
			const result2 = getFormattedContent(testData)

			expect(result1).toBe(result2)
		})

		test('handles identical objects consistently', () => {
			const obj1 = { a: 1, b: 2 }
			const obj2 = { a: 1, b: 2 }

			const result1 = getFormattedContent(obj1)
			const result2 = getFormattedContent(obj2)

			// Should have same format even though different object instances
			expect(result1).toBe(result2)
		})

		test('formats arrays with same content consistently', () => {
			const arr1 = [1, 2, 3]
			const arr2 = [1, 2, 3]

			const result1 = getFormattedContent(arr1)
			const result2 = getFormattedContent(arr2)

			expect(result1).toBe(result2)
		})
	})
})
