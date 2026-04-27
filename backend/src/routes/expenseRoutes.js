const express = require("express");
const { addExpense, getExpensesByGroup, deleteOlderExpenses } = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");
const { validateObjectIdParam } = require("../middleware/validateObjectId");

const router = express.Router();

router.post("/", protect, addExpense);
router.get("/:groupId", protect, validateObjectIdParam("groupId"), getExpensesByGroup);
router.delete("/:groupId/older", protect, validateObjectIdParam("groupId"), deleteOlderExpenses);

module.exports = router;
