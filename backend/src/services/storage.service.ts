import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'dfn-uploads';

export class StorageService {
  async uploadFile(file: Buffer, fileName: string, contentType: string): Promise<string> {
    const key = `uploads/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Return the file URL
    return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
  }

  async getPresignedUploadUrl(fileName: string, contentType: string): Promise<string> {
    const key = `uploads/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    // URL expires in 15 minutes
    const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    return url;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // Extract key from URL
    const key = fileUrl.split('.com/')[1];

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  }
}

export default new StorageService();
