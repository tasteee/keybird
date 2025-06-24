import { getEnabledRowIds, defaultEnabledIds, signalRowsMap } from '#/utilities/signalRows'
import { datass } from 'datass'
import store from 'store'

type SignalT = {
	id: string
	rowId: string
	startDivision: number
	endDivision: number
	updatedTime: number
	minVelocity: number
	maxVelocity: number
	isMuted: boolean
}

type RowT = {
	id: string
	label: string
	accessory: string
	color: string
	hint: string
	isEnabled: boolean
	index: number
	signalIds: string[]
}

const _signalMap = store.get('signalMap') || {}
const _rowMap = store.get('rowMap') || signalRowsMap
const _enabledSignalRowIds = store.get('enabledSignalRowIds') || defaultEnabledIds
const _selectedSignalId = store.get('selectedSignalId') || ''
const _beatsLength = store.get('beatsLength') || 32
const _cellWidth = store.get('cellWidth') || 20

const $signalMap = datass.object<Record<string, SignalT>>(_signalMap)
const $rowMap = datass.object<Record<string, RowT>>(_rowMap)
const $enabledSignalRowIds = datass.array<string>(_enabledSignalRowIds)
const $selectedSignalId = datass.string(_selectedSignalId)
const $beatsLength = datass.number(_beatsLength)
const $cellWidth = datass.number(_cellWidth)

const toggleRowSignalId = (rowId: string, signalId: string) => {
	const row = $rowMap.state[rowId]
	if (!row) return // Guard against missing row
	const hasSignal = row.signalIds.includes(signalId)
	const idFilter = (id: string) => id !== signalId
	const newSignals = hasSignal ? row.signalIds.filter(idFilter) : [...row.signalIds, signalId]
	const updatedRow = { ...row, signalIds: newSignals }
	$rowMap.set.lookup(rowId, updatedRow)
}

const addSignal = (signal: Partial<SignalT> & { rowId: string }) => {
	const updatedTime = Date.now()
	const id = signal.id || crypto.randomUUID()

	const finalSignal: SignalT = {
		isMuted: false,
		startDivision: 0,
		endDivision: 0,
		minVelocity: 65,
		maxVelocity: 90,
		...signal,
		updatedTime,
		id
	}

	$signalMap.set.lookup(id, finalSignal)
	toggleRowSignalId(signal.rowId, id)
}

const removeSignal = (signalId: string) => {
	const signal = $signalMap.state[signalId]
	if (!signal) return
	$signalMap.set.lookup(signalId, undefined)
	toggleRowSignalId(signal.rowId, signalId)
}

type MoveSignalParamsT = {
	id: string
	rowId: string
	startDivision?: number
	endDivision?: number
}

const moveSignal = (params: MoveSignalParamsT) => {
	const updatedTime = Date.now()
	const signal = { ...$signalMap.state[params.id] }
	const oldRowId = signal.rowId
	const newRowId = params.rowId
	const shouldMoveRows = oldRowId !== newRowId

	const updates: Partial<SignalT> = {
		id: params.id,
		rowId: newRowId,
		startDivision: params.startDivision ?? signal.startDivision,
		endDivision: params.endDivision ?? signal.endDivision,
		updatedTime
	}

	if (shouldMoveRows) {
		toggleRowSignalId(oldRowId, signal.id)
		toggleRowSignalId(newRowId, params.id)
	}

	updateSignal(updates)
}

const updateSignal = (updates: Partial<SignalT>) => {
	const id = updates.id
	const signal = $signalMap.state[id]
	if (!signal) return // Guard against missing signal

	const updatedSignal = {
		...signal,
		...updates,
		updatedTime: Date.now()
	}
	$signalMap.set.lookup(id, updatedSignal)
}

const toggleMuteSignal = (id: string) => {
	const signal = $signalMap.state[id]
	if (!signal) return
	updateSignal({ id, isMuted: !signal.isMuted })
}

const duplicateSignal = (signalId: string) => {
	const original = $signalMap.state[signalId]
	if (!original) return

	const newSignal: Partial<SignalT> = {
		...original,
		id: crypto.randomUUID(),
		updatedTime: Date.now()
	}
	addSignal(newSignal as SignalT)
}

const toggleRowEnabled = (rowId: string) => {
	const row = { ...$rowMap.state[rowId] }
	row.isEnabled = !row.isEnabled
	$rowMap.set.lookup(rowId, row)
	const enabledRowIds = getEnabledRowIds($rowMap.state)
	$enabledSignalRowIds.set(enabledRowIds)
}

const getSortedRowSignals = (rowId: string): SignalT[] => {
	const row = $rowMap.state[rowId]
	if (!row) return []
	const rowSignals = row.signalIds.map((id) => $signalMap.state[id]).filter(Boolean) as SignalT[]
	return rowSignals.sort((a, b) => a.updatedTime - b.updatedTime)
}

const correctSignalOverlaps = (rowId: string) => {
	const sortedSignals = getSortedRowSignals(rowId)
	const row = $rowMap.state[rowId]
	if (!row) return // Exit if row doesn't exist

	// IMPROVEMENT: Use a dynamic but capped division length. 4096 is a generous max (1024 bars at 4 divisions/beat).
	const MAX_DIVISIONS = 4096
	const divisionMap: (string | null)[] = new Array(MAX_DIVISIONS).fill(null)

	// Fill division map with signal IDs. Because signals are sorted by updatedTime,
	// newer signals will correctly overwrite older ones. This is the core of your "cutting" logic.
	for (const signal of sortedSignals) {
		// Ensure start/end are within bounds
		const start = Math.max(0, signal.startDivision)
		const end = Math.min(divisionMap.length - 1, signal.endDivision)
		for (let i = start; i < end; i++) {
			divisionMap[i] = signal.id
		}
	}

	// Detect contiguous ranges of the same signal ID from the map
	const ranges = new Map<string, Array<{ start: number; end: number }>>()
	let currentId: string | null = null
	let currentStart = 0

	for (let i = 0; i < divisionMap.length; i++) {
		if (divisionMap[i] !== currentId) {
			if (currentId) {
				const existingRanges = ranges.get(currentId) || []
				const newRange = { start: currentStart, end: i }
				ranges.set(currentId, [...existingRanges, newRange])
			}
			currentId = divisionMap[i]
			currentStart = i
		}
	}
	// Add the last detected range
	if (currentId) {
		const existingRanges = ranges.get(currentId) || []
		const newRange = { start: currentStart, end: divisionMap.length }
		ranges.set(currentId, [...existingRanges, newRange])
	}

	// --- BUG FIX: Correctly rebuild state from the calculated ranges ---

	const finalSignals: SignalT[] = []
	const originalSignalMap = new Map(sortedSignals.map((s) => [s.id, s]))

	// Iterate over the ranges to build the new, corrected signals
	for (const [signalId, signalRanges] of ranges.entries()) {
		const originalSignal = originalSignalMap.get(signalId)
		if (!originalSignal) continue // Should not happen, but a good safeguard

		signalRanges.forEach((range, index) => {
			// The first segment keeps the original signal ID.
			// Any subsequent segments (from a split) get a new ID.
			const isFirstSegment = index === 0
			const newSignal: SignalT = {
				...originalSignal,
				startDivision: range.start,
				endDivision: range.end,
				id: isFirstSegment ? originalSignal.id : crypto.randomUUID()
			}
			finalSignals.push(newSignal)
		})
	}

	// --- BUG FIX: Update the global state stores correctly ---

	// 1. Reconcile the global signal map
	const updatedGlobalSignalMap = { ...$signalMap.state }
	const finalSignalIds = new Set(finalSignals.map((s) => s.id))
	const originalSignalIds = new Set(sortedSignals.map((s) => s.id))

	// Delete signals that were completely overwritten
	for (const oldId of originalSignalIds) {
		if (!finalSignalIds.has(oldId)) {
			delete updatedGlobalSignalMap[oldId]
		}
	}

	// Add new (split) signals and update existing (trimmed) ones
	for (const finalSignal of finalSignals) {
		updatedGlobalSignalMap[finalSignal.id] = finalSignal
	}

	$signalMap.set(updatedGlobalSignalMap)

	// 2. Update the row's signalIds array to match the final state
	$rowMap.set.lookup(rowId, {
		...row,
		signalIds: Array.from(finalSignalIds)
	})
}

const resetEditor = () => {
	$signalMap.set({})
	$rowMap.set(signalRowsMap) // Reset to initial state, not empty
	$selectedSignalId.set.reset()
	$enabledSignalRowIds.set(defaultEnabledIds) // Reset to initial state
	$beatsLength.set.reset()
	$cellWidth.set.reset()
}

const getSignalRows = () => {
	const keys = Object.keys($rowMap.state)
	const rowsMap = {} as any

	for (const key of keys) {
		const original = $rowMap.state[key]
		const row = { ...original, signalIds: undefined } as any
		row.signals = getSortedRowSignals(row.id)
		rowsMap[key] = row
	}

	return rowsMap
}

const toJson = () => {
	const signalMap = store.set('signalMap', $signalMap.state)
	const rowMap = store.set('rowMap', $rowMap.state)
	const enabledSignalRowIds = store.set('enabledSignalRowIds', $enabledSignalRowIds.state)
	const selectedSignalId = store.set('selectedSignalId', $selectedSignalId.state)
	const beatsLength = store.set('beatsLength', $beatsLength.state)
	const cellWidth = store.set('cellWidth', $cellWidth.state)

	return {
		signalMap,
		rowMap,
		enabledSignalRowIds,
		selectedSignalId,
		beatsLength,
		cellWidth
	}
}

export const $patternEditor = {
	signalMap: $signalMap,
	rowMap: $rowMap,
	selectedSignalId: $selectedSignalId,
	beatsLength: $beatsLength,
	cellWidth: $cellWidth,
	enabledSignalRowIds: $enabledSignalRowIds,
	getSignalRows,
	toJson,

	addSignal,
	removeSignal,
	moveSignal,
	updateSignal,
	toggleMuteSignal,
	duplicateSignal,
	toggleRowEnabled,
	resetEditor,
	correctSignalOverlaps
}

globalThis.$patternEditor = $patternEditor

// import { datass } from 'datass'
// import { listerine } from 'listerine'

// const getEnabledSignalRowIds = () => {
// 	const array = Object.values($signalRows.state)
// 	const list = listerine(array)
// 	const enabledOnes = list.find({ isEnabled: true })
// 	return enabledOnes.map(({ id }) => id).reverse()
// }

// const DEFAULT_SELECTED_SIGNAL_DATA = { id: '', rowId: '' }
// const $selectedSignalData = datass.object<any>(DEFAULT_SELECTED_SIGNAL_DATA)
// const $signalRows = datass.object<SignalRowsT>(signalRowsMap)
// const $beatsLength = datass.number(32) // 32 beats long
// const $cellWidth = datass.number(20)
// const $enabledSignalRowIds = datass.array<string>(getEnabledSignalRowIds())

// $signalRows.watch(async () => {
// 	const enabledSignalRowIds = getEnabledSignalRowIds()
// 	$enabledSignalRowIds.set(enabledSignalRowIds)
// })

// const getSignalRow = (id: string) => {
// 	const currentRows = $patternEditor.signalRows.state
// 	const signalRow = currentRows[id]
// 	if (!signalRow) return null
// 	return signalRow
// }

// const disableSignalRow = (id: string) => {
// 	const currentRows = $patternEditor.signalRows.state
// 	const updatedRows = { ...currentRows }
// 	const updateRow = { ...currentRows[id] }
// 	updateRow.isEnabled = false
// 	updatedRows[id] = updateRow
// 	$patternEditor.signalRows.set(updatedRows)
// }

// const enableSignalRow = (id: string) => {
// 	const currentRows = $patternEditor.signalRows.state
// 	const updatedRows = { ...currentRows }
// 	const updateRow = { ...currentRows[id] }
// 	updateRow.isEnabled = true
// 	updatedRows[id] = updateRow
// 	$patternEditor.signalRows.set(updatedRows)
// }

// const getSignal = (params: { rowId: string; signalId: string }) => {
// 	const signalRow = getSignalRow(params.rowId)
// 	if (!signalRow) return null
// 	const finder = (signal: any) => signal.id === params.signalId
// 	return signalRow.signals.find(finder)
// }

// const removeSignal = (params: { rowId: string; signalId: string }) => {
// 	const filterer = (signal: any) => signal.id !== params.signalId

// 	$patternEditor.signalRows.set.by((draft) => {
// 		const row = draft[params.rowId]
// 		const signals = row.signals.filter(filterer)
// 		row.signals = signals
// 	})
// }

// const addSignal = async (params: { rowId: string; signal: any }) => {
// 	$patternEditor.signalRows.set.by((draft) => {
// 		const row = draft[params.rowId]
// 		const id = params.signal.id || crypto.randomUUID()
// 		const signal = { ...params.signal, id, updatedTime: Date.now() }
// 		row.signals.push(signal)
// 	})
// }

// const reset = () => {
// 	$patternEditor.selectedSignalData.set.reset()
// 	$patternEditor.beatsLength.set.reset()
// 	$patternEditor.signalRows.set.reset()
// 	$patternEditor.cellWidth.set.reset()
// }

// const useSignalRow = (rowId: string): SignalRowT => {
// 	return $patternEditor.signalRows.use.lookup(rowId)
// }

// const useSignal = (params: { rowId: string; signalId: string }) => {
// 	return $patternEditor.signalRows.use((state) => {
// 		const signalRow = state[params.rowId]
// 		const finder = (signal: any) => signal.id === params.signalId
// 		return signalRow.signals.find(finder)
// 	})
// }

// const getItemById = (target: any[], id: string) => {
// 	return target.find((item) => item.id === id)
// }

// const splitSignalFromSignals = (signalId: string, signals: SignalT[]) => {
// 	const target = { signal: null, signals: [] }

// 	const reducer = (final, signal) => {
// 		if (signal.id === signalId) final.signal = signal
// 		else final.signals.push(signal)
// 		return final
// 	}

// 	return signals.reduce(reducer, target)
// }

// const moveSignal = (params: {
// 	fromRowId: string
// 	toRowId: string
// 	signalId: string
// 	startDivision: number
// 	endDivision: number
// }) => {
// 	const currentRows = $patternEditor.signalRows.state
// 	const fromRow = currentRows[params.fromRowId]
// 	const toRow = currentRows[params.toRowId]
// 	const { signal, signals } = splitSignalFromSignals(params.signalId, fromRow.signals)
// 	if (!signal) return

// 	const updatedSignal = {
// 		...signal,
// 		rowId: params.toRowId,
// 		startDivision: params.startDivision,
// 		endDivision: params.endDivision,
// 		updatedTime: Date.now()
// 	}

// 	// Add signal to destination row
// 	const updatedToSignals = [...toRow.signals, updatedSignal]

// 	const updatedRows = {
// 		...currentRows,
// 		[params.fromRowId]: { ...fromRow, signals },
// 		[params.toRowId]: { ...toRow, signals: updatedToSignals }
// 	}

// 	$patternEditor.signalRows.set(updatedRows)
// 	correctRowSignalsDivisions(params.toRowId)
// }

// const updateSignal = (params: Partial<SignalT> & { rowId: string; signalId: string }) => {
// 	const { rowId, signalId, ...updates } = params
// 	const currentRows = $patternEditor.signalRows.state
// 	const signalRow = currentRows[rowId]
// 	if (!signalRow) return

// 	const { signal, signals } = splitSignalFromSignals(params.signalId, signalRow.signals)
// 	const updatedSignal = { ...signal, ...updates, updatedTime: Date.now() }
// 	const updatedSignals = [...signals, updatedSignal]
// 	const updatedRow = { ...signalRow, signals: updatedSignals }
// 	const updatedRows = { ...currentRows, [rowId]: updatedRow }
// 	$patternEditor.signalRows.set(updatedRows)
// }

// const getSortedRowSignals = (rowId: string) => {
// 	const originalRow = $patternEditor.signalRows.state[rowId]
// 	return originalRow.signals.sort((a, b) => a.updatedTime - b.updatedTime)
// }

// const duplicateSignal = (params: { rowId: string; signalId: string }) => {
// 	const signalRow = getSignalRow(params.rowId)
// 	if (!signalRow) return
// 	const signal = getSignal(params)
// 	if (!signal) return

// 	// Create a new signal with the same properties but a new ID
// 	const newSignal = { ...signal, id: crypto.randomUUID(), updatedTime: Date.now() }
// 	const updatedSignals = [...signalRow.signals, newSignal]
// 	const updatedRow = { ...signalRow, signals: updatedSignals }
// 	$patternEditor.signalRows.set.lookup(params.rowId, updatedRow)
// }

// const toggleMuteSignal = (params: { rowId: string; signalId: string }) => {
// 	const signalRow = getSignalRow(params.rowId)
// 	if (!signalRow) return
// 	const signal = getSignal(params)
// 	if (!signal) return
// 	const updatedSignal = { ...signal, isMuted: !signal.isMuted }
// 	const updatedSignals = signalRow.signals.map((sig) => (sig.id === params.signalId ? updatedSignal : sig))
// 	const updatedRow = { ...signalRow, signals: updatedSignals }
// 	$patternEditor.signalRows.set.lookup(params.rowId, updatedRow)
// }

// export const $patternEditor = {
// 	beatsLength: $beatsLength,
// 	signalRows: $signalRows,
// 	cellWidth: $cellWidth,
// 	enabledSignalRowIds: $enabledSignalRowIds,
// 	selectedSignalData: $selectedSignalData,
// 	toggleMuteSignal,
// 	duplicateSignal,
// 	//actions
// 	reset,
// 	removeSignal,
// 	addSignal,
// 	useSignal,
// 	useSignalRow,
// 	getSignal,
// 	getSignalRow,
// 	updateSignal,
// 	moveSignal,
// 	disableSignalRow,
// 	enableSignalRow,
// 	correctRowSignalsDivisions
// }

// $selectedSignalData.watch(() => {
// 	// console.log('Selected signal data changed:', $selectedSignalData.state)
// })
