import { ArrowUpRightIcon } from "@heroicons/react/16/solid";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import Link from "next/link";
import { Icon } from "@/components/icon";

export default function HomePage() {
	return (
		<main className="flex flex-1 flex-col justify-center">
			<article className="container max-w-4xl mx-auto px-4 py-8 prose prose-neutral dark:prose-invert prose-lg">
				<h1>💉 aquinas</h1>

				<p className="lead">
					<strong>Dependency injection for the modern web</strong>
				</p>

				<p>
					Clean, type-safe dependency inversion using{" "}
					<strong>functions and objects</strong> instead of classes
					and decorators.
				</p>

				<div className="flex flex-col sm:flex-row gap-4 not-prose my-8">
					<Link
						href="/docs/quickstart"
						className="inline-flex items-center px-6 py-3 bg-fd-primary text-fd-primary-foreground font-semibold rounded-lg hover:bg-fd-primary/90 transition-colors no-underline"
					>
						Get Started <ArrowUpRightIcon className="size-4 ml-2" />
					</Link>
					<Link
						href="/docs/"
						className="inline-flex items-center px-6 py-3 border border-fd-border text-fd-foreground font-semibold rounded-lg hover:bg-fd-muted/50 transition-colors no-underline"
					>
						View Docs
					</Link>
				</div>

				<h2>Why Aquinas?</h2>

				<div className="grid md:grid-cols-3 gap-6 not-prose my-8">
					<div className="border border-fd-border rounded-lg p-6">
						<h3 className="font-semibold mb-2 text-base inline-flex items-center">
							<Icon icon="AtSymbol" className="size-5 mr-2" /> No
							Decorators
						</h3>
						<p className="text-fd-muted-foreground text-sm">
							Works with plain JavaScript. No experimental
							decorators or reflect-metadata.
						</p>
					</div>
					<div className="border border-fd-border rounded-lg p-6 ">
						<h3 className="font-semibold mb-2 text-base inline-flex items-center">
							<Icon icon="ShieldCheck" className="size-5 mr-2" />
							Type Safe
						</h3>
						<p className="text-fd-muted-foreground text-sm ">
							Full TypeScript support with automatic type
							inference.
						</p>
					</div>
					<div className="border border-fd-border rounded-lg p-6">
						<h3 className="font-semibold mb-2 text-base inline-flex items-center">
							<Icon icon="Wrench" className="size-5 mr-2" />
							Agnostic
						</h3>
						<p className="text-fd-muted-foreground text-sm">
							Works with any framework without any additional
							setup or headache.
						</p>
					</div>
				</div>

				<h2>Quick Example</h2>

				<Tabs
					groupId="language"
					persist
					items={["TypeScript", "JavaScript"]}
				>
					<Tab value="TypeScript">
						<DynamicCodeBlock
							lang="ts"
							code={`// 1. Define a reference							
const UserServiceReference = reference<IUserService>("UserService");

// 2. Create an injectable
const UserService = injectable(UserServiceReference)
  .deps({ 
  	userRepository: UserRepositoryReference 
  })
  .implements(({ userRepository }) => ({
    async createUser(data) {
      return await userRepository.save(data);
    }
  }));

// 3. Register in a dock
const appDock = dock();
appDock.register(UserService);

// 4. Resolve and use
const userService = appDock.get(UserServiceReference);`}
						/>
					</Tab>
					<Tab value="JavaScript">
						<DynamicCodeBlock
							lang="ts"
							code={`// 1. Define a reference
/** 
 * @type {import("aquinas").Reference<IUserService>} 
 */
const UserServiceReference = reference("UserService");

// 2. Create an injectable
const UserService = injectable(UserServiceReference)
  .deps({ 
  	userRepository: UserRepositoryReference 
  })
  .implements(({ userRepository }) => ({
    async createUser(data) {
      return await userRepository.save(data);
    }
  }));

// 3. Register in a dock
const appDock = dock();
appDock.register(UserService);

// 4. Resolve and use
const userService = appDock.get(UserServiceReference);`}
						/>
					</Tab>
				</Tabs>

				<h2>Installation</h2>

				<Tabs items={["npm", "pnpm", "yarn", "bun"]}>
					<Tab value="npm">
						<DynamicCodeBlock lang="bash" code={`npm i aquinas`} />
					</Tab>
					<Tab value="pnpm">
						<DynamicCodeBlock
							lang="bash"
							code={`pnpm add aquinas`}
						/>
					</Tab>
					<Tab value="yarn">
						<DynamicCodeBlock
							lang="bash"
							code={`yarn add aquinas`}
						/>
					</Tab>
					<Tab value="bun">
						<DynamicCodeBlock
							lang="bash"
							code={`bun add aquinas`}
						/>
					</Tab>
				</Tabs>

				<p>
					<Link href="/docs/quickstart">Get Started →</Link>
				</p>
			</article>
		</main>
	);
}
