import "@/app/global.css";
import { RootProvider } from "fumadocs-ui/provider";
import { Inter } from "next/font/google";
import { createMetadata } from "@/lib/metadata";

const inter = Inter({
	subsets: ["latin"],
});

export const metadata = createMetadata({
	title: {
		template: "Aquinas | %s",
		default: "Aquinas",
	},
	description: "dependency inversion w/o classes",
});

export default function Layout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en" className={inter.className} suppressHydrationWarning>
			<body className="flex flex-col min-h-screen">
				<RootProvider>{children}</RootProvider>
			</body>
		</html>
	);
}
