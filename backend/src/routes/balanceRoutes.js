const express = require("express");
const { getGroupBalances } = require("../controllers/balanceController");
const { protect } = require("../middleware/authMiddleware");
const { validateObjectIdParam } = require("../middleware/validateObjectId");

const router = express.Router();

router.get("/:groupId", protect, validateObjectIdParam("groupId"), getGroupBalances);

module.exports = router;
