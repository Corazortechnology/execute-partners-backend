const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/Auth/User");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      // role: user.role,
      profile: user.profile,
      description: user.description,
      showEmail: user.showEmail,
      showPhone: user.showPhone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
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

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);
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
    const requestedUserId = req.params.id || req.user.id;
    const user = await User.findById(requestedUserId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const isOwner = req.user.id === user._id.toString();

    const userResponse = {
      _id: user._id,
      username: user.username,
      description: user.description,
      profile: user.profile,
      showEmail: user.showEmail,
      showPhone: user.showPhone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    if (isOwner || user.showEmail) {
      userResponse.email = user.email;
    }

    if (isOwner || user.showPhone) {
      userResponse.phone = user.phone;
    }

     if (isOwner) {
      userResponse.subscriptions = user.subscriptions;
      userResponse.subscribers = user.subscribers;
    }

    res.status(200).json({ user: userResponse });
  } catch (error) {
    console.error("Error fetching user profile:", error);
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

// ✅ Update User Profile (with optional Cloudinary image upload)
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, phone, description } = req.body;

    const updateFields = {};
    if (username !== undefined) updateFields.username = username;
    if (phone !== undefined) updateFields.phone = phone;
    if (description !== undefined) updateFields.description = description;

    if (req.body.showEmail !== undefined)
      updateFields.showEmail = req.body.showEmail;
    if (req.body.showPhone !== undefined)
      updateFields.showPhone = req.body.showPhone;

    // ✅ Handle image file upload if present
    if (req.file && req.file.path) {
      updateFields.profile = req.file.path; // Cloudinary auto-generated URL
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// Subscribe to a user
exports.subscribeToUser = async (req, res) => {
  try {
    // console.log("SUBSCRIBE HANDLER HIT");

    const currentUserId = req.user.id;
    const { targetUserId } = req.body;

    if (!targetUserId || currentUserId === targetUserId) {
      console.log("Invalid subscription request.");
      return res.status(400).json({ message: "Invalid subscription request" });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    if (!currentUser.subscriptions) currentUser.subscriptions = [];
    if (!targetUser.subscribers) targetUser.subscribers = [];

    const isAlreadySubscribed = currentUser.subscriptions.includes(targetUserId);
    if (!isAlreadySubscribed) {
      currentUser.subscriptions.push(targetUserId);
      targetUser.subscribers.push(currentUserId);

      await currentUser.save();
      await targetUser.save();

    } else {
      console.log("Already subscribed, skipping DB write.");
    }

    return res.status(200).json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error("Subscribe error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Unsubscribe from a user
exports.unsubscribeFromUser = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { targetUserId } = req.body;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    currentUser.subscriptions = currentUser.subscriptions.filter(
      (id) => id.toString() !== targetUserId
    );
    targetUser.subscribers = targetUser.subscribers.filter(
      (id) => id.toString() !== currentUserId
    );

    await currentUser.save();
    await targetUser.save();

    return res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
