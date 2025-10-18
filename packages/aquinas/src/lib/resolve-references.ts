import type { Dock } from "./dock";
import type { Reference } from "./reference";

function resolveReferences<Refs extends Record<string, Reference<unknown>>>(
	references: Refs,
	dock: Dock,
): { [K in keyof Refs]: Refs[K] extends Reference<infer T> ? T : never } {
	const resolved: Record<string, unknown> = {};

	for (const [key, ref] of Object.entries(references)) {
		resolved[key] = dock.get(ref);
	}

	return resolved as {
		[K in keyof Refs]: Refs[K] extends Reference<infer T> ? T : never;
	};
}

export { resolveReferences };
