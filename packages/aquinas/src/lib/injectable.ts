import { dock as createDock, type Dock } from "./dock";
import { Reference } from "./reference";

type RefMap = Record<string, Reference<any>>;
type ResolveRefs<T extends RefMap> = {
	[K in keyof T]: T[K] extends Reference<infer U> ? U : never;
};

class Injectable<T> {
	reference: Reference<T>;
	implementation: (dock: Dock) => T;

	constructor(reference: Reference<T>, implementation: (dock: Dock) => T) {
		this.reference = reference;
		this.implementation = implementation;
	}
}

class InjectableBuilder<T, Refs = {}, State = {}> {
	constructor(
		private reference: Reference<T>,
		private refs: RefMap = {},
		private stateFactory?: (deps: any) => any,
	) {}

	deps<NewRefs extends RefMap>(
		newRefs: NewRefs,
	): InjectableBuilder<T, Refs & ResolveRefs<NewRefs>, State> {
		return new InjectableBuilder(
			this.reference,
			{ ...this.refs, ...newRefs },
			this.stateFactory,
		);
	}

	init<NewState>(
		factory: (refs: Refs) => NewState,
	): InjectableBuilder<T, Refs, NewState> {
		return new InjectableBuilder(this.reference, this.refs, factory);
	}

	implements(
		factory: (context: Refs & State & { ctx: Dock }) => T,
	): Injectable<T> {
		const createContext = (dock?: Dock, deps: any = {}) => ({
			...deps,
			...(this.stateFactory ? this.stateFactory(deps) : {}),
			ctx: dock ?? createDock(),
		});

		const implementation = (dock: Dock) => {
			const deps = dock.get(this.refs);

			return factory(createContext(dock, deps));
		};

		return new Injectable(this.reference, implementation);
	}
}

function injectable<T>(reference: Reference<T>): InjectableBuilder<T> {
	return new InjectableBuilder(reference);
}

function isInjectable(obj: any): obj is Injectable<any> {
	return obj instanceof Injectable;
}

function isInjectableLike(
	obj: any,
): obj is { reference: Reference<any>; implementation: Function } {
	return (
		obj &&
		obj.reference instanceof Reference &&
		typeof obj.implementation === "function"
	);
}

export { Injectable, injectable, isInjectableLike, isInjectable };
