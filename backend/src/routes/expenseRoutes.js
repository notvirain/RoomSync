const express = require("express");
const { addExpense, getExpensesByGroup } = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");
const { validateObjectIdParam } = require("../middleware/validateObjectId");

const router = express.Router();

router.post("/", protect, addExpense);
router.get("/:groupId", protect, validateObjectIdParam("groupId"), getExpensesByGroup);

module.exports = router;
