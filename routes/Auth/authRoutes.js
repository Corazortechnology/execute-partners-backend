const express = require("express");
const passport = require("passport");
const {
  signup,
  signin,
  googleAuth,
  getUserProfile,
} = require("../../controllers/Auth/authController");
const authMiddleware = require("../../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/profile", authMiddleware, getUserProfile);

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

module.exports = router;
