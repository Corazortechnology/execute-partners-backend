const Quote = require("../../models/Contact Us/quoteModel");

// Get Quote
exports.getQuote = async (req, res) => {
  try {
    const quote = await Quote.findOne();
    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }
    res.status(200).json({ message: "Quote fetched successfully", data: quote });
  } catch (error) {
    res.status(500).json({ message: "Error fetching quote", error });
  }
};

// Edit/Upsert Quote
exports.editQuote = async (req, res) => {
  try {
    const { quoteText } = req.body;

    const updateData = { quoteText };

    const updatedQuote = await Quote.findOneAndUpdate({}, updateData, {
      new: true,
      upsert: true,
    });

    res.status(200).json({
      message: "Quote updated successfully",
      data: updatedQuote,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating quote", error });
  }
};
