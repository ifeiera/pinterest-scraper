import { fetch } from "undici";
import * as cheerio from "cheerio";
import type { PinDetails } from "../schemas/pinterest.schema";

type ImageSize = "hd" | "x236" | "x474" | "x736";
type ImageResponse = { url: string; contentType: string };

export class PinterestService {
	// Browser user agent
	private static readonly USER_AGENT = "Mozilla/5.0 Chrome/91.0.4472.124";

	// Fetch and parse Pinterest pin details from the webpage
	async getPinDetails(pinId: string): Promise<PinDetails> {
		const $ = cheerio.load(
			await (
				await fetch(`https://pinterest.com/pin/${pinId}`, {
					headers: { "User-Agent": PinterestService.USER_AGENT },
				})
			).text(),
		);

		// Find the main image by looking for 736x size in src
		const mainImg = $('img[src*="/736x/"]').first();
		const src = mainImg.attr("src");
		if (!mainImg.length || !src) {
			throw new Error("Image not found");
		}

		// Extract image URL components for different sizes
		const match = src.match(/(.*\/)\d+x\/(.+)\.(.+)/);
		if (!match) {
			throw new Error("Invalid URL format");
		}

		const [, prefix, baseName, ext] = match;

		return {
			id: pinId,
			url: `https://pinterest.com/pin/${pinId}`,
			mainImage: {
				src,
				alt: mainImg.attr("alt") || "",
				srcset: {
					original: [
						`${prefix}originals/${baseName}.jpg`,
						`${prefix}originals/${baseName}.png`,
					],
					x236: `${prefix}236x/${baseName}.${ext}`,
					x474: `${prefix}474x/${baseName}.${ext}`,
					x736: `${prefix}736x/${baseName}.${ext}`,
				},
			},
		};
	}

	// Get image URL and content type for specified size
	async getPinImageUrl(
		pinId: string,
		size?: ImageSize,
	): Promise<ImageResponse> {
		const details = await this.getPinDetails(pinId);
		if (!details.mainImage?.srcset) throw new Error("Image not found");

		// For HD/original size, try both jpg and png formats
		if (!size || size === "hd") {
			for (const url of details.mainImage.srcset.original) {
				const result = await this.validateImageUrl(url);
				if (result) return result;
			}
			return this.getImageBySize(details.mainImage.srcset, "x736");
		}

		return this.getImageBySize(details.mainImage.srcset, size);
	}

	// Check if image URL is accessible and returns valid content type
	private async validateImageUrl(url: string): Promise<ImageResponse | null> {
		try {
			const response = await fetch(url, { method: "HEAD" });
			const contentType = response.headers.get("content-type");
			if (response.ok && this.isValidContentType(url, contentType)) {
				return { url, contentType: contentType || this.getContentType(url) };
			}
		} catch {
			// Ignore failed requests
		}
		return null;
	}

	// Get image URL for specific thumbnail size
	private async getImageBySize(
		srcset: NonNullable<PinDetails["mainImage"]>["srcset"],
		size: Exclude<ImageSize, "hd">,
	): Promise<ImageResponse> {
		const url = srcset[size];
		if (!url) throw new Error(`Image size ${size} not available`);

		const response = await fetch(url, { method: "HEAD" });
		if (!response.ok) throw new Error(`Failed to access image size ${size}`);

		return {
			url,
			contentType:
				response.headers.get("content-type") || this.getContentType(url),
		};
	}

	// Validate image content type matches file extension
	private isValidContentType(url: string, contentType: string | null): boolean {
		return (
			(url.endsWith(".jpg") && contentType?.includes("jpeg")) ||
			(url.endsWith(".png") && contentType?.includes("png")) ||
			!!contentType?.includes("image/")
		);
	}

	// Get default content type based on file extension
	private getContentType(url: string): string {
		return url.endsWith(".png") ? "image/png" : "image/jpeg";
	}
}
