const { BlobServiceClient } = require("@azure/storage-blob");
const { v4: uuidv4 } = require("uuid");

// Initialize Blob Service Client
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_CONTAINER_NAME;

const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);

// Upload file to Azure Blob Storage
exports.uploadToAzure = async function (buffer, originalName) {
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Create a unique blob name
  const blobName = `${uuidv4()}-${originalName}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Upload data to the blob
  await blockBlobClient.uploadData(buffer);

  // Return the blob URL
  return blockBlobClient.url;
};

exports.deleteFromAzure = async function (imageUrl) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );

  const containerName = process.env.AZURE_CONTAINER_NAME;
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Extract blob name from the image URL
  const blobName = imageUrl.split("/").pop();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Delete the blob
  await blockBlobClient.deleteIfExists();
};
