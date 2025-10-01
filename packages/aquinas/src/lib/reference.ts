interface Reference<T> {
	id: symbol;
	name: string;
	__INJECTION_REFERENCE_FLAG: boolean;
	__type: T;
	toJSON: () => string;
}

const reference = <T>(name: string): Reference<T> => {
	const id = Symbol.for(name);
	const __INJECTION_REFERENCE_FLAG = true;
	const __type = null as T;
	const toJSON = () => name;

	return {
		id,
		name,
		__INJECTION_REFERENCE_FLAG,
		__type,
		toJSON,
	};
};

function derivedReference<T>(base: string, ref: Reference<any>) {
	return reference<T>(`${base}:${ref.toJSON()}`);
}

export { type Reference, reference, derivedReference };
