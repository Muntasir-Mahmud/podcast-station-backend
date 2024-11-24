import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { R2Bucket } from '@cloudflare/workers-types';
import { BUCKET_NAME, R2 } from '../config/r2Config';

export interface UploadURLResponse {
	uploadUrl: string;
	fileKey: string;
}

export interface FileInfo {
	key: string;
	size: number;
	uploaded: string;
	url: string;
}

export class UploadService {
	constructor(private bucket: R2Bucket, private baseUrl: string) {}

	async getUploadUrl(fileName: string, fileType: string): Promise<UploadURLResponse> {
		// Create a unique file key using timestamp and random values
		const timestamp = Date.now();
		const randomBytes = new Uint8Array(8);
		crypto.getRandomValues(randomBytes);
		const randomStr = Array.from(randomBytes)
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');

		const fileKey = `podcasts/${timestamp}-${randomStr}-${fileName}`;

		// Generate a presigned URL using AWS SDK
		const uploadUrl = await getSignedUrl(
			R2,
			new PutObjectCommand({
				Bucket: BUCKET_NAME,
				Key: fileKey,
				ContentType: fileType,
			}),
			{
				expiresIn: 3600, // URL expires in 1 hour
			}
		);

		return {
			uploadUrl,
			fileKey,
		};
	}

	async finalizeUpload(fileKey: string): Promise<string> {
		// Get the public URL for the uploaded file
		return `${this.baseUrl}/${fileKey}`;
	}

	async deleteFile(fileKey: string): Promise<void> {
		await this.bucket.delete(fileKey);
	}

	async verifyFile(fileKey: string): Promise<boolean> {
		const object = await this.bucket.get(fileKey);
		return object !== null;
	}

	async listFiles(): Promise<FileInfo[]> {
		const options = {
			prefix: 'podcasts/',
			limit: 100,
		};

		const objects = await this.bucket.list(options);
		return objects.objects.map((obj) => ({
			key: obj.key,
			size: obj.size,
			uploaded: obj.uploaded.toISOString(),
			url: `${this.baseUrl}/${obj.key}`,
		}));
	}
}
