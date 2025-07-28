import { whispa } from './'

export const basicLoggingExample = (): void => {
	whispa('🎵 Welcome to Keybird! This is a basic log with beautiful gradient styling')
	whispa.error('❌ Connection to MIDI device failed - check your setup')
	whispa.warning('⚠️ High CPU usage detected - consider optimizing audio settings')

	whispa({
		event: 'chord_played',
		chord: { root: 'C', quality: 'major', inversion: 0 },
		velocity: 80,
		timestamp: Date.now(),
		player: {
			id: 'user123',
			instrument: 'piano',
			settings: { reverb: 0.3, volume: 0.8 }
		}
	})
}

// Example 2: Templated logs with arguments
export const templatedLoggingExample = (): void => {
	// Define a beautiful chord analysis template
	type ChordAnalysisArgsT = {
		chordName: string
		root: string
		quality: string
		inversion: number
		scale: string
		velocity: number
	}

	whispa.prepare<ChordAnalysisArgsT>('chord-analysis')`
    # 🎼 Chord Analysis Report
    Chord: ${(args) => args.chordName}
    Root Note: ${(args) => args.root}
    Quality: ${(args) => args.quality}
    Inversion: ${(args) => (args.inversion === 0 ? 'Root Position' : `${args.inversion} inversion`)}
    Scale Context: ${(args) => args.scale}
    Velocity: ${(args) => args.velocity}/127
    Analysis Time: ${Date.now()}
  `

	// Use the template with different chord data
	whispa.preset('chord-analysis', {
		chordName: 'Cmaj7',
		root: 'C',
		quality: 'Major 7th',
		inversion: 0,
		scale: 'C Major',
		velocity: 95
	})

	whispa.preset('chord-analysis', {
		chordName: 'Am7',
		root: 'A',
		quality: 'Minor 7th',
		inversion: 1,
		scale: 'C Major',
		velocity: 72
	})
}

// Example 3: Performance monitoring logs
export const performanceLoggingExample = (): void => {
	type PerformanceArgsT = {
		operation: string
		duration: number
		memoryUsed: number
		cpuUsage: number
	}

	whispa.prepare<PerformanceArgsT>('performance-report')`
    # ⚡ Performance Monitor
    Operation: ${(args) => args.operation}
    Duration: ${(args) => args.duration}ms
    Memory: ${(args) => (args.memoryUsed / 1024 / 1024).toFixed(2)}MB
    CPU: ${(args) => args.cpuUsage.toFixed(1)}%
    ${(args) => (args.duration > 100 ? '⚠️ SLOW OPERATION DETECTED' : '✅ Performance OK')}
  `

	// Simulate performance data
	whispa.preset('performance-report', {
		operation: 'Audio Buffer Processing',
		duration: 45,
		memoryUsed: 15728640, // bytes
		cpuUsage: 23.5
	})

	whispa.preset('performance-report', {
		operation: 'MIDI Event Processing',
		duration: 150, // This will trigger the slow operation warning
		memoryUsed: 8388608,
		cpuUsage: 67.2
	})
}

// Example 4: Error tracking with context
export const errorTrackingExample = (): void => {
	type ErrorContextArgsT = {
		errorMessage: string
		stackTrace: string
		userAction: string
		sessionId: string
		timestamp: number
	}

	whispa.prepare<ErrorContextArgsT>('error-context')`
    # 🚨 Error Context Report
    Error: ${(args) => args.errorMessage}
    User Action: ${(args) => args.userAction}
    Session: ${(args) => args.sessionId}
    
    Stack Trace:
    ${(args) => args.stackTrace}
    
    Time: ${(args) => new Date(args.timestamp).toISOString()}
  `

	whispa.preset('error-context', {
		errorMessage: 'Failed to load soundfont',
		stackTrace: 'Error: NETWORK_ERROR\n  at loadSoundfont (soundfont.ts:45)\n  at initializeAudio (audio.ts:12)',
		userAction: 'Clicked "Load Piano" button',
		sessionId: 'sess_abc123def',
		timestamp: Date.now()
	})
}

// Example 5: Multiple function calls to show counter behavior
export const counterBehaviorExample = (): void => {
	whispa('First call from counterBehaviorExample')
	whispa('Second call - watch the counter increment!')
	whispa.error('Third call - still counting!')
}

export const anotherCounterFunction = (): void => {
	whispa('Call from anotherCounterFunction')
	whispa('Another call from same function')
}

// Run all examples
export const runComprehensiveDemo = (): void => {
	console.log(
		'%c🎨 COMPREHENSIVE whispa LOGGING DEMO 🎨',
		'font-size: 24px; font-weight: bold; color: #667eea; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);'
	)

	console.log('%c--- Basic Logging ---', 'font-size: 16px; font-weight: bold; color: #27ae60;')
	basicLoggingExample()

	console.log('%c--- Templated Logging ---', 'font-size: 16px; font-weight: bold; color: #27ae60;')
	templatedLoggingExample()

	console.log('%c--- Performance Monitoring ---', 'font-size: 16px; font-weight: bold; color: #27ae60;')
	performanceLoggingExample()

	console.log('%c--- Error Tracking ---', 'font-size: 16px; font-weight: bold; color: #27ae60;')
	errorTrackingExample()

	console.log('%c--- Counter Behavior ---', 'font-size: 16px; font-weight: bold; color: #27ae60;')
	counterBehaviorExample()
	anotherCounterFunction()
	anotherCounterFunction() // Call again to see increment

	console.log(
		'%c✨ Demo Complete! Beautiful gradients and clean organization! ✨',
		'font-size: 18px; font-weight: bold; color: #e74c3c; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);'
	)
}
