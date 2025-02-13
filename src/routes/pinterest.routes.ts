import { Elysia, t } from "elysia";
import { PinterestService } from "../services/pinterest.service";

const pinterestService = new PinterestService();

// Available image size options for Pinterest images
type ImageSize = "hd" | "x236" | "x474" | "x736";

const pinterestRoutes = new Elysia()
	// Get Pinterest pin details by ID
	.get("/pin/:id", async ({ params }) => {
		try {
			return {
				status: 200,
				data: await pinterestService.getPinDetails(params.id),
			};
		} catch {
			return {
				status: 500,
				error: "Failed to get pin details",
			};
		}
	})
	// Download Pinterest image with optional size parameter
	.get(
		"/pin/:id/download",
		async ({ params, query }) => {
			try {
				const { url, contentType } = await pinterestService.getPinImageUrl(
					params.id,
					query.size as ImageSize | undefined,
				);

				// Fetch and stream the image
				const response = await fetch(url);
				if (!response.ok) throw new Error("Gagal mengunduh gambar");

				// Return image with proper headers for download
				return new Response(await response.arrayBuffer(), {
					headers: {
						"Content-Type": contentType,
						"Content-Disposition": `attachment; filename=pinterest-${params.id}${
							query.size ? `-${query.size}` : "-hd"
						}.${contentType.split("/")[1]}`,
					},
				});
			} catch (error) {
				return new Response(
					`Failed to download image: ${error instanceof Error ? error.message : "Unknown error"}`,
					{ status: 500 },
				);
			}
		},
		{
			// Validate size query parameter
			query: t.Object({
				size: t.Optional(
					t.Union([
						t.Literal("hd"),
						t.Literal("x236"),
						t.Literal("x474"),
						t.Literal("x736"),
					]),
				),
			}),
		},
	);

export default pinterestRoutes;
