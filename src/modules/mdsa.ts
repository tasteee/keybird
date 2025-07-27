// "make direct set action"
// "direct set action"
// mdsa return a function that accepts a key
// and returns a function. when invoked, that
// function (it accepts 1 argument of the type
// specified) will appky the one argument to
// the key of the store returned by the function
// passed into mdsa. So every time a dsa function
// (the function returned from it) is called,
// it will call the function to get the store,
// then directly set the key on that store.

type AnyNoopT = () => any
type ArgNoopT = (value: any) => any
type ArgsNoopT = (...args: any[]) => any

// Automated direct setters on the target.
// const dsa = mdsa(() => $myStore)
// const setName = dsa<string>('name')
// const setDescription = dsa<string>('description')

export const mdsa = <FuncT extends ArgsNoopT>(getStore: AnyNoopT, hof?: FuncT) => {
	const isHofFunction = typeof hof === 'function'
	const wrapper = isHofFunction ? hof : (value: any) => value

	return <T>(key: string): ((value: T) => void) => {
		return wrapper((value: T) => {
			const store = getStore()
			store[key] = value
		})
	}
}

// const dsa = mdsa(() => $myStore)
//
// class Foo {
// 	name = ''
// 	description = ''
//  @action setName = dsa<string>('name')
//  @action setDescription = dsa<string>('description')
// }

// const dsa = mdsa(() => $project)
// @action setName = dsa('name')
