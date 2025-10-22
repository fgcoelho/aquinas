import { Container } from "@owja/ioc";
import { AquinasError } from "./error";
import {
	type Injectable,
	type InjectableImplementation,
	isInjectable,
} from "./injectable";
import type { Reference } from "./reference";
import { isReference } from "./reference";

class Dock {
	private referenceRegistry: Set<Reference<any>>;
	private bindingRegistry: Map<Reference<any>, (dock: Dock) => any>;
	private container: Container;

	constructor() {
		this.container = new Container();
		this.referenceRegistry = new Set();
		this.bindingRegistry = new Map();
	}

	private bindReference<T>(
		reference: Reference<T>,
		implementation: (dock: Dock) => T,
		opts?: {
			rebind?: boolean;
		},
	) {
		this.referenceRegistry.add(reference);
		this.bindingRegistry.set(reference, implementation);

		try {
			if (opts?.rebind) {
				this.container
					.rebind<any>(reference.id)
					.toFactory(() => implementation(this))
					.inSingletonScope();
			} else {
				this.container
					.bind<any>(reference.id)
					.toFactory(() => implementation(this))
					.inSingletonScope();
			}
		} catch (error) {
			throw new AquinasError(
				`failed to bind reference with name "${reference.name}"`,
				error,
			);
		}
	}

	merge(...sources: Dock[]): void {
		for (const source of sources) {
			if (!isDock(source)) {
				throw new AquinasError(
					`Invalid dock`,
					`expected a Dock object but got ${typeof source}`,
				);
			}

			for (const ref of source.referenceRegistry) {
				const implementation = source.bindingRegistry.get(ref);

				if (!implementation) {
					throw new AquinasError(
						"Missing implementation during merge",
					);
				}

				this.bindReference(ref, implementation);
			}
		}
	}

	add(...bindables: Injectable[]): void {
		for (const bindable of bindables) {
			if (!isInjectable(bindable)) {
				throw new AquinasError(
					`Invalid injectable`,
					`expected an Injectable object but got ${typeof bindable}`,
				);
			}

			this.bindReference(bindable.reference, bindable.implementation);
		}
	}

	update(
		reference: Reference<any>,
		injectableOrImplementation: Injectable | InjectableImplementation<any>,
	): void {
		if (
			!isInjectable(injectableOrImplementation) &&
			typeof injectableOrImplementation !== "function"
		) {
			throw new AquinasError(
				`Invalid update`,
				`expected an Injectable or implementation function but got ${typeof injectableOrImplementation}`,
			);
		}

		if (isInjectable(injectableOrImplementation)) {
			this.update(reference, injectableOrImplementation.implementation);
		} else {
			this.bindReference(reference, injectableOrImplementation, {
				rebind: true,
			});
		}
	}

	delete<T>(reference: Reference<T>): void {
		if (!isReference(reference)) {
			throw new AquinasError(
				`Invalid reference`,
				`expected a Reference object but got ${typeof reference}`,
			);
		}

		this.referenceRegistry.delete(reference);
		this.bindingRegistry.delete(reference);
		this.container.remove(reference.id);
	}

	get<U>(reference: Reference<U>): U;
	get<T extends Record<string, Reference<any>>>(
		reference: T,
	): { [K in keyof T]: T[K] extends Reference<infer V> ? V : never };
	get<T extends readonly Reference<any>[]>(
		...references: T
	): { [K in keyof T]: T[K] extends Reference<infer V> ? V : never };

	get(...args: any[]): any {
		if (args.length > 1) {
			const result: any[] = [];
			for (const reference of args) {
				if (!isReference(reference)) {
					throw new AquinasError(
						`Invalid reference`,
						`expected a Reference object but got ${typeof reference}`,
					);
				}

				try {
					result.push(this.container.get(reference.id));
				} catch (error) {
					throw new AquinasError(
						`Failed to get reference with name "${reference.name}"`,
						error,
					);
				}
			}
			return result;
		}

		const reference = args[0];
		if ("id" in reference) {
			if (!isReference(reference)) {
				throw new AquinasError(
					`Invalid reference`,
					`expected a Reference object but got ${typeof reference}`,
				);
			}

			try {
				return this.container.get(reference.id);
			} catch (error) {
				throw new AquinasError(
					`Failed to get reference with name "${reference.name}"`,
					error,
				);
			}
		}

		const result: Record<string, any> = {};
		for (const key in reference) {
			const ref = reference[key];

			if (!isReference(ref)) {
				throw new AquinasError(
					`Invalid reference for key "${key}"`,
					`expected a Reference object but got ${typeof ref}`,
				);
			}

			result[key] = this.container.get(ref.id);
		}

		return result;
	}

	safeGet<T>(reference: Reference<T>): T | undefined {
		if (!isReference(reference)) {
			throw new AquinasError(
				`Invalid reference`,
				`expected a Reference object but got ${typeof reference}`,
			);
		}

		try {
			return this.container.get(reference.id);
		} catch {
			return undefined;
		}
	}

	find<T>(predicate: (reference: Reference<T>) => boolean): T[];
	find(predicate: (reference: Reference<any>) => boolean): any[] {
		const matchingValues: any[] = [];

		for (const reference of this.referenceRegistry) {
			try {
				if (predicate(reference)) {
					const value = this.container.get(reference.id);

					matchingValues.push(value);
				}
			} catch {}
		}

		return matchingValues;
	}
}

function dock(): Dock {
	return new Dock();
}

function cloneDock(source: Dock): Dock {
	const newDock = new Dock();
	newDock.merge(source);
	return newDock;
}

function isDock(obj: any): obj is Dock {
	return obj instanceof Dock;
}

export { Dock, dock, cloneDock, isDock };
