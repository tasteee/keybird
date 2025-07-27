import { TONE_ROWS } from '#/constants/state/toneRows'
import { arrays } from '#/modules/arrays'
import { createSignal } from '#/modules/creators'
import { just } from '#/modules/just'
import { observable, action, computed } from 'mobx'
import { $output } from './output/$output'

type PartialSignalT = Partial<SignalT> & { id: string }

class PatternStore {
	@observable accessor id = ''
	@observable accessor title = ''
	@observable accessor description = ''
	@observable accessor tags: string[] = []
	@observable accessor length = 16
	@observable accessor strategy = 'cycling'
	@observable accessor octave = 0
	@observable accessor tool = 'paint'
	@observable accessor signalMap: SignalMapT = {}
	@observable accessor toneMap: ToneMapT = TONE_ROWS
	@observable accessor selectedSignalIds: string[] = []

	private toneIndexSort = (a: ToneT, b: ToneT) => a.index - b.index

	@computed get signalIds() {
		const list = Object.values(this.signalMap) as SignalT[]
		return list.map((signal: SignalT) => signal.id)
	}

	@computed get activeTones() {
		const list = Object.values(this.toneMap) as ToneT[]
		const filter = (tone: ToneT) => tone.octave === this.octave
		return list.filter(filter).sort(this.toneIndexSort)
	}

	@computed get selectedSignals() {
		const ids = this.selectedSignalIds
		const map = this.signalMap
		const signals = ids.map((id) => map[id]).filter(Boolean) as SignalT[]
		return signals
	}

	@computed get activeToneIds() {
		const getId = (tone: ToneT) => tone.id
		const sorted = this.activeTones.sort(this.toneIndexSort)
		const ids = sorted.map(getId)
		return ids
	}

	@action setTool = (tool: string) => {
		this.tool = tool
	}

	@action goUpOctave = () => {
		this.octave += 1
	}

	@action goDownOctave = () => {
		this.octave -= 1
	}

	getSignal = (id: string): SignalT => {
		return this.signalMap[id]
	}

	getActiveToneWithIndex = (index: number): ToneT => {
		return this.activeTones.find((tone) => tone.index === index) as ToneT
	}

	@action addSignal = (overrides: Partial<SignalT>): SignalT => {
		const id = overrides.id || (crypto.randomUUID() as string)
		const signal = createSignal({ ...overrides, id })
		this.signalMap[id] = signal
		return signal
	}

	@action toggleToneSignalId = (toneId: string, signalId: string) => {
		const tone = this.toneMap[toneId] as ToneT
		const hasSignal = tone.signalIds.includes(signalId)
		const signalIndex = tone.signalIds.indexOf(signalId)
		if (!hasSignal) return tone.signalIds.push(signalId)
		tone.signalIds = arrays.removeIndex(tone.signalIds, signalIndex)
	}

	@action eraseSignal = (id: string): void => {
		const signal = this.getSignal(id)
		const toneId = signal.toneId
		delete this.signalMap[id]
		this.toggleToneSignalId(toneId, id)
	}

	@action eraseSignals = (ids: string[]): void => {
		ids.forEach((id) => this.eraseSignal(id))
	}

	updateSignal = just.debounce(5, (overrides: PartialSignalT): SignalT | null => {
		const signal = this.getSignal(overrides.id)
		const toneId = overrides.toneId ?? signal.toneId
		const didChangeTone = toneId !== signal.toneId
		if (didChangeTone) this.toggleToneSignalId(signal.toneId, overrides.id)
		if (didChangeTone) this.toggleToneSignalId(toneId, overrides.id)
		Object.assign(signal, overrides)
		return signal
	})

	@action clearSelectedSignalIds = (): void => {
		this.selectedSignalIds = []
	}

	@action setSelectedSignalIds = (target: string | string[]): void => {
		const isArray = Array.isArray(target)
		const ids = isArray ? target : [target]
		console.log('setting selected ids', target, ids)
		this.selectedSignalIds = ids
	}

	@action addSelectedSignalIds = (target: string | string[]): void => {
		const isArray = Array.isArray(target)
		const ids = isArray ? target : [target]
		const newIds = [...this.selectedSignalIds, ...ids]
		console.log('adding selected id', target, newIds)
		this.selectedSignalIds = arrays.unique(newIds)
	}

	@action removeSelectedSignalIds = (target: string | string[]): void => {
		const isArray = Array.isArray(target)
		const ids = isArray ? target : [target]
		const newIds = this.selectedSignalIds.filter((id) => !ids.includes(id))
		this.selectedSignalIds = newIds
	}

	getNthTone = (n: number): ToneT => {
		const list = Object.values(this.activeTones) as ToneT[]
		return list[n]
	}

	getToneByTotalIndex = (totalIndex: number): ToneT => {
		const list = Object.values(this.toneMap) as ToneT[]
		return list.find((tone) => tone.totalIndex === totalIndex) as ToneT
	}
}

export const $pattern = new PatternStore()
