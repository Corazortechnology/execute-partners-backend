const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/Auth/User");

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Signup Controller
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    let existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    const token = generateToken(newUser);
    res
      .status(201)
      .json({ message: "Signup successful", token, user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Signin Controller
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
  
    if (!user || !user.password)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password,user.password);
    console.log(isMatch)
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.json({ message: "Signin successful", token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Google OAuth Controller (Callback)
exports.googleAuth = async (req, res) => {
  try {
    const { id, email, displayName } = req.user;

    let user = await User.findOne({ googleId: id });
    if (!user) {
      user = new User({ googleId: id, email, username: displayName });
      await user.save();
    }

    const token = generateToken(user);
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get User Profile (Protected)
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
 

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error });
  }
};

exports.getAllUserProfile = async (req, res) => {
  try {
    const user = await User.find();
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error });
  }
};
