# 🎨 Say - Beautiful Console Logging Module

A stunning, developer-friendly logging system with gorgeous gradient backgrounds, clean typography, and intelligent source tracking.

## ✨ Features

- **Beautiful Visual Styling**: Animated gradient backgrounds with subtle blur effects
- **Smart Source Tracking**: Automatically tracks file names, function names, and call counts
- **Type Safety**: Full TypeScript support with proper type definitions
- **Template System**: Create reusable log templates with parameter interpolation
- **Multiple Log Types**: Default, error, and warning styles with distinct visual themes
- **Intelligent Formatting**: Beautiful formatting for objects, arrays, booleans, and more

## 🚀 Basic Usage

```typescript
import { say } from './modules/say'

// Basic logging with beautiful gradient styling
say('Hello world!')
say.error('Something went wrong!')
say.warning('Performance warning!')

// Objects and arrays get beautiful formatting
say({
	user: 'Hannah',
	timestamp: Date.now(),
	data: [1, 2, 3]
})
```

## 🎯 Template System

Create reusable, parameterized log templates:

```typescript
// Define a template with title
type UserArgsT = {
	userName: string
	userId: number
	isActive: boolean
}

say.prepare<UserArgsT>('user-status')`
  # User Status Report
  User: ${(args) => args.userName} (ID: ${(args) => args.userId})
  Status: ${(args) => (args.isActive ? 'Active' : 'Inactive')}
  Checked at: ${Date.now()}
`

// Use the template
say.preset('user-status', {
	userName: 'Hannah',
	userId: 12345,
	isActive: true
})
```

## 🎨 Visual Features

### Gradient Themes

- **Default**: Blue to purple gradient with animated shifting
- **Error**: Red to orange gradient with urgent styling
- **Warning**: Yellow to pink to blue gradient with attention-grabbing animation

### Typography

- Uses Input Mono font family for clean, readable code display
- Proper text shadows and contrast for readability
- Uppercase headers with letter spacing for professional appearance

### Smart Formatting

- **Objects**: `📦 Object(3 keys)` with JSON preview
- **Arrays**: `📋 Array(5)` with formatted content
- **Booleans**: `✅ true` / `❌ false` with icons
- **Functions**: `🔧 Function: myFunction` with name detection
- **Null/Undefined**: `∅ null` / `⚠️ undefined` with clear indicators

## 🔧 API Reference

### Core Functions

```typescript
say(content: any): void
say.error(content: any): void
say.warning(content: any): void
```

### Template System

```typescript
say.prepare<ArgsT>(key: string): TemplateFunction<ArgsT>
say.preset<ArgsT>(key: string, args: ArgsT): void
```

### Type Definitions

```typescript
type PreparedLogArgsT = Record<string, any>

type PreparedLogT<ArgsT = Record<string, any>> = {
	template: string
	hasTitle: boolean
	title?: string
}
```

## 📊 Source Tracking

Each log automatically includes:

- **File Name**: The source file where the log was called
- **Function Name**: The function that invoked the log
- **Call Counter**: Incremental counter per function (e.g., `#7`)
- **Visual Indicator**: Emoji prefix based on log type

Example output: `💎 #3 [ChordBlock.tsx][onMouseDown]`

## 🎵 Perfect for Keybird

This logging system is specially designed for the Keybird music application:

- Beautiful styling matches the app's aesthetic
- Template system perfect for chord analysis and performance monitoring
- Source tracking invaluable for debugging complex audio interactions
- Type safety ensures reliable logging in production

## 🎪 Examples in Action

When you run the app, you'll see comprehensive examples including:

- Basic logging demonstrations
- Chord analysis templates
- Performance monitoring logs
- Error tracking with context
- Counter behavior across multiple functions

Open your browser's developer console to see the beautiful gradients and clean formatting in action!

## 💡 Best Practices

1. **Use Templates**: For repeated log patterns, always use the template system
2. **Meaningful Names**: Template keys should be descriptive ('chord-analysis', not 'ca')
3. **Type Safety**: Always define proper TypeScript types for template arguments
4. **Context**: Include relevant context in your logs for easier debugging
5. **Moderation**: Beautiful logs are still logs - don't overuse in production

---

_Built with love for developers who appreciate both function and form_ ✨
