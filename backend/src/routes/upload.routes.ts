import { Router, Request as Request, Response } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import storageService from '../services/storage.service';

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, PDFs, and common document types
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

/**
 * @route POST /api/upload
 * @desc Upload a file to cloud storage
 * @access Private
 */
router.post('/', authenticate, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = await storageService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.json({
      success: true,
      url: fileUrl,
      fileName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

/**
 * @route POST /api/upload/multiple
 * @desc Upload multiple files to cloud storage
 * @access Private
 */
router.post('/multiple', authenticate, upload.array('files', 5), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadPromises = files.map((file) =>
      storageService.uploadFile(file.buffer, file.originalname, file.mimetype)
    );

    const urls = await Promise.all(uploadPromises);

    const results = files.map((file, index) => ({
      url: urls[index],
      fileName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    }));

    res.json({
      success: true,
      files: results,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

/**
 * @route GET /api/upload/presigned-url
 * @desc Get a presigned URL for direct upload to S3
 * @access Private
 */
router.get('/presigned-url', authenticate, async (req: Request, res: Response) => {
  try {
    const { fileName, contentType } = req.query;

    if (!fileName || !contentType) {
      return res.status(400).json({ error: 'fileName and contentType are required' });
    }

    const url = await storageService.getPresignedUploadUrl(
      fileName as string,
      contentType as string
    );

    res.json({
      success: true,
      url,
      expiresIn: 900, // 15 minutes
    });
  } catch (error: any) {
    console.error('Presigned URL error:', error);
    res.status(500).json({ error: 'Failed to generate presigned URL' });
  }
});

/**
 * @route DELETE /api/upload
 * @desc Delete a file from cloud storage
 * @access Private
 */
router.delete('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ error: 'fileUrl is required' });
    }

    await storageService.deleteFile(fileUrl);

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;
