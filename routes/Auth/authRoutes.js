const express = require("express");
const passport = require("passport");
const {
  signup,
  signin,
  googleAuth,
  getUserProfile,
  getAllUserProfile,
  updateUserProfile
} = require("../../controllers/Auth/authController");
const authMiddleware = require("../../middlewares/authMiddleware");
const adminController = require("../../controllers/Auth/adminController");
const uploadProfile = require("../../config/multerUser")

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/profile", authMiddleware, getUserProfile);
router.get("/AllUsers", getAllUserProfile);
router.put("/profile", authMiddleware, uploadProfile.single("profile"), updateUserProfile);

// Google OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleAuth
);

// Route to create a new admin
router.post("/admins", authMiddleware, adminController.createAdmin);

// Route to remove admin privileges
router.delete("/admins", authMiddleware, adminController.removeAdmin);

// Route to get all admin users
router.get("/admins", authMiddleware, adminController.getAllAdmins);

module.exports = router;
