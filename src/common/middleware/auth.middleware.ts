import { createMiddleware } from 'hono/factory';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config/constants';

export const authMiddleware = createMiddleware<{ Variables: { userId: string } }>(async (c, next) => {
	const authHeader = c.req.header('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	const token = authHeader.split(' ')[1];

	try {
		const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
		c.set('userId', payload.userId);
		await next();
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			return c.json({ error: 'Invalid token' }, 401);
		}
		throw error;
	}
});
