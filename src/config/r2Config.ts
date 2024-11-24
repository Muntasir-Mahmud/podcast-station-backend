import { S3Client } from '@aws-sdk/client-s3';

export const R2 = new S3Client({
	endpoint: 'https://5e36b02c55d3648297c2909f07593434.r2.cloudflarestorage.com',
	credentials: {
		accessKeyId: '96524e4184065678eaea1ccff5fcd0ec',
		secretAccessKey: '67bfc38c8b2cc14c6a5112737f2c70dc9125cb9c9ac9e7b940e20fedb019c080',
	},
	region: 'auto',
});

export const BUCKET_NAME = 'podcast-station-r2';
