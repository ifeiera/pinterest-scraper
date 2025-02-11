import { fetch } from "undici";
import * as cheerio from "cheerio";
import type { PinDetails } from "../schemas/pinterest.schema";

type ImageSize = "hd" | "x236" | "x474" | "x736";
type ImageResponse = { url: string; contentType: string };

export class PinterestService {
	private static readonly USER_AGENT = "Mozilla/5.0 Chrome/91.0.4472.124";

	async getPinDetails(pinId: string): Promise<PinDetails> {
		const $ = cheerio.load(
			await (
				await fetch(`https://pinterest.com/pin/${pinId}`, {
					headers: { "User-Agent": PinterestService.USER_AGENT },
				})
			).text(),
		);

		const mainImg = $('img[src*="/736x/"]').first();
		const src = mainImg.attr("src");
		if (!mainImg.length || !src) {
			throw new Error("Gambar tidak ditemukan");
		}

		const match = src.match(/(.*\/)\d+x\/(.+)\.(.+)/);
		if (!match) {
			throw new Error("Format URL tidak valid");
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

	async getPinImageUrl(
		pinId: string,
		size?: ImageSize,
	): Promise<ImageResponse> {
		const details = await this.getPinDetails(pinId);
		if (!details.mainImage?.srcset) throw new Error("Gambar tidak ditemukan");

		if (!size || size === "hd") {
			for (const url of details.mainImage.srcset.original) {
				const result = await this.validateImageUrl(url);
				if (result) return result;
			}
			return this.getImageBySize(details.mainImage.srcset, "x736");
		}

		return this.getImageBySize(details.mainImage.srcset, size);
	}

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

	private async getImageBySize(
		srcset: NonNullable<PinDetails["mainImage"]>["srcset"],
		size: Exclude<ImageSize, "hd">,
	): Promise<ImageResponse> {
		const url = srcset[size];
		if (!url) throw new Error(`Ukuran gambar ${size} tidak tersedia`);

		const response = await fetch(url, { method: "HEAD" });
		if (!response.ok) throw new Error(`Gagal mengakses gambar ukuran ${size}`);

		return {
			url,
			contentType:
				response.headers.get("content-type") || this.getContentType(url),
		};
	}

	private isValidContentType(url: string, contentType: string | null): boolean {
		return (
			(url.endsWith(".jpg") && contentType?.includes("jpeg")) ||
			(url.endsWith(".png") && contentType?.includes("png")) ||
			!!contentType?.includes("image/")
		);
	}

	private getContentType(url: string): string {
		return url.endsWith(".png") ? "image/png" : "image/jpeg";
	}
}
