import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { todoRouter } from "./todo";

export const appRouter = router({
	health: publicProcedure
	.meta({ openapi: { method: 'GET', path: '/trpc/health' } })
	.input(z.void())
	.output(z.object({
		message: z.literal('Ok'),
	}))
	.query(() => {
		return {
			message: "Ok",
		}
	}),
	privateData: protectedProcedure
	.meta({ openapi: { method: 'GET', path: '/trpc/privateData' } })
	.input(z.void())
	.output(z.object({
		message: z.literal('This is private'),
		user: z.object({
			id: z.string(),
			name: z.string(),
			email: z.string(),
		}),
	}))
	.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	todo: todoRouter,
});
export type AppRouter = typeof appRouter;
