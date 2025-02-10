const express = require("express");
const passport = require("passport");
const {
  signup,
  signin,
  googleAuth,
} = require("../../controllers/Auth/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);

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
