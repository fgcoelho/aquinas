/* eslint-disable @typescript-eslint/no-unused-vars */

import { ImageResponse } from "next/og";
import { metadataImage } from "@/lib/metadata";
import { getFonts } from "./load-google-fonts";

export const GET = metadataImage.createAPI(async (page) => {
	const response = new ImageResponse(
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				width: "100%",
				height: "100%",
				color: "white",
				padding: "4rem",
				backgroundColor: "#151515",
			}}
		>
			💉
			<h1
				style={{
					textAlign: "center",
					marginTop: "1rem",
					fontSize: "5rem",
					fontWeight: "700",
				}}
			>
				{page.data.title}
			</h1>
			<p
				style={{
					textAlign: "center",
					marginTop: "0rem",
					fontSize: "2rem",
					fontWeight: "400",
					color: "#9b9b9b",
				}}
			>
				{page.data.description}
			</p>
		</div>,
		{
			width: 1200,
			height: 630,
			fonts: await getFonts(),
		},
	);

	return response;
});

export function generateStaticParams() {
	return metadataImage.generateParams();
}
