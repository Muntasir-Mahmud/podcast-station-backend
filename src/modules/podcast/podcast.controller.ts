import { Hono } from 'hono';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { R2 } from '../../config/r2Config';
import { Env } from '../../index';
import { UploadService } from '../../services/uploadService';
import { createEpisodeSchema, createPodcastSchema, updatePodcastSchema } from './podcast.schema';
import { PodcastService } from './podcast.service';

const podcast = new Hono<{ Bindings: Env }>();
const uploadService = new UploadService(R2, process.env.CLOUDFLARE_PUBLIC_URL!);

// Create a new podcast
podcast.post('/', authMiddleware, validateRequest(createPodcastSchema), async (c) => {
	const podcastService = new PodcastService(uploadService, c.env.DB);
	const input = await c.req.json();
	const userId = c.var.userId;
	const result = await podcastService.createPodcast(input, userId);
	return c.json(result, 201);
});

// Get a podcast by ID
podcast.get('/:id', async (c) => {
	const podcastService = new PodcastService(uploadService, c.env.DB);
	const id = c.req.param('id');
	const result = await podcastService.getPodcast(id);
	if (!result) {
		return c.json({ error: 'Podcast not found' }, 404);
	}
	return c.json(result);
});

// Get a podcast with episodes by ID
podcast.get('/:id/episodes', async (c) => {
	const podcastService = new PodcastService(uploadService, c.env.DB);
	const id = c.req.param('id');
	const result = await podcastService.getPodcastWithEpisodes(id);
	if (!result) {
		return c.json({ error: 'Podcast not found' }, 404);
	}
	return c.json(result);
});

// Update a podcast
podcast.put('/:id', authMiddleware, validateRequest(updatePodcastSchema), async (c) => {
	const podcastService = new PodcastService(uploadService, c.env.DB);
	const id = c.req.param('id');
	const input = await c.req.json();
	const userId = c.var.userId;
	const result = await podcastService.updatePodcast(id, input, userId);
	return c.json(result);
});

// Delete a podcast
podcast.delete('/:id', authMiddleware, async (c) => {
	const podcastService = new PodcastService(uploadService, c.env.DB);
	const id = c.req.param('id');
	const userId = c.var.userId;
	await podcastService.deletePodcast(id, userId);
	return c.json({ message: 'Podcast deleted successfully' });
});

// Add an episode to a podcast
podcast.post('/:id/episodes', authMiddleware, validateRequest(createEpisodeSchema), async (c) => {
	const podcastService = new PodcastService(uploadService, c.env.DB);
	const podcastId = c.req.param('id');
	const input = await c.req.json();
	const userId = c.var.userId;
	const result = await podcastService.addEpisode(podcastId, input, userId);
	return c.json(result, 201);
});

// Get upload URL for podcast audio/cover
podcast.post('/upload-url', authMiddleware, async (c) => {
	const podcastService = new PodcastService(uploadService, c.env.DB);
	const { fileName, fileType } = await c.req.json();
	const result = await podcastService.getUploadUrl(fileName, fileType);
	return c.json(result);
});

export default podcast;
