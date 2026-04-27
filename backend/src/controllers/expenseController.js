const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const Group = require("../models/Group");

const userProjection = "name email username memberCode";

const cleanupByRetention = async (group) => {
  const retentionDays = Number(group.expenseRetentionDays || 3650);
  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  await Expense.deleteMany({ group: group._id, createdAt: { $lt: cutoffDate } });
};

const addExpense = async (req, res) => {
  try {
    const { groupId, amount, paidBy, splitAmong, description } = req.body;

    if (!groupId || !amount || !paidBy || !Array.isArray(splitAmong)) {
      return res.status(400).json({ message: "groupId, amount, paidBy, splitAmong are required" });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid groupId" });
    }

    if (!mongoose.Types.ObjectId.isValid(paidBy)) {
      return res.status(400).json({ message: "Invalid paidBy" });
    }

    if (splitAmong.length === 0) {
      return res.status(400).json({ message: "splitAmong cannot be empty" });
    }

    const hasInvalidSplitId = splitAmong.some(
      (userId) => !mongoose.Types.ObjectId.isValid(userId)
    );

    if (hasInvalidSplitId) {
      return res.status(400).json({ message: "splitAmong contains invalid user id" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const requesterInGroup = group.members.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (!requesterInGroup) {
      return res.status(403).json({ message: "Not allowed to add expense in this group" });
    }

    const groupMemberSet = new Set(group.members.map((member) => member.toString()));

    if (!groupMemberSet.has(paidBy)) {
      return res.status(400).json({ message: "paidBy must be a group member" });
    }

    const uniqueSplitAmong = [...new Set(splitAmong.map((id) => id.toString()))];

    const splitHasNonMember = uniqueSplitAmong.some((memberId) => !groupMemberSet.has(memberId));
    if (splitHasNonMember) {
      return res.status(400).json({ message: "All splitAmong users must belong to the group" });
    }

    const expense = await Expense.create({
      group: groupId,
      description: description ? description.trim() : "",
      amount: Number(amount),
      paidBy,
      createdBy: req.user._id,
      splitAmong: uniqueSplitAmong,
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate("paidBy", userProjection)
      .populate("createdBy", userProjection)
      .populate("splitAmong", userProjection)
      .populate("group", "name");

    return res.status(201).json(populatedExpense);
  } catch (error) {
    return res.status(500).json({ message: "Failed to add expense" });
  }
};

const getExpensesByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const requesterInGroup = group.members.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (!requesterInGroup) {
      return res.status(403).json({ message: "Not allowed to view expenses of this group" });
    }

    await cleanupByRetention(group);

    const expenses = await Expense.find({ group: groupId })
      .populate("paidBy", userProjection)
      .populate("createdBy", userProjection)
      .populate("splitAmong", userProjection)
      .sort({ createdAt: -1 });

    return res.status(200).json(expenses);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

const deleteOlderExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { beforeDate } = req.body;

    const cutoff = new Date(beforeDate);
    if (!beforeDate || Number.isNaN(cutoff.getTime())) {
      return res.status(400).json({ message: "Valid beforeDate is required" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the group owner can delete older expenses" });
    }

    const result = await Expense.deleteMany({
      group: groupId,
      createdAt: { $lt: cutoff },
    });

    return res.status(200).json({
      message: "Older expenses deleted",
      deletedCount: result.deletedCount || 0,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete older expenses" });
  }
};

module.exports = {
  addExpense,
  getExpensesByGroup,
  deleteOlderExpenses,
};
