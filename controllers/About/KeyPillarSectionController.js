const KeyPillars = require("../../models/About/KeyPillarSectionModel");

// Fetch Key Pillars data
exports.getKeyPillars = async function (req, res) {
  try {
    const keyPillars = await KeyPillars.findOne({});
    if (!keyPillars) {
      return res.status(404).send({ error: "Key Pillars data not found." });
    }
    res.status(200).send(keyPillars);
  } catch (err) {
    res.status(500).send({ error: "Error fetching Key Pillars data." });
  }
};

// Create or Update Key Pillars data (Full Update)
exports.upsertKeyPillars = async function (req, res) {
  try {
    const { heading, description, cards } = req.body;

    // Validate input
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return res
        .status(400)
        .send({ error: "Cards data is required and must be an array." });
    }

    // Update or create the Key Pillars document
    const updatedKeyPillars = await KeyPillars.findOneAndUpdate(
      {}, // Match the first (and only) document
      { heading, description, cards },
      { new: true, upsert: true } // Upsert: create if not exists
    );

    res.status(200).send(updatedKeyPillars);
  } catch (err) {
    res.status(500).send({ error: "Error saving Key Pillars data." });
  }
};

// Update Key Pillars data (Partial Update)
exports.updateKeyPillars = async function (req, res) {
  try {
    const { heading, description, cards } = req.body;

    // Prepare the fields to update
    let updateData = {};
    if (heading) updateData.heading = heading;
    if (description) updateData.description = description;
    if (cards) updateData.cards = cards;

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .send({ error: "No valid fields provided for update." });
    }

    // Find and update the Key Pillars document
    const updatedKeyPillars = await KeyPillars.findOneAndUpdate(
      {}, // Match the first (and only) document
      { $set: updateData }, // Partial update of fields
      { new: true } // Return the updated document
    );

    if (!updatedKeyPillars) {
      return res.status(404).send({ error: "Key Pillars data not found." });
    }

    res.status(200).send(updatedKeyPillars);
  } catch (err) {
    res.status(500).send({ error: "Error updating Key Pillars data." });
  }
};
