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
    // Sanitize filename - only allow alphanumeric, dashes, underscores, and single dot for extension
    const ext = fileName.includes('.') ? fileName.split('.').pop() || '' : '';
    const baseName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const sanitizedFileName = ext ? `${baseName}.${ext.replace(/[^a-zA-Z0-9]/g, '')}` : baseName;
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
    // Validate URL before processing
    let url: URL;
    try {
      url = new URL(fileUrl);
    } catch {
      // Not a valid URL, could be a relative path
      if (fileUrl.startsWith('/uploads/')) {
        const fileName = fileUrl.substring('/uploads/'.length);
        const sanitizedFileName = fileName.replace(/\.\./g, '').replace(/[^a-zA-Z0-9._-]/g, '');
        const filePath = path.join(LOCAL_UPLOAD_DIR, sanitizedFileName);
        
        // Ensure the file path is within uploads directory
        const resolvedPath = path.resolve(filePath);
        if (resolvedPath.startsWith(path.resolve(LOCAL_UPLOAD_DIR)) && fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      }
      return;
    }

    // Handle S3 URLs - must match expected bucket domain exactly
    const s3Domain = `${BUCKET_NAME}.s3.amazonaws.com`;
    if (USE_S3 && s3Client && url.hostname === s3Domain) {
      // Delete from S3
      const key = url.pathname.substring(1); // Remove leading slash

      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
    } else if (url.pathname.startsWith('/uploads/')) {
      // Delete from local storage
      const fileName = url.pathname.substring('/uploads/'.length);
      const sanitizedFileName = fileName.replace(/\.\./g, '').replace(/[^a-zA-Z0-9._-]/g, '');
      const filePath = path.join(LOCAL_UPLOAD_DIR, sanitizedFileName);
      
      // Ensure the file path is within uploads directory
      const resolvedPath = path.resolve(filePath);
      if (resolvedPath.startsWith(path.resolve(LOCAL_UPLOAD_DIR)) && fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }
  }
}

export default new StorageService();
