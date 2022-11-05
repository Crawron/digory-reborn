type Falsy = false | "" | 0 | null | undefined

/** Last array element */
export const last = <T>(arr: T[], offset = 1) => arr[arr.length - offset]

/** Random array element */
export const arrRand = <T>(arr: T[]) =>
	arr[Math.floor(Math.random() * arr.length)]

/** Returns true and type guards if the value is truthy */
export function isTruthy<T>(value: T | Falsy): value is T {
	return !!value
}

/** Prints `thing` then returns it */
export function probe<T>(thing: T): T {
	console.log(thing)
	return thing
}
