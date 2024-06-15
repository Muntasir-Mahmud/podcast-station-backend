import { Hono } from 'hono';

const upload = new Hono().basePath('/upload');

upload.get('/', (c) => {
	return c.html(
		<html>
			<body>
				<form method="POST" action="/upload" enctype="multipart/form-data">
					<input type="file" id="myFile" name="filename" />
					<button type="submit">Upload</button>
				</form>
			</body>
		</html>
	);
});

upload.post('/', async (c) => {
	const body = await c.req.parseBody();
	const file = body['filename'];
	if (file && file instanceof File) {
		console.log('uploading file to R2');
		await c.env.Bucket.put(file.name, file);
		return c.json({ success: true });
	}
});

export default upload;
