const User = require("../../models/Auth/User");

const adminController = {
  // Create a new admin with all provided fields (username, email, password, googleId)
  createAdmin: async (req, res) => {
    try {
      // Only superAdmin can create admin users
      if (req.user.role !== "superAdmin") {
        return res
          .status(403)
          .json({ error: "Unauthorized. Only superAdmins can create admins." });
      }

      const { username, email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required." });
      }

      // Check if a user with this email already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ error: "User already exists." });
      }

      // Create a new user with the role of "admin"
      user = new User({
        username,
        email,
        password,
        role: "admin",
      });

      await user.save();

      return res.status(201).json({
        message: "Admin created successfully.",
        user,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Internal server error.",
        details: error.message,
      });
    }
  },

  // Demote an admin to a regular user
  removeAdmin: async (req, res) => {
    try {
      // Only superAdmin can remove admin privileges
      if (req.user.role !== "superAdmin") {
        return res
          .status(403)
          .json({ error: "Unauthorized. Only superAdmins can remove admins." });
      }

      const { email } = req.body;
      if (!email) {
        return res
          .status(400)
          .json({ error: "Email is required to remove admin privileges." });
      }

      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      // Ensure the user currently has the admin role
      if (user.role !== "admin") {
        return res.status(400).json({ error: "User is not an admin." });
      }

      // Demote the user by setting the role to "user"
      user.role = "user";
      await user.save();

      return res.status(200).json({
        message: "Admin role has been successfully removed.",
        user,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Internal server error.",
        details: error.message,
      });
    }
  },

  // Retrieve all admin users with full details
  getAllAdmins: async (req, res) => {
    try {
      // Only superAdmin can view all admin data
      if (req.user.role !== "superAdmin") {
        return res.status(403).json({
          error: "Unauthorized. Only superAdmins can view admin data.",
        });
      }

      // Retrieve all users with the role "admin"
      const admins = await User.find({ role: "admin" });
      return res.status(200).json({ admins });
    } catch (error) {
      return res.status(500).json({
        error: "Internal server error.",
        details: error.message,
      });
    }
  },
};

module.exports = adminController;
