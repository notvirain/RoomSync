const express = require("express");
const { register, login, updateProfile, deleteProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put("/profile", protect, updateProfile);
router.delete("/profile", protect, deleteProfile);

module.exports = router;
