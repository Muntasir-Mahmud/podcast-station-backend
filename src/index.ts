import { Hono } from 'hono';

export type Env = {
	DB: D1Database;
	MY_VARIABLE: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get('/', (c) => {
	return c.json({
		message: 'Hello World!',
		env: c.env.MY_VARIABLE,
	});
});

export default app;
