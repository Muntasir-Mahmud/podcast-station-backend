import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import auth from './modules/auth/auth.controller';
import podcast from './modules/podcast/podcast.controller';

export type Env = {
	DB: D1Database;
	Bucket: R2Bucket;
};

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Routes
app.route('/auth', auth);
app.route('/podcasts', podcast);

export default app;
