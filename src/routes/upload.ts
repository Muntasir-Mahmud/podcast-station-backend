import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { podcasts } from '../db/schema';
import { Env } from '../index';
import { UploadService } from '../services/uploadService';

const upload = new Hono<{ Bindings: Env }>();
const R2_URL = 'https://pub-79e26ac7eef44dcba4f58dbbb1f2c91e.r2.dev';

// Initialize upload service
const initUploadService = (env: any) => new UploadService(env.Bucket, R2_URL);

// Get pre-signed URL for upload
upload.post('/initiate', async (c) => {
	const { fileName, fileType } = await c.req.json();

	if (!fileName || !fileType) {
		return c.json({ error: 'fileName and fileType are required' }, 400);
	}

	// Validate file type
	if (!fileType.startsWith('audio/')) {
		return c.json({ error: 'Only audio files are allowed' }, 400);
	}

	const uploadService = initUploadService(c.env);
	const uploadData = await uploadService.getUploadUrl(fileName, fileType);

	return c.json(uploadData);
});

// Complete upload and save podcast metadata
upload.post('/complete', async (c) => {
	const { fileKey, podcastData } = await c.req.json();

	if (!fileKey || !podcastData) {
		return c.json({ error: 'fileKey and podcastData are required' }, 400);
	}

	const uploadService = initUploadService(c.env);
	const audioUrl = await uploadService.finalizeUpload(fileKey);

	// Save to database
	const db = drizzle(c.env.DB);
	const result = await db
		.insert(podcasts)
		.values({
			...podcastData,
			audioUrl,
		})
		.returning();

	return c.json(result[0]);
});

// Delete upload if something goes wrong
upload.delete('/:fileKey', async (c) => {
	const fileKey = c.req.param('fileKey');
	const uploadService = initUploadService(c.env);
	await uploadService.deleteFile(fileKey);
	return c.json({ success: true });
});

// Verify if a file exists
upload.get('/verify/*', async (c) => {
	try {
		// Get the full path after /verify/
		const fileKey = c.req.path.substring('/upload/verify/'.length);
		console.log('Verifying file:', fileKey); // Debug log

		const uploadService = initUploadService(c.env);
		const exists = await uploadService.verifyFile(fileKey);

		return c.json({
			success: true,
			exists,
			fileKey,
			url: exists ? `${R2_URL}/${fileKey}` : null,
		});
	} catch (error) {
		console.error('Verify error:', error); // Debug log
		return c.json(
			{
				success: false,
				error: 'Failed to verify file',
				details: error instanceof Error ? error.message : String(error),
			},
			500
		);
	}
});

// List all uploaded files
upload.get('/list', async (c) => {
	try {
		const uploadService = initUploadService(c.env);
		const files = await uploadService.listFiles();
		return c.json({
			success: true,
			files,
		});
	} catch (error) {
		console.error('List error:', error); // Debug log
		return c.json(
			{
				success: false,
				error: 'Failed to list files',
				details: error instanceof Error ? error.message : String(error),
			},
			500
		);
	}
});

export default upload;
