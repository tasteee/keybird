/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { say } from '../index'

describe('whispa integration tests', () => {
  let mockConsoleLog: ReturnType<typeof vi.fn>
  let originalConsoleLog: typeof console.log
  
  beforeEach(() => {
    originalConsoleLog = console.log
    mockConsoleLog = vi.fn()
    console.log = mockConsoleLog
  })
  
  afterEach(() => {
    console.log = originalConsoleLog
    mockConsoleLog.mockClear()
  })
  
  describe('real-world usage scenarios', () => {
    test('chord analysis logging scenario', () => {
      type ChordDataT = {
        root: string
        quality: string
        inversion: number
        notes: string[]
        velocity: number
        timestamp: number
      }
      
      // Create a template for chord analysis
      say.prepare<ChordDataT>('chord-analysis')`
        # 🎵 Chord Analysis
        Chord: \${args => args.root}\${args => args.quality}
        Inversion: \${args => args.inversion === 0 ? 'Root Position' : `\${args.inversion} inversion`}
        Notes: \${args => args.notes.join(' - ')}
        Velocity: \${args => args.velocity}/127
        Played at: \${args => new Date(args.timestamp).toLocaleTimeString()}
      `
      
      // Use the template with realistic music data
      const chordData: ChordDataT = {
        root: 'C',
        quality: 'maj7',
        inversion: 1,
        notes: ['E', 'G', 'B', 'C'],
        velocity: 95,
        timestamp: Date.now()
      }
      
      say.preset('chord-analysis', chordData)
      
      expect(mockConsoleLog).toHaveBeenCalledTimes(1)
      const [logContent] = mockConsoleLog.mock.calls[0]
      
      expect(logContent).toContain('🎵 Chord Analysis')
      expect(logContent).toContain('Chord: Cmaj7')
      expect(logContent).toContain('Inversion: 1 inversion')
      expect(logContent).toContain('Notes: E - G - B - C')
      expect(logContent).toContain('Velocity: 95/127')
    })
    
    test('error tracking scenario', () => {
      type ErrorContextT = {
        error: Error
        userAction: string
        componentName: string
        props: Record<string, any>
        stackTrace: string
      }
      
      say.prepare<ErrorContextT>('error-report')`
        # 🚨 Component Error Report
        Component: \${args => args.componentName}
        Error: \${args => args.error.message}
        User Action: \${args => args.userAction}
        Props: \${args => JSON.stringify(args.props, null, 2)}
        
        Stack Trace:
        \${args => args.stackTrace}
      `
      
      const errorData: ErrorContextT = {
        error: new Error('Failed to load soundfont'),
        userAction: 'Clicked load instrument button',
        componentName: 'InstrumentLoader',
        props: { instrumentId: 'piano', autoLoad: true },
        stackTrace: 'Error: Failed to load soundfont\n  at loadSoundfont (audio.ts:45)\n  at onClick (InstrumentLoader.tsx:23)'
      }
      
      say.preset('error-report', errorData)
      
      expect(mockConsoleLog).toHaveBeenCalledTimes(1)
      const [logContent] = mockConsoleLog.mock.calls[0]
      
      expect(logContent).toContain('🚨 Component Error Report')
      expect(logContent).toContain('Component: InstrumentLoader')
      expect(logContent).toContain('Error: Failed to load soundfont')
      expect(logContent).toContain('"instrumentId": "piano"')
    })
    
    test('performance monitoring scenario', () => {
      type PerformanceMetricsT = {
        operation: string
        startTime: number
        endTime: number
        memoryUsage: number
        cpuLoad: number
        cacheHits: number
        cacheMisses: number
      }
      
      say.prepare<PerformanceMetricsT>('performance-metrics')`
        # ⚡ Performance Report
        Operation: \${args => args.operation}
        Duration: \${args => (args.endTime - args.startTime).toFixed(2)}ms
        Memory: \${args => (args.memoryUsage / 1024 / 1024).toFixed(2)}MB
        CPU Load: \${args => args.cpuLoad.toFixed(1)}%
        Cache Hit Rate: \${args => ((args.cacheHits / (args.cacheHits + args.cacheMisses)) * 100).toFixed(1)}%
        
        \${args => (args.endTime - args.startTime) > 100 ? '⚠️ SLOW OPERATION DETECTED' : '✅ Performance within acceptable range'}
      `
      
      const performanceData: PerformanceMetricsT = {
        operation: 'Audio buffer processing',
        startTime: performance.now(),
        endTime: performance.now() + 45,
        memoryUsage: 15728640,
        cpuLoad: 23.7,
        cacheHits: 847,
        cacheMisses: 23
      }
      
      say.preset('performance-metrics', performanceData)
      
      expect(mockConsoleLog).toHaveBeenCalledTimes(1)
      const [logContent] = mockConsoleLog.mock.calls[0]
      
      expect(logContent).toContain('⚡ Performance Report')
      expect(logContent).toContain('Operation: Audio buffer processing')
      expect(logContent).toContain('45.00ms')
      expect(logContent).toContain('15.00MB')
      expect(logContent).toContain('✅ Performance within acceptable range')
    })
  })
  
  describe('mixed logging types in workflow', () => {
    test('complete debugging session simulation', () => {
      // Simulate a debugging session with multiple log types
      
      // 1. Start with basic info
      say('🎹 Initializing Keybird application...')
      
      // 2. Log configuration
      const config = {
        audioContext: { sampleRate: 44100, bufferSize: 512 },
        midiInputs: ['USB MIDI Device', 'Virtual Piano'],
        selectedInstrument: 'Grand Piano'
      }
      say(config)
      
      // 3. Warning about performance
      say.warning('High CPU usage detected during audio processing - consider reducing buffer size')
      
      // 4. Error during MIDI connection
      say.error('Failed to connect to MIDI device: USB MIDI Device')
      
      // 5. Template-based status report
      type StatusReportT = {
        connectedDevices: string[]
        activeNotes: number[]
        currentTempo: number
        isRecording: boolean
      }
      
      say.prepare<StatusReportT>('system-status')`
        # 🎛️ System Status
        Connected MIDI Devices: \${args => args.connectedDevices.length > 0 ? args.connectedDevices.join(', ') : 'None'}
        Active Notes: \${args => args.activeNotes.length > 0 ? args.activeNotes.join(', ') : 'None'}
        Tempo: \${args => args.currentTempo} BPM
        Recording: \${args => args.isRecording ? '🔴 ON' : '⚪ OFF'}
      `
      
      say.preset('system-status', {
        connectedDevices: ['Virtual Piano'],
        activeNotes: [60, 64, 67], // C Major chord
        currentTempo: 120,
        isRecording: false
      })
      
      // 6. Final success message
      say('✅ Application initialized successfully')
      
      // Verify all logs were captured
      expect(mockConsoleLog).toHaveBeenCalledTimes(6)
      
      // Verify content of key logs
      const allLogs = mockConsoleLog.mock.calls.map(call => call[0])
      
      expect(allLogs[0]).toContain('🎹 Initializing Keybird')
      expect(allLogs[1]).toContain('📦 Object(3 keys)')
      expect(allLogs[2]).toContain('High CPU usage detected')
      expect(allLogs[3]).toContain('Failed to connect to MIDI')
      expect(allLogs[4]).toContain('🎛️ System Status')
      expect(allLogs[5]).toContain('✅ Application initialized')
    })
  })
  
  describe('counter behavior across different contexts', () => {
    test('maintains separate counters for different functions', () => {
      const handleChordPlay = (chordName: string) => {
        say(`Playing chord: ${chordName}`)
        say(`Chord ${chordName} processed successfully`)
      }
      
      const handleMidiInput = (note: number) => {
        say(`MIDI input received: note ${note}`)
      }
      
      const processAudioBuffer = () => {
        say('Processing audio buffer...')
        say('Audio buffer processed')
        say('Ready for next buffer')
      }
      
      // Simulate realistic usage patterns
      handleChordPlay('Cmaj')
      handleMidiInput(60)
      processAudioBuffer()
      handleChordPlay('Fmaj')
      handleMidiInput(64)
      
      expect(mockConsoleLog).toHaveBeenCalledTimes(8)
      
      // Check counter patterns
      const logs = mockConsoleLog.mock.calls.map(call => call[0])
      
      // handleChordPlay should have calls #1, #2, #3, #4
      expect(logs[0]).toMatch(/#1.*handleChordPlay/)
      expect(logs[1]).toMatch(/#2.*handleChordPlay/)
      expect(logs[5]).toMatch(/#3.*handleChordPlay/)
      expect(logs[6]).toMatch(/#4.*handleChordPlay/)
      
      // handleMidiInput should have calls #1, #2
      expect(logs[2]).toMatch(/#1.*handleMidiInput/)
      expect(logs[7]).toMatch(/#2.*handleMidiInput/)
      
      // processAudioBuffer should have calls #1, #2, #3
      expect(logs[3]).toMatch(/#1.*processAudioBuffer/)
      expect(logs[4]).toMatch(/#2.*processAudioBuffer/)
    })
  })
  
  describe('template system edge cases in real usage', () => {
    test('handles template with complex musical data', () => {
      type ChordProgressionT = {
        chords: Array<{
          root: string
          quality: string
          duration: number
          measure: number
          beat: number
        }>
        key: string
        timeSignature: [number, number]
        tempo: number
      }
      
      say.prepare<ChordProgressionT>('chord-progression')`
        # 🎼 Chord Progression Analysis
        Key: \${args => args.key}
        Time Signature: \${args => args.timeSignature.join('/')}
        Tempo: \${args => args.tempo} BPM
        
        Chord Sequence:
        \${args => args.chords.map((chord, i) => 
          `  \${i + 1}. \${chord.root}\${chord.quality} (M\${chord.measure}.B\${chord.beat}, \${chord.duration}q)`
        ).join('\\n')}
        
        Total Duration: \${args => args.chords.reduce((sum, chord) => sum + chord.duration, 0)} quarter notes
      `
      
      const progressionData: ChordProgressionT = {
        chords: [
          { root: 'C', quality: 'maj', duration: 4, measure: 1, beat: 1 },
          { root: 'F', quality: 'maj', duration: 4, measure: 2, beat: 1 },
          { root: 'G', quality: 'maj', duration: 4, measure: 3, beat: 1 },
          { root: 'C', quality: 'maj', duration: 4, measure: 4, beat: 1 }
        ],
        key: 'C Major',
        timeSignature: [4, 4],
        tempo: 120
      }
      
      say.preset('chord-progression', progressionData)
      
      expect(mockConsoleLog).toHaveBeenCalledTimes(1)
      const [logContent] = mockConsoleLog.mock.calls[0]
      
      expect(logContent).toContain('🎼 Chord Progression Analysis')
      expect(logContent).toContain('Key: C Major')
      expect(logContent).toContain('Time Signature: 4/4')
      expect(logContent).toContain('1. Cmaj (M1.B1, 4q)')
      expect(logContent).toContain('Total Duration: 16 quarter notes')
    })
    
    test('handles template with error conditions', () => {
      type ErrorTemplateT = {
        errorLevel: 'warning' | 'error' | 'critical'
        component: string
        message: string
        context?: Record<string, any>
      }
      
      say.prepare<ErrorTemplateT>('contextual-error')`
        # \${args => 
          args.errorLevel === 'critical' ? '🔥 CRITICAL ERROR' :
          args.errorLevel === 'error' ? '🚨 ERROR' :
          '⚠️ WARNING'
        }
        Component: \${args => args.component}
        Message: \${args => args.message}
        Severity: \${args => args.errorLevel.toUpperCase()}
        \${args => args.context ? `Context: \${JSON.stringify(args.context)}` : 'No additional context'}
      `
      
      // Test with different error levels
      say.preset('contextual-error', {
        errorLevel: 'warning',
        component: 'AudioEngine',
        message: 'Buffer underrun detected',
        context: { bufferSize: 512, sampleRate: 44100 }
      })
      
      say.preset('contextual-error', {
        errorLevel: 'critical',
        component: 'MIDIManager',
        message: 'Complete MIDI system failure'
      })
      
      expect(mockConsoleLog).toHaveBeenCalledTimes(2)
      
      const [warningLog] = mockConsoleLog.mock.calls[0]
      const [criticalLog] = mockConsoleLog.mock.calls[1]
      
      expect(warningLog).toContain('⚠️ WARNING')
      expect(warningLog).toContain('Buffer underrun detected')
      expect(warningLog).toContain('"bufferSize": 512')
      
      expect(criticalLog).toContain('🔥 CRITICAL ERROR')
      expect(criticalLog).toContain('Complete MIDI system failure')
      expect(criticalLog).toContain('No additional context')
    })
  })
  
  describe('style consistency across usage patterns', () => {
    test('maintains consistent styling across mixed log types', () => {
      say('Basic message')
      say.error('Error message')
      say.warning('Warning message')
      
      expect(mockConsoleLog).toHaveBeenCalledTimes(3)
      
      // All should have the base styling characteristics
      mockConsoleLog.mock.calls.forEach(([content, ...styles]) => {
        expect(styles.length).toBeGreaterThan(0)
        expect(styles[1]).toContain('font-family: "Input Mono Regular"')
        expect(styles[1]).toContain('border-radius: 8px')
        expect(styles[1]).toContain('animation: gradientShift')
      })
      
      // But different background gradients
      const [, , defaultStyles] = mockConsoleLog.mock.calls[0]
      const [, , errorStyles] = mockConsoleLog.mock.calls[1] 
      const [, , warningStyles] = mockConsoleLog.mock.calls[2]
      
      expect(defaultStyles).toContain('#667eea')
      expect(errorStyles).toContain('#ff6b6b')
      expect(warningStyles).toContain('#feca57')
    })
  })
})
