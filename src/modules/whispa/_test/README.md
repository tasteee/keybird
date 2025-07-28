# Whispa Logging Module Tests

This directory contains comprehensive tests for the `whispa` logging module (formerly `say`).

## Test Files

### `whispa.test.ts`

- **Core functionality tests**: Basic logging, error/warning types, content formatting
- **Source tracking tests**: File name extraction, function name detection, call counters
- **Template system tests**: Basic template creation and usage
- **CSS animation injection**: Ensures animations are added correctly
- **Edge cases**: Circular references, large data structures, special values

### `template.test.ts`

- **Template parsing**: Tests with and without titles, multiline expressions
- **Expression evaluation**: Property access, method calls, computations, conditionals
- **Error handling**: Undefined properties, null references, syntax errors
- **Template reuse**: Overwriting templates, maintaining separate instances
- **Complex arguments**: Nested objects, array manipulation

### `formatting.test.ts`

- **Primitive formatting**: Strings, numbers, booleans, null/undefined
- **Array formatting**: Empty arrays, mixed types, nested arrays, large arrays
- **Object formatting**: Empty objects, nested objects, key counting
- **Function formatting**: Named functions, anonymous functions, arrow functions
- **Special objects**: Date, RegExp, Map, Set, Error objects
- **Edge cases**: Circular references, deep nesting, toJSON methods

### `performance.test.ts`

- **Performance characteristics**: Large objects, deep nesting, rapid calls
- **Error resilience**: Circular references, problematic properties
- **Memory usage**: Template creation/overwriting, memory leak prevention
- **Browser compatibility**: Missing APIs, degraded functionality
- **Concurrent usage**: Simultaneous calls, counter isolation

### `integration.test.ts`

- **Real-world scenarios**: Chord analysis, error tracking, performance monitoring
- **Mixed workflows**: Complete debugging sessions with multiple log types
- **Counter behavior**: Cross-function counter management
- **Complex templates**: Musical data, error conditions with context
- **Style consistency**: Maintained across different usage patterns

## Running the Tests

```bash
# Run all whispa tests
npm test -- whispa

# Run specific test file
npm test -- whispa/whispa.test.ts

# Run with coverage
npm test -- --coverage whispa/

# Watch mode for development
npm test -- --watch whispa/
```

## Test Environment

Tests are configured to run in a JSDOM environment to simulate browser APIs like:

- `document.querySelector()` for CSS injection
- `console.log()` for capturing styled output
- `performance.now()` for timing measurements
- Error stack traces for source tracking

## Coverage Goals

The test suite aims for:

- **95%+ line coverage** across all module functions
- **90%+ branch coverage** for conditional logic
- **100% function coverage** for all exported methods
- **Comprehensive edge case coverage** for error resilience

## Test Utilities

Each test file includes utilities for:

- **Console capture**: Mock `console.log` to verify output
- **Style verification**: Check CSS styling is applied correctly
- **Performance measurement**: Validate timing and memory usage
- **Error simulation**: Test error handling and recovery
