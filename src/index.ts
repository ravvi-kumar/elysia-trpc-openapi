import "dotenv/config";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { createContext } from "./lib/context";
import { appRouter } from "./routers/index";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { auth, OpenAPI } from "./lib/auth";
import { openapi } from '@elysiajs/openapi'
import { TrpcOpenAPI } from './lib/trpc-openapi'

const app = new Elysia()
	.use(openapi({
		documentation: {
			info: {
				title: 'tRPC + Better Auth',
				version: '0.0.1',
				description: 'tRPC + Better Auth',
				license: {
					name: 'MIT',
				},
			},
			components: { ...TrpcOpenAPI.components, ...(await OpenAPI.components) },
			paths: { ...TrpcOpenAPI.getPaths(''), ...(await OpenAPI.getPaths()) }
		}
	}))
	.use(
		cors({
			origin: process.env.CORS_ORIGIN || "",
			methods: ["GET", "POST", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
	.mount("/auth", auth.handler)
	.all("/trpc/*", async (context) => {
		const res = await fetchRequestHandler({
			endpoint: "/trpc",
			router: appRouter,
			req: context.request,
			createContext: () => createContext({ context }),
		});
		return res;
	}, {
		detail: {
			hide: true
		}
	})
	.get("/", () => "OK")
	.listen(3000, () => {
		console.log("Server is running on http://localhost:3000");
	});