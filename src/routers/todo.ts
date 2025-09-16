import z from "zod";
import { router, publicProcedure } from "../lib/trpc";
import { todo } from "../db/schema/todo";
import { eq } from "drizzle-orm";
import { db } from "../db";
import {createInsertSchema, createSelectSchema} from "drizzle-zod"

const insertedTodo = createInsertSchema(todo)
const selectTodo = createSelectSchema(todo)

export const todoRouter = router({
	getAll: publicProcedure
	.meta({ openapi: { method: 'GET', path: '/trpc/todo.getAll' } })
	.input(z.void())
	.output(z.array(z.object({
		id: z.number(),
		text: z.string(),
		completed: z.boolean(),
	})))
	.query(async () => {
		return await db.select().from(todo);
	}),

	create: publicProcedure
		.meta({ openapi: { method: 'POST', path: '/trpc/todo.create' } })
		.input(z.object({ text: z.string().min(1) }))
		.output(insertedTodo)
		.mutation(async ({ input }) => {
			const insertedTodo = await db.insert(todo).values({
				text: input.text,
			}).returning();
			return insertedTodo[0];
		}),

	toggle: publicProcedure
		.meta({ openapi: { method: 'POST', path: '/trpc/todo.toggle' } })
		.input(z.object({ id: z.number(), completed: z.boolean() }))
		.output(selectTodo)
		.mutation(async ({ input }) => {
			const updatedTodo =  await db
				.update(todo)
				.set({ completed: input.completed })
				.where(eq(todo.id, input.id)).returning()

			return updatedTodo[0];
		}),

	delete: publicProcedure
		.meta({ openapi: { method: 'POST', path: '/trpc/todo.delete' } })
		.input(z.object({ id: z.number() }))
		.output(selectTodo)
		.mutation(async ({ input }) => {
			const deletedTodo=  await db.delete(todo).where(eq(todo.id, input.id)).returning()
			return deletedTodo[0];
		}),
});
