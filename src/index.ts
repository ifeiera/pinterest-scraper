import { logger } from "@tqman/nice-logger";
import { Elysia } from "elysia";
import { config } from 'dotenv';
import { cors } from '@elysiajs/cors'
import pinterestRoutes from "./routes/pinterest.routes";

config();

void startServer();

async function startServer() {
    const app = new Elysia()
      .use(cors())
      .use(
        logger({
          mode: 'combined',
          withTimestamp: false,
        }),
      )
      .use(pinterestRoutes)
      .get('/favicon.ico', () => new Response(null, { status: 204 }))
      .listen(3000);

    console.log(`Pinterest Scraper is running at ${app.server?.hostname}:${app.server?.port}`);

try {
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}
