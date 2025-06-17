import useKeyboardShortcut from 'use-keyboard-shortcut'

const keyboardShortcutOptions = {
	overrideSystem: false,
	ignoreInputFields: true,
	repeatOnHold: false
}

export const useHotkeys = (keys: any, handler: any) => {
	return useKeyboardShortcut(keys, handler, keyboardShortcutOptions)
}
