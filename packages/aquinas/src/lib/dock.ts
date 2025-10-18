import { Container } from "@owja/ioc";
import { sanitizeErrorMessage } from "../utils/sanitize-error";
import { AquinasError } from "./error";
import { type Injectable, isInjectable } from "./injectable";
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
				`failed to bind reference with name "${reference.name}" - ${sanitizeErrorMessage(error)}`,
			);
		}
	}

	merge(...sources: Dock[]): void {
		for (const source of sources) {
			if (!isDock(source)) {
				throw new AquinasError(
					`Invalid dock: expected a Dock object but got ${typeof source}`,
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

	register(...bindables: Injectable[]): void {
		for (const bindable of bindables) {
			if (!isInjectable(bindable)) {
				throw new AquinasError(
					`Invalid injectable: expected an Injectable object but got ${typeof bindable}`,
				);
			}

			this.bindReference(bindable.reference, bindable.implementation);
		}
	}

	override(
		reference: Reference<any>,
		injectableOrImplementation: Injectable | ((dock: Dock) => any),
	): void {
		if (
			!isInjectable(injectableOrImplementation) &&
			typeof injectableOrImplementation !== "function"
		) {
			throw new AquinasError(
				`Invalid override: expected an Injectable or implementation function but got ${typeof injectableOrImplementation}`,
			);
		}

		if (isInjectable(injectableOrImplementation)) {
			this.override(reference, injectableOrImplementation.implementation);
		} else {
			this.bindReference(reference, injectableOrImplementation, {
				rebind: true,
			});
		}
	}

	delete<T>(reference: Reference<T>): void {
		if (!isReference(reference)) {
			throw new AquinasError(
				`Invalid reference: Expected a Reference object but got ${typeof reference}`,
			);
		}

		this.referenceRegistry.delete(reference);
		this.bindingRegistry.delete(reference);
		this.container.remove(reference.id);
	}

	get<T>(reference: Reference<T> | Record<string, Reference<any>>): any {
		if ("id" in reference) {
			if (!isReference(reference)) {
				throw new AquinasError(
					`Invalid reference: Expected a Reference object but got ${typeof reference}`,
				);
			}

			try {
				return this.container.get(reference.id);
			} catch (error) {
				throw new AquinasError(
					`Failed to get reference with name "${String(
						reference.name,
					)}": ${sanitizeErrorMessage(error)}`,
				);
			}
		}

		const result: Record<string, any> = {};
		for (const key in reference) {
			const ref = reference[key];
			if (!isReference(ref)) {
				throw new AquinasError(
					`Invalid reference for key "${key}": Expected a Reference object but got ${typeof ref}`,
				);
			}

			result[key] = this.container.get(ref.id);
		}
		return result;
	}

	safeGet<T>(reference: Reference<T>): T | undefined {
		if (!isReference(reference)) {
			throw new AquinasError(
				`Invalid reference: Expected a Reference object but got ${typeof reference}`,
			);
		}

		try {
			return this.container.get(reference.id);
		} catch {
			return undefined;
		}
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
