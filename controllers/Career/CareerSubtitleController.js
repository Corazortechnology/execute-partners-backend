const CareerSubtitle = require("..../models/Career.js");

exports.getSubtitle = async (req, res) => {
  try {
    const subtitle = await CareerSubtitle.findOne();

    if (!subtitle) {
      return res.status(404).json({ message: "Subtitle not found" });
    }

    res.status(200).json({
      message: "Subtitle retrieved successfully",
      data: subtitle,
    });
  } catch (err) {
    res.status(500).json({ message: "Error retrieving Subtitle", error: err });
  }
};

exports.addSubtitle = async (req, res) => {
  try {
    const { subtitle } = req.body;
    const newSubtitle = await CareerSubtitle.create({
      subtitle,
    });
    res.status(201).json({
      message: "Subtitle created successfully",
      data: newSubtitle,
    });
  } catch (err) {
    res.status(500).json({ message: "Error creating Subtitle", error: err });
  }
};

exports.updateSubtitle = async (req, res) => {
  try {
    const { subtitle } = req.body;
    const updateSubtitle = await CareerSubtitle.findOneAndUpdate(
      {},
      { $set: { subtitle } },
      { new: true }
    );
    res.status(200).json({
      message: "Subtitle updated successfully",
      data: updateSubtitle,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating Subtitle", error: error });
  }
};
