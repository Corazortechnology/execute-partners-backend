const nodemailer = require("nodemailer");
const Email = require("../../models/Mail/Mail"); // Assuming you have an Email model

// Create Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send Email
exports.sendEmail = async (req, res) => {
  try {
    const { email, text } = req.body;

    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      email,
      text,
    };

    await transporter.sendMail(mailOptions);

    const emailRecord = new Email({ email, text });
    await emailRecord.save();

    res.status(200).json({ message: "Email sent successfully", emailRecord });
  } catch (error) {
    res.status(500).json({ message: "Error sending email", error });
  }
};

// Get All Emails
exports.getAllEmails = async (req, res) => {
  try {
    const emails = await Email.find();
    res.status(200).json(emails);
  } catch (error) {
    res.status(500).json({ message: "Error fetching emails", error });
  }
};

// Get Email by ID
exports.getEmailById = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) return res.status(404).json({ message: "Email not found" });
    res.status(200).json(email);
  } catch (error) {
    res.status(500).json({ message: "Error fetching email", error });
  }
};

// Update Email Record
exports.updateEmail = async (req, res) => {
  try {
    const email = await Email.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!email) return res.status(404).json({ message: "Email not found" });
    res.status(200).json(email);
  } catch (error) {
    res.status(500).json({ message: "Error updating email", error });
  }
};

// Delete Email
exports.deleteEmail = async (req, res) => {
  try {
    const email = await Email.findByIdAndDelete(req.params.id);
    if (!email) return res.status(404).json({ message: "Email not found" });
    res.status(200).json({ message: "Email deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting email", error });
  }
};
