import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function baseOptions(): BaseLayoutProps {
	return {
		githubUrl: "https://github.com/Fgc17/aquinas",
		nav: {
			title: (
				<>
					<div className="mx-auto text-xl">💉</div>
					aquinas
				</>
			),
		},
		links: [],
	};
}
