const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/**
 * Saves a multipart file stream to /uploads and returns metadata to store
 * on the Resource document. Swap this for an S3/Cloudinary upload later —
 * every caller only needs { fileUrl, fileType, fileSizeBytes } back.
 */
async function saveUploadedFile(filePart) {
  const ext = path.extname(filePart.filename);
  const uniqueName = `${crypto.randomBytes(16).toString('hex')}${ext}`;
  const destPath = path.join(UPLOAD_DIR, uniqueName);

  await new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(destPath);
    filePart.file.pipe(writeStream);
    filePart.file.on('end', resolve);
    writeStream.on('error', reject);
  });

  const stats = fs.statSync(destPath);
  return {
    fileUrl: `${process.env.APP_URL}/uploads/${uniqueName}`,
    fileType: ext.replace('.', ''),
    fileSizeBytes: stats.size,
  };
}

module.exports = { saveUploadedFile, UPLOAD_DIR };