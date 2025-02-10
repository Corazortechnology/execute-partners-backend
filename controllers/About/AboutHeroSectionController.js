const About = require("../../models/About/AboutHeroSectionModel");

// Fetch the "About Us" data
exports.getAbout = async function (req, res) {
  try {
    const about = await About.findOne({});
    if (!about) {
      return res.status(404).send({ message: "About Us data not found." });
    }
    res.status(200).send(about);
  } catch (err) {
    res.status(500).send({ error: "Server error while fetching data." });
  }
};

// Create "About Us" data
exports.createAbout = async function (req, res) {
  const { heading, description } = req.body;

  try {
    const about = new About({
      heading,
      description,
    });

    const savedAbout = await about.save();
    res.status(201).send(savedAbout);
  } catch (err) {
    res.status(500).send({ error: "Server error while saving data." });
  }
};

// Update "About Us" data
exports.updateAbout = async function (req, res) {
  const { heading, description } = req.body;

  try {
    const updatedAbout = await About.findOneAndUpdate(
      {},
      { heading, description },
      { new: true, upsert: true }
    );

    res.status(200).send(updatedAbout);
  } catch (err) {
    res.status(500).send({ error: "Server error while updating data." });
  }
};

// const About = require("../../models/About/AboutHeroSectionModel");
// const {
//   uploadVideoToAzure,
//   generateSasToken,
//   uploadToAzure,
//   deleteFromAzure,
// } = require("../../services/azureBlobService");

// // **🔹 Fetch "About Us" Data**
// exports.getAbout = async function (req, res) {
//   try {
//     const about = await About.findOne({});
//     if (!about) {
//       return res.status(404).send({ message: "About Us data not found." });
//     }

//     // If mediaType is video, generate a secure SAS token
//     let mediaUrl = about.mediaUrl;
//     if (about.mediaType === "video" && about.mediaUrl) {
//       const blobName = about.mediaUrl.split("/").pop(); // Extract blob name
//       mediaUrl = await generateSasToken(blobName, 120); // Secure for 2 hours
//     }

//     res.status(200).send({ ...about.toObject(), mediaUrl });
//   } catch (err) {
//     console.error("Error fetching About data:", err);
//     res.status(500).send({ error: "Server error while fetching data." });
//   }
// };

// // **🔹 Create "About Us" Data with Image/Video Upload**
// exports.createAbout = async function (req, res) {
//   const { heading, description } = req.body;
//   const file = req.file;

//   try {
//     let mediaUrl = null;
//     let mediaType = null;

//     if (file) {
//       const fileExtension = file.originalname.split(".").pop().toLowerCase();

//       if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension)) {
//         mediaUrl = await uploadToAzure(file.buffer, file.originalname);
//         mediaType = "image";
//       } else if (
//         ["mp4", "mov", "avi", "wmv", "mkv", "flv"].includes(fileExtension)
//       ) {
//         mediaUrl = await uploadVideoToAzure(file.buffer, file.originalname);
//         mediaType = "video";
//       } else {
//         return res.status(400).json({ message: "Unsupported file format" });
//       }
//     }

//     const about = new About({
//       heading,
//       description,
//       mediaUrl,
//       mediaType,
//     });

//     const savedAbout = await about.save();
//     res
//       .status(201)
//       .json({ message: "About created successfully", data: savedAbout });
//   } catch (err) {
//     console.error("Error creating About:", err);
//     res.status(500).json({ error: "Server error while saving data." });
//   }
// };

// // **🔹 Update "About Us" Data (With New Image/Video Upload)**
// exports.updateAbout = async function (req, res) {
//   const { heading, description } = req.body;
//   const file = req.file;

//   try {
//     // Find the existing About document
//     const existingAbout = await About.findOne({});

//     let mediaUrl = existingAbout?.mediaUrl || null;
//     let mediaType = existingAbout?.mediaType || null;

//     // Check if a new file is uploaded
//     if (file) {
//       const fileExtension = file.originalname.split(".").pop().toLowerCase();

//       // Determine media type (image or video)
//       if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension)) {
//         mediaType = "image";
//         mediaUrl = await uploadToAzure(file.buffer, file.originalname);
//       } else if (
//         ["mp4", "mov", "avi", "wmv", "mkv", "flv"].includes(fileExtension)
//       ) {
//         mediaType = "video";
//         mediaUrl = await uploadVideoToAzure(file.buffer, file.originalname);
//       } else {
//         return res.status(400).json({ message: "Unsupported file format" });
//       }

//       // **🔹 Delete Old Media from Azure Blob Storage**
//       if (existingAbout?.mediaUrl) {
//         await deleteFromAzure(existingAbout.mediaUrl);
//       }
//     }

//     // Update About record with new media
//     const updatedAbout = await About.findOneAndUpdate(
//       {},
//       { heading, description, mediaUrl, mediaType },
//       { new: true, upsert: true }
//     );

//     res
//       .status(200)
//       .json({ message: "About updated successfully", data: updatedAbout });
//   } catch (err) {
//     console.error("Error updating About:", err);
//     res.status(500).json({ error: "Server error while updating data." });
//   }
// };
