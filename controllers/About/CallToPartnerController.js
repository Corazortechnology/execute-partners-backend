const CallToPartner = require("../../models/About/CallToPartnerModel");

// Fetch CallToPartner section
exports.getCallToPartner = async function (req, res) {
  try {
    const callToPartner = await CallToPartner.findOne({});
    if (!callToPartner) {
      return res
        .status(404)
        .send({ error: "Call to Partner section not found." });
    }
    res.status(200).send(callToPartner);
  } catch (err) {
    res.status(500).send({ error: "Error fetching Call to Partner section." });
  }
};

// Update or Create CallToPartner section
exports.upsertCallToPartner = async function (req, res) {
  try {
    const { title, buttonText } = req.body;

    const updatedSection = await CallToPartner.findOneAndUpdate(
      {},
      { title, buttonText },
      { new: true, upsert: true }
    );

    res.status(200).send(updatedSection);
  } catch (err) {
    res.status(500).send({ error: "Error saving Call to Partner section." });
  }
};

// Delete CallToPartner section
exports.deleteCallToPartner = async function (req, res) {
  try {
    const callToPartner = await CallToPartner.findOneAndDelete({});
    if (!callToPartner) {
      return res
        .status(404)
        .send({ error: "Call to Partner section not found." });
    }
    res
      .status(200)
      .send({ message: "Call to Partner section deleted successfully." });
  } catch (err) {
    res.status(500).send({ error: "Error deleting Call to Partner section." });
  }
};
