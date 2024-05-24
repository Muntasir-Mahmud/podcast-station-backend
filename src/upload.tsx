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
export default upload;
