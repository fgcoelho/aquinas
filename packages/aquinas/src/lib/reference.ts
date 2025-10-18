class Reference<T> {
	id: symbol;
	__type: T;

	toJSON: () => string;

	constructor(public readonly name: string) {
		this.id = Symbol.for(name);
		this.toJSON = () => name;
	}
}

function derivedReference<T>(base: string, ref: Reference<any>) {
	return new Reference<T>(`${base}:${ref.toJSON()}`);
}

function reference<T>(name: string): Reference<T> {
	return new Reference<T>(name);
}

function isReference(obj: any): obj is Reference<any> {
	return obj instanceof Reference;
}

export { Reference, reference, derivedReference, isReference };
