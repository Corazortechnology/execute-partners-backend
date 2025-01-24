const CareerCard = require("../../models/Career/Career");

exports.getCard = async (req, res) => {
  try {
    const card = await CareerCard.findOne();

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    res.status(200).json({
      message: "Card retrieved successfully",
      data: card,
    });
  } catch (err) {
    res.status(500).json({ message: "Error retrieving Card", error: err });
  }
};

exports.addCard = async (req, res) => {
  try {
    const { heading, description } = req.body;
    const newCard = await CareerCard.create({
      heading,
      description,
    });
    res.status(201).json({
      message: "Card created successfully",
      data: newCard,
    });
  } catch (err) {
    res.status(500).json({ message: "Error creating Card", error: err });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const { heading, description } = req.body;
    const updateCard = await CareerCard.findOneAndUpdate(
      {},
      { $set: { heading, description } },
      { new: true }
    );
    res.status(200).json({
      message: "Card updated successfully",
      data: updateCard,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating Card", error: error });
  }
};
