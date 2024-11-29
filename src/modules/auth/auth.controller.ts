import { Hono } from 'hono';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { Env } from '../../index';
import { loginSchema, registerSchema } from './auth.schema';
import { AuthService } from './auth.service';

const auth = new Hono<{ Bindings: Env }>();

auth.post('/register', validateRequest(registerSchema), async (c) => {
	const authService = new AuthService(c.env.DB);
	const input = await c.req.json();
	const result = await authService.register(input);
	return c.json(result, 201);
});

auth.post('/login', validateRequest(loginSchema), async (c) => {
	const authService = new AuthService(c.env.DB);
	const input = await c.req.json();
	const result = await authService.login(input);
	return c.json(result);
});

export default auth;
