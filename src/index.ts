import { Elysia } from "elysia";
import pinterestRoutes from "./routes/pinterest.routes";

const app = new Elysia().use(pinterestRoutes).listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
