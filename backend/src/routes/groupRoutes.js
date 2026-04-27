const express = require("express");
const { createGroup, getGroups, addMember, joinGroup } = require("../controllers/groupController");
const { protect } = require("../middleware/authMiddleware");
const { validateObjectIdParam } = require("../middleware/validateObjectId");

const router = express.Router();

router.post("/", protect, createGroup);
router.get("/", protect, getGroups);
router.post("/join", protect, joinGroup);
router.post("/:id/add-member", protect, validateObjectIdParam("id"), addMember);

module.exports = router;
