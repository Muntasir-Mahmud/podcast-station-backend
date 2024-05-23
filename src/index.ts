import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { podcasts } from './db/schema';

export type Env = {
	DB: D1Database;
	MY_VARIABLE: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
	const db = drizzle(c.env.DB);
	const result = await db.select().from(podcasts).all();
	return c.json(result);
});

export default app;
