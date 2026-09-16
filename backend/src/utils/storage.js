const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { pipeline } = require('stream/promises');

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

/**
 * Streams one multipart file part to disk. Must be awaited *while the
 * part is still the current one* in the request.parts() iterator.
 */
async function saveUploadedFile(filePart) {
  const ext = path.extname(filePart.filename || '').toLowerCase();
  const storedName = `${crypto.randomBytes(16).toString('hex')}${ext}`;
  const destPath = path.join(UPLOAD_DIR, storedName);

  // pipeline() propagates errors from either end and cleans up the
  // write stream, which the old manual .pipe() wiring did not.
  await pipeline(filePart.file, fs.createWriteStream(destPath));

  // @fastify/multipart flags this instead of throwing once the
  // configured fileSize limit is exceeded mid-stream.
  if (filePart.file.truncated) {
    await fsp.unlink(destPath).catch(() => {});
    throw httpError('File is too large.', 413);
  }

  const stats = await fsp.stat(destPath);

  if (stats.size === 0) {
    await fsp.unlink(destPath).catch(() => {});
    throw httpError('Uploaded file was empty.', 400);
  }

  const baseUrl = (process.env.APP_URL || '').replace(/\/+$/, '');

  return {
    storedName,
    fileUrl: `${baseUrl}/uploads/${storedName}`,
    fileType: ext.replace('.', ''),
    fileSizeBytes: stats.size,
  };
}

module.exports = {
  saveUploadedFile,
  UPLOAD_DIR,
};
