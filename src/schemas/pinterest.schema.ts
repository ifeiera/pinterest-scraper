import { t } from "elysia";

export const PinImageSchema = t.Object({
	src: t.String(),
	alt: t.String(),
	srcset: t.Object({
		original: t.Array(t.String()),
		x236: t.Union([t.String(), t.Null()]),
		x474: t.Union([t.String(), t.Null()]),
		x736: t.Union([t.String(), t.Null()]),
	}),
});

export const PinDetailsSchema = t.Object({
	id: t.String(),
	url: t.String(),
	mainImage: t.Union([PinImageSchema, t.Null()]),
});

export const PinResponseSchema = t.Object({
	status: t.Number(),
	data: t.Optional(PinDetailsSchema),
	error: t.Optional(t.String()),
});

export const PinParamsSchema = t.Object({
	id: t.String({
		minLength: 1,
		error: "ID pin harus diisi",
	}),
});

export type PinImage = typeof PinImageSchema.static;
export type PinDetails = typeof PinDetailsSchema.static;
export type PinResponse = typeof PinResponseSchema.static;
export type PinParams = typeof PinParamsSchema.static;
