import type { Dock } from "./dock";
import type { Reference } from "./reference";

function resolveReferences<Refs extends Record<string, Reference<unknown>>>(
	references: Refs,
	dock: Dock,
): {
	[K in keyof Refs]: Refs[K] extends Reference<infer T> ? T : never;
} {
	if (!references || typeof references !== "object") {
		throw new Error("Invalid references object provided");
	}

	const resolved: Record<string, unknown> = {};

	for (const [refKey, refValue] of Object.entries(references)) {
		if (!refValue || typeof refValue !== "object") {
			throw new Error(`Invalid dependency reference for key: ${refKey}`);
		}

		if (
			!("__INJECTION_REFERENCE_FLAG" in refValue) ||
			!refValue.__INJECTION_REFERENCE_FLAG
		) {
			throw new Error(
				`Invalid dependency reference flag for key: ${refKey}`,
			);
		}

		try {
			resolved[refKey] = dock.get(refValue);
		} catch (error) {
			throw new Error(
				`Failed to resolve dependency for key: ${refKey}. ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	return resolved as {
		[K in keyof Refs]: Refs[K] extends Reference<infer T> ? T : never;
	};
}

export { resolveReferences };
