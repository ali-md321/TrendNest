require('dotenv').config();
const { Storage } = require('@google-cloud/storage');
const path = require('path');

const credentials = {
  type: "service_account",
  project_id: process.env.CLOUD_PROJECT_ID,
  private_key_id: process.env.CLOUD_PRIVATE_KEY_ID,
  private_key: process.env.CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.CLOUD_CLIENT_EMAIL,
  client_id: process.env.CLOUD_CLIENT_ID,
  auth_uri: process.env.CLOUD_AUTH_URI,
  token_uri: process.env.CLOUD_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.CLOUD_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLOUD_CLIENT_X509_CERT_URL,
  universe_domain: process.env.CLOUD_UNIVERSE_DOMAIN,
}

const storage = new Storage({
  projectId: process.env.CLOUD_PROJECT_ID,
  credentials: credentials
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
