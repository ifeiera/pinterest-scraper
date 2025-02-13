import { t } from "elysia";

// Schema for Pinterest image data structure
export const PinImageSchema = t.Object({
	src: t.String(),
	alt: t.String(),
	srcset: t.Object({
		original: t.Array(t.String()), // Array of possible original image URLs
		x236: t.Union([t.String(), t.Null()]), // Small thumbnail (236px)
		x474: t.Union([t.String(), t.Null()]), // Medium thumbnail (474px)
		x736: t.Union([t.String(), t.Null()]), // Large thumbnail (736px)
	}),
});

// Schema for Pinterest pin details
export const PinDetailsSchema = t.Object({
	id: t.String(),
	url: t.String(), // Full Pinterest pin URL
	mainImage: t.Union([PinImageSchema, t.Null()]), // Main pin image data
});

// Schema for API response structure
export const PinResponseSchema = t.Object({
	status: t.Number(),
	data: t.Optional(PinDetailsSchema),
	error: t.Optional(t.String()),
});

// Schema for pin ID parameter validation
export const PinParamsSchema = t.Object({
	id: t.String({
		minLength: 1,
		error: "Pin ID is required",
	}),
});

// Type exports for use in other files
export type PinImage = typeof PinImageSchema.static;
export type PinDetails = typeof PinDetailsSchema.static;
export type PinResponse = typeof PinResponseSchema.static;
export type PinParams = typeof PinParamsSchema.static;
