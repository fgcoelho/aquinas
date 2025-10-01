import { Container, ContainerModule } from "inversify";
import type { Reference } from "./reference";

type Bindable<T> = {
	reference: Reference<T>;
	factory: (dock: Dock) => T;
};

interface Dock {
	referenceRegistry: Set<Reference<any>>;
	bindingRegistry: Map<Reference<any>, (dock: Dock) => any>;

	merge(...sources: Dock[]): void;
	register(...bindables: Bindable<any>[]): void;
	overwrite(...bindables: Bindable<any>[]): void;

	getContainer(): Container;
	get<U>(reference: Reference<U>): U;
	get<T extends Record<string, Reference<any>>>(
		reference: T,
	): { [K in keyof T]: T[K] extends Reference<infer V> ? V : never };

	safeGet<U>(reference: Reference<U>): U | undefined;
}

function dock(): Dock {
	const container = new Container();
	const referenceRegistry: Set<Reference<any>> = new Set();
	const bindingRegistry = new Map<Reference<any>, (dock: Dock) => any>();

	function bind<T>(reference: Reference<T>) {
		const binding = container.bind<T>(reference.id);

		if (typeof reference.id === "symbol") {
			referenceRegistry.add(reference);
		}

		return binding;
	}

	function get<U>(reference: Reference<U>): U;
	function get<T extends Record<string, Reference<any>>>(
		reference: T,
	): { [K in keyof T]: T[K] extends Reference<infer V> ? V : never };
	function get(reference: any): any {
		if ("id" in reference) {
			return container.get(reference.id);
		}

		const result: Record<string, any> = {};
		for (const key in reference) {
			result[key] = container.get(reference[key].id);
		}
		return result;
	}

	const dock: Dock = {
		referenceRegistry,
		bindingRegistry,

		merge(...sources: Dock[]) {
			const modules: ContainerModule[] = sources.map(
				(source) =>
					new ContainerModule(({ bind }) => {
						for (const reference of source.referenceRegistry) {
							const factory =
								source.bindingRegistry.get(reference);
							if (!factory)
								throw new Error("Missing factory during merge");

							referenceRegistry.add(reference);
							bindingRegistry.set(reference, factory);

							bind(reference.id)
								.toDynamicValue(() => factory(dock))
								.inSingletonScope();
						}
					}),
			);

			container.loadSync(...modules);
		},

		register(...bindables) {
			for (const bindable of bindables) {
				referenceRegistry.add(bindable.reference);
				bindingRegistry.set(bindable.reference, bindable.factory);

				bind(bindable.reference)
					.toDynamicValue(() => bindable.factory(dock))
					.inSingletonScope();
			}
		},

		overwrite(...bindables) {
			for (const bindable of bindables) {
				if (container.isBound(bindable.reference.id)) {
					container.unbind(bindable.reference.id);
				}
				referenceRegistry.add(bindable.reference);
				bindingRegistry.set(bindable.reference, bindable.factory);

				bind(bindable.reference)
					.toDynamicValue(() => bindable.factory(dock))
					.inSingletonScope();
			}
		},

		getContainer() {
			return container;
		},

		get,

		safeGet(reference) {
			try {
				return get(reference);
			} catch {
				return undefined;
			}
		},
	};

	return dock;
}

export { dock, type Dock };
