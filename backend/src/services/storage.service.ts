import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';

const USE_S3 = process.env.USE_S3 === 'true' || (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'dfn-uploads';
const AWS_ENDPOINT = process.env.AWS_ENDPOINT;
const AWS_FORCE_PATH_STYLE = process.env.AWS_FORCE_PATH_STYLE === 'true';
const LOCAL_UPLOAD_DIR = process.env.LOCAL_UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const BASE_URL = process.env.BASE_URL || '';

const s3Client = USE_S3 ? new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  endpoint: AWS_ENDPOINT,
  forcePathStyle: AWS_FORCE_PATH_STYLE,
}) : null;

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
    return this.getS3Url(key);
  }

  private getS3Url(key: string): string {
    if (!AWS_ENDPOINT) {
      return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
    }

    if (AWS_FORCE_PATH_STYLE) {
      // Path style: endpoint/bucket/key
      const endpoint = AWS_ENDPOINT.replace(/\/$/, '');
      return `${endpoint}/${BUCKET_NAME}/${key}`;
    } else {
      // Virtual hosted style: https://bucket.endpoint/key
      // Assuming endpoint provided includes protocol, e.g. https://nyc3.digitaloceanspaces.com
      const url = new URL(AWS_ENDPOINT);
      return `${url.protocol}//${BUCKET_NAME}.${url.host}/${key}`;
    }
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

    // Handle S3 URLs
    if (USE_S3 && s3Client) {
      let isS3Url = false;
      let key = '';

      if (!AWS_ENDPOINT) {
        // AWS Standard
        const s3Domain = `${BUCKET_NAME}.s3.amazonaws.com`;
        if (url.hostname === s3Domain) {
          isS3Url = true;
          key = url.pathname.substring(1);
        }
      } else {
        // Custom Provider
        const endpointUrl = new URL(AWS_ENDPOINT);
        if (AWS_FORCE_PATH_STYLE) {
          // Path style: endpoint/bucket/key
          // Check if origin matches and path starts with /bucket/
          if (url.origin === endpointUrl.origin && url.pathname.startsWith(`/${BUCKET_NAME}/`)) {
            isS3Url = true;
            key = url.pathname.substring(`/${BUCKET_NAME}/`.length);
          }
        } else {
          // Virtual hosted style: bucket.endpoint/key
          const bucketHost = `${BUCKET_NAME}.${endpointUrl.host}`;
          if (url.host === bucketHost) {
            isS3Url = true;
            key = url.pathname.substring(1);
          }
        }
      }

      if (isS3Url) {
        const command = new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        });

        await s3Client.send(command);
        return;
      }
    }

    if (url.pathname.startsWith('/uploads/')) {
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

  /**
   * Identifies the hardware format of a file based on its extension or MIME type.
   */
  identifyHardwareFormat(fileName: string, mimeType: string): string {
    const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));

    const formats: Record<string, string[]> = {
      '3d_model': ['.stl', '.obj', '.glb', '.gltf', '.3ds', '.fbx'],
      'cad_design': ['.step', '.stp', '.iges', '.igs', '.dwg', '.dxf'],
      'pcb_design': ['.brd', '.sch', '.pcbdoc', '.schdoc', '.pcb', '.kicad_pcb', '.kicad_sch'],
      'cam_gcode': ['.gcode', '.nc', '.cnc', '.tap'],
      'fabrication_package': ['.gerber', '.zip', '.tar', '.gz'],
      'document': ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
      'image': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    };

    for (const [format, extensions] of Object.entries(formats)) {
      if (extensions.includes(ext)) {
        return format;
      }
    }

    // Fallback to MIME type identification
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'document';
    if (mimeType.includes('word') || mimeType.includes('excel')) return 'document';
    if (mimeType.includes('zip')) return 'fabrication_package';

    return 'unknown';
  }
}

export default new StorageService();
