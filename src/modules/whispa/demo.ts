import { whispa } from './'

const demoBasicLogs = (): void => {
	whispa('Hello world! This is a basic styled log')
	whispa.error('This is an error with beautiful red gradient styling')
	whispa.warning('This is a warning with beautiful orange gradient styling')

	whispa({
		message: 'Object logging',
		timestamp: Date.now(),
		data: [1, 2, 3, 4, 5]
	})

	whispa(['Array', 'logging', 'works', 'beautifully', 'too'])
}

const demoTemplatedLogs = (): void => {
	// Define a templated log with a title
	type UserArgsT = {
		userName: string
		userId: number
		isActive: boolean
	}

	whispa.prepare<UserArgsT>('user-status')`
    # User Status Report
    User: ${(args) => args.userName} (ID: ${(args) => args.userId})
    Status: ${(args) => (args.isActive ? 'Active' : 'Inactive')}
    Checked at: ${Date.now()}
  `

	// Use the templated log
	whispa.preset('user-status', {
		userName: 'Hannah',
		userId: 12345,
		isActive: true
	})

	whispa.preset('user-status', {
		userName: 'Bob',
		userId: 67890,
		isActive: false
	})
}

const demoMultipleFunctionCalls = (): void => {
	whispa('First call from demoMultipleFunctionCalls')
	whispa.error('Second call from demoMultipleFunctionCalls')
	whispa.warning('Third call from demoMultipleFunctionCalls')
}

const anotherFunction = (): void => {
	whispa('Call from anotherFunction')
	whispa('Another call from anotherFunction - see the counter increment!')
}

// Demo the logging system
export const runSayDemo = (): void => {
	console.log('%c🎨 SAY LOGGING DEMO 🎨', 'font-size: 20px; font-weight: bold; color: #667eea;')

	demoBasicLogs()
	demoTemplatedLogs()
	demoMultipleFunctionCalls()
	anotherFunction()
	anotherFunction() // Call again to see counter increment

	console.log(
		'%c✅ Demo complete! Check out those beautiful gradients! ✅',
		'font-size: 16px; font-weight: bold; color: #27ae60;'
	)
}
