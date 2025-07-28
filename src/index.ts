import { logger } from "@tqman/nice-logger";
import { Elysia } from "elysia";
import pinterestRoutes from "./routes/pinterest.routes";

// Setup Elysia app with logging middleware
const app = new Elysia()
	.use(
		logger({
			mode: "combined",
			withTimestamp: false,
		}),
	)
	.use(pinterestRoutes)
	// Return empty response for favicon requests
	.get("/favicon.ico", () => new Response(null, { status: 204 }));

// Start the server
const start = async () => {
	const port = process.env.PORT ? Number(process.env.PORT) : 3000;
	const hostname = process.env.HOST || "0.0.0.0";

	app.listen({
		port,
		hostname,
	});

	console.log(
		`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
	);
};

start();
