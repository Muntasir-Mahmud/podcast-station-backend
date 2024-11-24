import { Hono } from 'hono';
import podcast from './routes/podcast';
import upload from './routes/upload';

const R2_URL = 'https://pub-79e26ac7eef44dcba4f58dbbb1f2c91e.r2.dev';

export type Env = {
	DB: D1Database;
	Bucket: R2Bucket;
};

const app = new Hono<{ Bindings: Env }>();

app.route('/', podcast);
app.route('/upload', upload);

export default app;
