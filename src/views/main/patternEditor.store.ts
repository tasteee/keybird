import { SIGNAL_ROWS } from '#/modules/patterns/signalRows'
import { datass } from 'datass'

const getEnabledSignalRowIds = () => {
	return Object.entries($signalRows.state)
		.filter(([_, row]) => row.isEnabled)
		.map(([id, _]) => id)
}

const $selectedSignalData = datass.object<any>({
	id: '',
	rowId: '',
	isTemporaryMove: false,
	originalPosition: null,
	overlappingSignals: [],
	temporarySignalModifications: [] // Store temporary modifications to signals
})

const $activeTool = datass.string('add') // Default tool is 'add'
const $beatsLength = datass.number(32)
const $signalRows = datass.object<SignalRowsT>(SIGNAL_ROWS)
const $cellWidth = datass.number(20)
const $enabledSignalRowIds = datass.array<string>(getEnabledSignalRowIds())

$signalRows.watch(() => {
	const enabledSignalRowIds = getEnabledSignalRowIds()
	$enabledSignalRowIds.set(enabledSignalRowIds)
})

const getSignalRow = (params: { signalRowId: string }) => {
	const currentRows = $patternEditor.signalRows.state
	const signalRow = currentRows[params.signalRowId]
	if (!signalRow) return null
	return signalRow
}

const disableSignalRow = (params: { signalRowId: string }) => {
	const currentRows = $patternEditor.signalRows.state
	const updatedRows = { ...currentRows }
	const updateRow = { ...currentRows[params.signalRowId] }
	updateRow.isEnabled = false
	updatedRows[params.signalRowId] = updateRow
	$patternEditor.signalRows.set(updatedRows)
}

const enableSignalRow = (params: { signalRowId: string }) => {
	const currentRows = $patternEditor.signalRows.state
	const updatedRows = { ...currentRows }
	const updateRow = { ...currentRows[params.signalRowId] }
	updateRow.isEnabled = true
	updatedRows[params.signalRowId] = updateRow
	$patternEditor.signalRows.set(updatedRows)
}

const getSignal = (params: { noteId: string; signalId: string }) => {
	const signalRow = getSignalRow({ signalRowId: params.noteId })
	if (!signalRow) return null
	const finder = (signal: any) => signal.id === params.signalId
	return signalRow.signals.find(finder)
}

const checkSignalOverlap = (params: {
	rowId: string
	startDivision: number
	endDivision: number
	excludeSignalId?: string
}) => {
	const signalRow = getSignalRow({ signalRowId: params.rowId })
	if (!signalRow) return { fullOverlaps: [], partialOverlaps: [] }

	const fullOverlaps = []
	const partialOverlaps = []

	signalRow.signals.forEach((signal) => {
		if (params.excludeSignalId && signal.id === params.excludeSignalId) return

		const signalStart = signal.startDivision
		const signalEnd = signal.endDivision
		const newStart = params.startDivision
		const newEnd = params.endDivision

		// Check if signals overlap
		const hasOverlap = !(signalEnd <= newStart || signalStart >= newEnd)
		if (!hasOverlap) return

		// Check if signal is completely covered by the new signal
		const isFullyCovered = signalStart >= newStart && signalEnd <= newEnd
		if (isFullyCovered) {
			fullOverlaps.push(signal)
		} else {
			// Calculate what parts need to be cut
			const cutFromStart = signalStart < newStart && signalEnd > newStart
			const cutFromEnd = signalStart < newEnd && signalEnd > newEnd

			let newSignalStart = signalStart
			let newSignalEnd = signalEnd

			if (cutFromStart) {
				newSignalEnd = newStart
			}
			if (cutFromEnd) {
				newSignalStart = newEnd
			}

			// If the signal would be completely removed by cutting, treat as full overlap
			if (newSignalStart >= newSignalEnd) {
				fullOverlaps.push(signal)
			} else {
				partialOverlaps.push({
					original: signal,
					newStart: newSignalStart,
					newEnd: newSignalEnd,
					cutFromStart,
					cutFromEnd
				})
			}
		}
	})

	return { fullOverlaps, partialOverlaps }
}

const removeSignal = (params: { rowId: string; signalId: string }) => {
	const currentRows = $patternEditor.signalRows.state
	const filterer = (signal: any) => signal.id !== params.signalId
	const updatedRows = { ...currentRows }
	const updateRow = currentRows[params.rowId]
	const rowSingals = updateRow.signals
	const updatedRowSignals = rowSingals.filter(filterer)
	updatedRows[params.rowId].signals = updatedRowSignals
	$patternEditor.signalRows.set(updatedRows)
}

const addSignal = (params: { signalRowId: string; signal: any }) => {
	const currentRows = $patternEditor.signalRows.state
	const updatedRows = { ...currentRows }
	const updateRow = { ...currentRows[params.signalRowId] }
	const rowSingals = updateRow.signals
	const updatedRowSignals = [...rowSingals, params.signal]
	updatedRows[params.signalRowId].signals = updatedRowSignals
	$patternEditor.signalRows.set(updatedRows)
}

const addSignalRow = () => {
	const currentRows = $patternEditor.signalRows.state
	const newRowId = String(Object.keys(currentRows).length)

	$patternEditor.signalRows.set.lookup(newRowId, {
		id: newRowId,
		label: `Note ${newRowId}`,
		signals: [],
		accessory: '',
		color: 'white',
		hint: `Note ${newRowId}`,
		isEnabled: true
	})
}

const reset = () => {
	$patternEditor.signalRows.set.reset()
	$patternEditor.cellWidth.set.reset()
}

const useSignalRow = (signalRowId: string): SignalRowT => {
	return $patternEditor.signalRows.use.lookup(signalRowId)
}

const useSignal = (params: { signalRowId: string; signalId: string }) => {
	return $patternEditor.signalRows.use((state) => {
		const signalRow = state[params.signalRowId]
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
		endDivision: params.endDivision
	}

	// Add signal to destination row
	const updatedToSignals = [...toRow.signals, updatedSignal]

	const updatedRows = {
		...currentRows,
		[params.fromRowId]: { ...fromRow, signals },
		[params.toRowId]: { ...toRow, signals: updatedToSignals }
	}

	$patternEditor.signalRows.set(updatedRows)
}

const updateSignal = (params: Partial<SignalT> & { rowId: string; signalId: string }) => {
	const { rowId, signalId, ...updates } = params
	const currentRows = $patternEditor.signalRows.state
	const signalRow = currentRows[rowId]
	if (!signalRow) return

	const updatedSignals = signalRow.signals.map((signal) => (signal.id === signalId ? { ...signal, ...updates } : signal))
	const updatedRow = { ...signalRow, signals: updatedSignals }
	const updatedRows = { ...currentRows, [rowId]: updatedRow }
	$patternEditor.signalRows.set(updatedRows)
}

export const $patternEditor = {
	activeTool: $activeTool,
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
	enableSignalRow
}
