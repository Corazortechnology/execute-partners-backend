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

// const {
//   BlobServiceClient,
//   generateBlobSASQueryParameters,
//   BlobSASPermissions,
//   StorageSharedKeyCredential,
// } = require("@azure/storage-blob");
// const ffmpeg = require("fluent-ffmpeg");
// const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
// const fs = require("fs");
// const path = require("path");
// const { v4: uuidv4 } = require("uuid");
// const { Readable } = require("stream");
// require("dotenv").config();

// const AZURE_STORAGE_CONNECTION_STRING =
//   process.env.AZURE_STORAGE_CONNECTION_STRING;
// const AZURE_STORAGE_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT;
// const AZURE_STORAGE_ACCESS_KEY = process.env.AZURE_STORAGE_ACCESS_KEY;
// const IMAGE_CONTAINER_NAME = process.env.AZURE_IMAGE_CONTAINER_NAME; // For images
// const VIDEO_CONTAINER_NAME = process.env.AZURE_VIDEO_CONTAINER_NAME; // For videos

// const blobServiceClient = BlobServiceClient.fromConnectionString(
//   AZURE_STORAGE_CONNECTION_STRING
// );

// const TEMP_DIR = path.join(__dirname, "temp");

// // **🔹 Function to Ensure `temp/` Directory Exists**
// function ensureTempDirExists() {
//   if (!fs.existsSync(TEMP_DIR)) {
//     fs.mkdirSync(TEMP_DIR, { recursive: true });
//   }
// }
// // **🔹 Function to Compress Video Using FFmpeg**
// async function compressVideo(inputBuffer, filename) {
//   return new Promise((resolve, reject) => {
//     ensureTempDirExists(); // Create temp directory if not exists

//     const tempInputPath = path.join(TEMP_DIR, filename);
//     const tempOutputPath = path.join(TEMP_DIR, `compressed-${filename}`);

//     fs.writeFileSync(tempInputPath, inputBuffer); // Save original file

//     ffmpeg(tempInputPath)
//       .setFfmpegPath(ffmpegInstaller.path) // Use installed FFmpeg
//       .output(tempOutputPath)
//       .videoCodec("libx264") // Use efficient H.264 encoding
//       .size("1280x720") // Resize to HD (if needed)
//       .on("end", () => {
//         const compressedBuffer = fs.readFileSync(tempOutputPath);
//         fs.unlinkSync(tempInputPath); // Delete original file
//         fs.unlinkSync(tempOutputPath); // Delete compressed file
//         resolve(compressedBuffer);
//       })
//       .on("error", (err) => {
//         console.error("FFmpeg Compression Error:", err);
//         reject(err);
//       })
//       .run();
//   });
// }

// // **🔹 Upload Image to Azure (For Small Image Files)**
// exports.uploadToAzure = async function (buffer, originalName) {
//   try {
//     const containerClient =
//       blobServiceClient.getContainerClient(IMAGE_CONTAINER_NAME);
//     const blobName = `images/${uuidv4()}-${originalName}`; // Store in "images/" folder
//     const blockBlobClient = containerClient.getBlockBlobClient(blobName);

//     await blockBlobClient.uploadData(buffer); // Small file upload

//     return blockBlobClient.url; // Return image URL
//   } catch (error) {
//     console.error("Azure Image Upload Error:", error);
//     throw new Error("Image upload failed.");
//   }
// };

// // **🔹 Upload Video to Azure (For Large Video Files)**
// exports.uploadVideoToAzure = async function (buffer, originalName) {
//   try {
//     const compressedBuffer = await compressVideo(buffer, originalName);
//     const containerClient =
//       blobServiceClient.getContainerClient(VIDEO_CONTAINER_NAME);
//     const blobName = `videos/${uuidv4()}-${originalName}`; // Store in "videos/" folder
//     const blockBlobClient = containerClient.getBlockBlobClient(blobName);

//     // **Use streaming upload for large video files**
//     const stream = Readable.from(compressedBuffer);
//     const uploadOptions = { bufferSize: 4 * 1024 * 1024, maxBuffers: 20 }; // Optimized for large files

//     await blockBlobClient.uploadStream(
//       stream,
//       uploadOptions.bufferSize,
//       uploadOptions.maxBuffers
//     );

//     return blockBlobClient.url; // Return video URL
//   } catch (error) {
//     console.error("Azure Video Upload Error:", error);
//     throw new Error("Video upload failed.");
//   }
// };

// // **🔹 Secure Video Streaming URL with SAS Token**
// exports.generateSasToken = async function (blobUrl, expiryMinutes = 60) {
//   try {
//     const blobName = blobUrl.split("/").pop(); // Extract blob name
//     const containerClient =
//       blobServiceClient.getContainerClient(VIDEO_CONTAINER_NAME);
//     const blockBlobClient = containerClient.getBlockBlobClient(blobName);

//     const sharedKeyCredential = new StorageSharedKeyCredential(
//       AZURE_STORAGE_ACCOUNT,
//       AZURE_STORAGE_ACCESS_KEY
//     );
//     const expiryDate = new Date();
//     expiryDate.setMinutes(expiryDate.getMinutes() + expiryMinutes); // Token expires in X minutes

//     const sasToken = generateBlobSASQueryParameters(
//       {
//         containerName: VIDEO_CONTAINER_NAME,
//         blobName,
//         permissions: BlobSASPermissions.parse("r"), // Read-only access
//         expiresOn: expiryDate,
//       },
//       sharedKeyCredential
//     ).toString();

//     return `${blockBlobClient.url}?${sasToken}`; // Secure streaming URL
//   } catch (error) {
//     console.error("SAS Token Error:", error);
//     throw new Error("Failed to generate SAS token.");
//   }
// };

// // **🔹 Delete File from Azure (Handles Both Images & Videos)**
// exports.deleteFromAzure = async function (fileUrl) {
//   try {
//     const blobName = fileUrl.split("/").pop(); // Extract blob name
//     let containerClient;

//     if (fileUrl.includes("/images/")) {
//       containerClient =
//         blobServiceClient.getContainerClient(IMAGE_CONTAINER_NAME);
//     } else if (fileUrl.includes("/videos/")) {
//       containerClient =
//         blobServiceClient.getContainerClient(VIDEO_CONTAINER_NAME);
//     } else {
//       throw new Error("Invalid file URL format.");
//     }

//     const blockBlobClient = containerClient.getBlockBlobClient(blobName);
//     await blockBlobClient.deleteIfExists();
//   } catch (error) {
//     console.error("Delete File Error:", error);
//     throw new Error("Failed to delete file.");
//   }
// };
