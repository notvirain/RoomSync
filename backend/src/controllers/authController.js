const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

const randomString = (length) =>
  Math.random()
    .toString(36)
    .slice(2, 2 + length)
    .toUpperCase();

const normalizeUsername = (value) => (value || "").toLowerCase().trim();

const generateUniqueMemberCode = async () => {
  for (let index = 0; index < 20; index += 1) {
    const candidate = `RSU-${randomString(6)}`;
    const existingUser = await User.findOne({ memberCode: candidate });
    if (!existingUser) {
      return candidate;
    }
  }

  throw new Error("Failed to generate unique member code");
};

const generateUniqueUsername = async (base) => {
  const cleanedBase = base
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 16);

  const safeBase = cleanedBase.length >= 3 ? cleanedBase : "user";

  const exact = await User.findOne({ username: safeBase });
  if (!exact) {
    return safeBase;
  }

  for (let index = 0; index < 25; index += 1) {
    const suffix = randomString(4).toLowerCase();
    const candidate = `${safeBase.slice(0, 15)}_${suffix}`;
    const existing = await User.findOne({ username: candidate });
    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Failed to generate unique username");
};

const toUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  username: user.username,
  memberCode: user.memberCode,
});

const ensureUserIdentityFields = async (user) => {
  let updated = false;

  if (!user.username) {
    user.username = await generateUniqueUsername(user.email.split("@")[0] || "user");
    updated = true;
  }

  if (!user.memberCode) {
    user.memberCode = await generateUniqueMemberCode();
    updated = true;
  }

  if (updated) {
    await user.save();
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: "Name, email, username and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = normalizeUsername(username);

    if (!USERNAME_REGEX.test(normalizedUsername)) {
      return res.status(400).json({
        message: "Username must be 3-20 chars and use only lowercase letters, numbers, and underscores",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const existingUsername = await User.findOne({ username: normalizedUsername });
    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const memberCode = await generateUniqueMemberCode();

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      username: normalizedUsername,
      memberCode,
      password: hashedPassword,
    });

    return res.status(201).json({
      token: generateToken(user._id),
      user: toUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await ensureUserIdentityFields(user);

    return res.status(200).json({
      token: generateToken(user._id),
      user: toUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed" });
  }
};

module.exports = { register, login };
