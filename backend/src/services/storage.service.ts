import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';

const USE_S3 = process.env.USE_S3 === 'true' || (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

const s3Client = USE_S3 ? new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
}) : null;

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'dfn-uploads';
const LOCAL_UPLOAD_DIR = process.env.LOCAL_UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

// Ensure local uploads directory exists
if (!USE_S3 && !fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

export class StorageService {
  async uploadFile(file: Buffer, fileName: string, contentType: string): Promise<string> {
    // Sanitize filename
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${Date.now()}-${sanitizedFileName}`;

    if (USE_S3 && s3Client) {
      return this.uploadToS3(file, uniqueFileName, contentType);
    } else {
      return this.uploadToLocal(file, uniqueFileName);
    }
  }

  private async uploadToS3(file: Buffer, fileName: string, contentType: string): Promise<string> {
    const key = `uploads/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await s3Client!.send(command);

    // Return the file URL
    return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
  }

  private async uploadToLocal(file: Buffer, fileName: string): Promise<string> {
    const filePath = path.join(LOCAL_UPLOAD_DIR, fileName);
    
    await fs.promises.writeFile(filePath, file);

    // Return the file URL (will be served by express static)
    return `${BASE_URL}/uploads/${fileName}`;
  }

  async getPresignedUploadUrl(fileName: string, contentType: string): Promise<string> {
    if (!USE_S3 || !s3Client) {
      // For local storage, return the upload endpoint
      return `${BASE_URL}/api/upload`;
    }

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
    if (fileUrl.includes('s3.amazonaws.com') && USE_S3 && s3Client) {
      // Delete from S3
      const key = fileUrl.split('.com/')[1];

      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
    } else if (fileUrl.includes('/uploads/')) {
      // Delete from local storage
      const fileName = fileUrl.split('/uploads/')[1];
      const filePath = path.join(LOCAL_UPLOAD_DIR, fileName);
      
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }
  }
}

export default new StorageService();
