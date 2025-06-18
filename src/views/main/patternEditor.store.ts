import { SIGNAL_ROWS } from '#/modules/patterns/signalRows'
import { datass } from 'datass'
import { listerine } from 'listerine'

const getEnabledSignalRowIds = () => {
	const array = Object.values(SIGNAL_ROWS)
	const list = listerine(array)
	const enabledOnes = list.find({ isEnabled: true })
	return enabledOnes.map(({ id }) => id)
}

const $selectedSignalData = datass.object<any>({
	id: '',
	rowId: '',
	isTemporaryMove: false,
	originalPosition: null,
	overlappingSignals: [],
	temporarySignalModifications: [] // Store temporary modifications to signals
})

const $signalRows = datass.object<SignalRowsT>(SIGNAL_ROWS)
const $beatsLength = datass.number(32) // 32 beats long
const $cellWidth = datass.number(20)
const $enabledSignalRowIds = datass.array<string>(getEnabledSignalRowIds())

$signalRows.watch(() => {
	const enabledSignalRowIds = getEnabledSignalRowIds()
	$enabledSignalRowIds.set(enabledSignalRowIds)
})

const getSignalRow = (id: string) => {
	const currentRows = $patternEditor.signalRows.state
	const signalRow = currentRows[id]
	if (!signalRow) return null
	return signalRow
}

const disableSignalRow = (id: string) => {
	const currentRows = $patternEditor.signalRows.state
	const updatedRows = { ...currentRows }
	const updateRow = { ...currentRows[id] }
	updateRow.isEnabled = false
	updatedRows[id] = updateRow
	$patternEditor.signalRows.set(updatedRows)
}

const enableSignalRow = (id: string) => {
	const currentRows = $patternEditor.signalRows.state
	const updatedRows = { ...currentRows }
	const updateRow = { ...currentRows[id] }
	updateRow.isEnabled = true
	updatedRows[id] = updateRow
	$patternEditor.signalRows.set(updatedRows)
}

const getSignal = (params: { rowId: string; signalId: string }) => {
	const signalRow = getSignalRow(params.rowId)
	if (!signalRow) return null
	const finder = (signal: any) => signal.id === params.signalId
	return signalRow.signals.find(finder)
}

const removeSignal = (params: { rowId: string; signalId: string }) => {
	const row = $patternEditor.signalRows.state[params.rowId]
	const filterer = (signal: any) => signal.id !== params.signalId
	const signals = row.signals.filter(filterer)
	const updatedRow = { ...row, signals }
	$patternEditor.signalRows.set.lookup(params.rowId, updatedRow)
}

const addSignal = (params: { rowId: string; signal: any }) => {
	const row = $patternEditor.signalRows.state[params.rowId]
	const id = params.signal.id || crypto.randomUUID()
	const signal = { ...params.signal, id, updatedTime: Date.now() }
	const signals = [...row.signals, signal]
	const updatedRow = { ...row, signals }
	$patternEditor.signalRows.set.lookup(params.rowId, updatedRow)
}

const reset = () => {
	$patternEditor.signalRows.set.reset()
	$patternEditor.cellWidth.set.reset()
}

const useSignalRow = (rowId: string): SignalRowT => {
	return $patternEditor.signalRows.use.lookup(rowId)
}

const useSignal = (params: { rowId: string; signalId: string }) => {
	return $patternEditor.signalRows.use((state) => {
		const signalRow = state[params.rowId]
		const finder = (signal: any) => signal.id === params.signalId
		return signalRow.signals.find(finder)
	})
}

const getItemById = (target: any[], id: string) => {
	return target.find((item) => item.id === id)
}

const splitSignalFromSignals = (signalId: string, signals: SignalT[]) => {
	const target = { signal: null, signals: [] }

	const reducer = (final, signal) => {
		if (signal.id === signalId) final.signal = signal
		else final.signals.push(signal)
		return final
	}

	return signals.reduce(reducer, target)
}

const moveSignal = (params: {
	fromRowId: string
	toRowId: string
	signalId: string
	startDivision: number
	endDivision: number
}) => {
	const currentRows = $patternEditor.signalRows.state
	const fromRow = currentRows[params.fromRowId]
	const toRow = currentRows[params.toRowId]
	const { signal, signals } = splitSignalFromSignals(params.signalId, fromRow.signals)
	if (!signal) return

	const updatedSignal = {
		...signal,
		noteId: params.toRowId,
		startDivision: params.startDivision,
		endDivision: params.endDivision,
		updatedTime: Date.now()
	}

	// Add signal to destination row
	const updatedToSignals = [...toRow.signals, updatedSignal]

	const updatedRows = {
		...currentRows,
		[params.fromRowId]: { ...fromRow, signals },
		[params.toRowId]: { ...toRow, signals: updatedToSignals }
	}

	$patternEditor.signalRows.set(updatedRows)
	correctRowSignalsDivisions(params.toRowId)
}

const updateSignal = (params: Partial<SignalT> & { rowId: string; signalId: string }) => {
	const { rowId, signalId, ...updates } = params
	const currentRows = $patternEditor.signalRows.state
	const signalRow = currentRows[rowId]
	if (!signalRow) return

	const { signal, signals } = splitSignalFromSignals(params.signalId, signalRow.signals)
	const updatedSignal = { ...signal, ...updates, updatedTime: Date.now() }
	const updatedSignals = [...signals, updatedSignal]
	const updatedRow = { ...signalRow, signals: updatedSignals }
	const updatedRows = { ...currentRows, [rowId]: updatedRow }
	$patternEditor.signalRows.set(updatedRows)
}

const getSortedRowSignals = (rowId: string) => {
	const originalRow = $patternEditor.signalRows.state[rowId]
	return originalRow.signals.sort((a, b) => a.updatedTime - b.updatedTime)
}

const correctRowSignalsDivisions = (rowId: string) => {
	const sortedSignals = getSortedRowSignals(rowId)
	const row = $patternEditor.signalRows.state[rowId]

	// Initialize division map
	const divisionMap: (string | null)[] = new Array(256 * 4).fill(null)

	// Fill division map with signal IDs (newer signals overwrite older)
	for (const signal of sortedSignals) {
		const start = Math.max(0, signal.startDivision)
		const end = Math.min(divisionMap.length - 1, signal.endDivision)
		for (let i = start; i <= end; i++) {
			divisionMap[i] = signal.id
		}
	}

	// Detect contiguous ranges
	const ranges = new Map<string, Array<{ start: number; end: number }>>()
	let currentId = divisionMap[0]
	let currentStart = 0

	for (let i = 1; i < divisionMap.length; i++) {
		if (divisionMap[i] !== currentId) {
			if (currentId) {
				const currentRange = ranges.get(currentId) || []
				const newItem = { start: currentStart, end: i - 1 }
				ranges.set(currentId, [...currentRange, newItem])
			}

			currentId = divisionMap[i]
			currentStart = i
		}
	}

	if (currentId) {
		const currentRange = ranges.get(currentId) || []
		const newItem = { start: currentStart, end: divisionMap.length - 1 }
		ranges.set(currentId, [...currentRange, newItem])
	}

	// Generate new signals array
	const newSignals: typeof sortedSignals = []
	const handledIds = new Set<string>()

	for (const signal of sortedSignals) {
		if (!ranges.has(signal.id) || handledIds.has(signal.id)) continue

		const signalRanges = ranges.get(signal.id)!
		signalRanges.forEach((range, i) => {
			// Clone signal for each contiguous range
			const newSignal = {
				...signal,
				startDivision: range.start,
				endDivision: range.end,
				// Generate new ID for split signals (preserve original for first segment)
				id: i === 0 ? signal.id : crypto.randomUUID()
			}
			newSignals.push(newSignal)
		})

		handledIds.add(signal.id)
	}

	// Update state
	$patternEditor.signalRows.set.lookup(rowId, {
		...row,
		signals: newSignals
	})
}

export const $patternEditor = {
	beatsLength: $beatsLength,
	signalRows: $signalRows,
	cellWidth: $cellWidth,
	enabledSignalRowIds: $enabledSignalRowIds,
	selectedSignalData: $selectedSignalData,
	//actions
	reset,
	removeSignal,
	addSignal,
	useSignal,
	useSignalRow,
	getSignal,
	getSignalRow,
	updateSignal,
	moveSignal,
	disableSignalRow,
	enableSignalRow,
	correctRowSignalsDivisions
}
