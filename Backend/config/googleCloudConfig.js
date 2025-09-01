require('dotenv').config();
const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({
  projectId: process.env.CLOUD_PROJECTID,
  keyFilename: path.resolve(process.env.CLOUD_KEYFILENAME),
});

const bucket = storage.bucket(process.env.CLOUD_BUCKET);

const uploadImageToBucket = async (fileBuffer, fileName, mimetype) => {
  const blob = bucket.file(fileName);
  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: { contentType: mimetype },
  });

  return new Promise((resolve, reject) => {
    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });

    blobStream.on('error', (err) => {
      reject(err);
    });

    blobStream.end(fileBuffer);
  });
};

const deleteImageFromBucket = async (fileUrl) => {
  const filePath = fileUrl.split(`https://storage.googleapis.com/${bucket.name}/`)[1];
  if (!filePath) return;
  await bucket.file(filePath).delete().catch((err) => {
    console.error(`Error deleting image from bucket:`, err.message);
  });
};

module.exports = { uploadImageToBucket, deleteImageFromBucket };
