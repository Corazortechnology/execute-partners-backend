const PartnerRequest = require("../../models/About/PartnerRequest");

// Submit a Partner Request
exports.createPartnerRequest = async (req, res) => {
  try {
    const { name, email, companyName, companyType, aboutCompany } = req.body;

    if (!name || !email || !companyName || !companyType || !aboutCompany) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newPartner = new PartnerRequest({
      name,
      email,
      companyName,
      companyType,
      aboutCompany,
    });
    await newPartner.save();

    res.status(201).json({ message: "Partner request submitted successfully" });
  } catch (error) {
    console.error("Error submitting partner request:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Fetch all Partner Requests (optional, for admin use)
exports.getAllPartnerRequests = async (req, res) => {
  try {
    const partners = await PartnerRequest.find().sort({ createdAt: -1 });
    res.status(200).json(partners);
  } catch (error) {
    console.error("Error fetching partner requests:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
