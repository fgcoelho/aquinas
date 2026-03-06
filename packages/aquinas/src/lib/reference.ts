class Reference<T, N extends string = string> {
	id: symbol;
	__type: T;

	toJSON: () => string;

	constructor(readonly name: N) {
		this.id = Symbol.for(name);
		this.toJSON = () => name;
	}

	type<U>(): Reference<U, N> {
		return new Reference<U, N>(this.name);
	}
}

interface ReferenceFn {
	<T>(name: string): Reference<T>;
	create<const N extends string>(name: N): Reference<unknown, N>;
}

const reference: ReferenceFn = (<T>(name: string): Reference<T> =>
	new Reference<T>(name)) as ReferenceFn;

reference.create = <const N extends string>(name: N): Reference<unknown, N> =>
	new Reference<unknown, N>(name);

function isReference(obj: any): obj is Reference<any> {
	return obj instanceof Reference;
}

export { Reference, reference, isReference };
