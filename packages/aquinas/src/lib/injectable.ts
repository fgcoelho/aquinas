import { dock as createDock, type Dock } from "./dock";
import type { Reference } from "./reference";
import { resolveReferences } from "./resolve-references";

type BaseObject = {};

type InjectableObjectFactory<
	Refs extends BaseObject,
	Type,
	State extends BaseObject,
> = (context: Refs & State) => Type;

interface ContextHelper {
	get<T>(ref: Reference<T>): T;
	safeGet<T>(ref: Reference<T>): T | undefined;
	dock: Dock;
}

interface InjectableBuilder<
	ResolvedRefs extends BaseObject,
	Type,
	State extends BaseObject,
> {
	deps<
		NewDepsConfig extends Record<string, Reference<any>>,
		NewlyResolvedRefs extends {
			[K in keyof NewDepsConfig]: NewDepsConfig[K] extends Reference<
				infer R
			>
				? R
				: never;
		},
	>(
		references: NewDepsConfig,
	): InjectableBuilder<ResolvedRefs & NewlyResolvedRefs, Type, State>;

	init<NewState extends BaseObject>(
		initFactory: (refs: ResolvedRefs) => NewState,
	): InjectableBuilder<ResolvedRefs, Type, NewState>;

	implements(
		factory: InjectableObjectFactory<
			ResolvedRefs & { ctx: ContextHelper },
			Type,
			State
		>,
	): Injectable<ResolvedRefs, Type>;
}

interface Injectable<ResolvedRefs extends BaseObject, Type> {
	reference: Reference<Type>;
	factory: (dock: Dock) => Type;
	instantiate: (deps?: ResolvedRefs) => Type;
}

function createContextHelper(dock?: Dock): ContextHelper {
	if (!dock) {
		return {
			get: () => {
				throw new Error("Dock not available in this context");
			},
			safeGet: () => {
				throw new Error("Dock not available in this context");
			},
			dock: createDock(),
		};
	}

	return {
		get: <T>(ref: Reference<T>) => dock.get<T>(ref),
		safeGet: <T>(ref: Reference<T>) => {
			try {
				return dock.get<T>(ref);
			} catch {
				return undefined;
			}
		},
		dock,
	};
}

function injectable<Type>(
	reference: Reference<Type>,
): InjectableBuilder<BaseObject, Type, BaseObject> {
	const references: Record<string, Reference<unknown>> = {};
	let initStateFactory: ((refs: any) => any) | undefined;

	function createBuilder<
		CurResolvedRefs extends BaseObject,
		CurState extends BaseObject,
	>(): InjectableBuilder<CurResolvedRefs, Type, CurState> {
		return {
			deps: <
				NewDepsConfig extends Record<string, Reference<any>>,
				NewlyResolvedRefs extends {
					[K in keyof NewDepsConfig]: NewDepsConfig[K] extends Reference<
						infer R
					>
						? R
						: never;
				},
			>(
				newRefs: NewDepsConfig,
			) => {
				Object.assign(references, newRefs);
				return createBuilder<
					CurResolvedRefs & NewlyResolvedRefs,
					CurState
				>();
			},

			init: <NewState extends BaseObject>(
				factory: (refs: CurResolvedRefs) => NewState,
			) => {
				initStateFactory = factory as (refs: any) => any;
				return createBuilder<CurResolvedRefs, NewState>();
			},

			implements: (
				implFactory: InjectableObjectFactory<
					CurResolvedRefs & { ctx: ContextHelper },
					Type,
					CurState
				>,
			) => ({
				reference,
				factory: (dock: Dock) => {
					const deps = resolveReferences(
						references,
						dock,
					) as CurResolvedRefs;

					const context: CurResolvedRefs &
						CurState & { ctx: ContextHelper } = {
						...deps,
						...(initStateFactory ? initStateFactory(deps) : {}),
						ctx: createContextHelper(dock),
					};

					return implFactory(context);
				},

				instantiate: (
					deps: CurResolvedRefs = {} as CurResolvedRefs,
				) => {
					const context: CurResolvedRefs &
						CurState & { ctx: ContextHelper } = {
						...deps,
						...(initStateFactory ? initStateFactory(deps) : {}),
						ctx: createContextHelper(),
					};

					return implFactory(context);
				},
			}),
		};
	}

	return createBuilder<BaseObject, BaseObject>();
}

export { type Injectable, injectable };
