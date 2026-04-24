const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const Group = require("../models/Group");

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
      splitAmong: uniqueSplitAmong,
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate("paidBy", "name email")
      .populate("splitAmong", "name email")
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

    const expenses = await Expense.find({ group: groupId })
      .populate("paidBy", "name email")
      .populate("splitAmong", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(expenses);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

module.exports = {
  addExpense,
  getExpensesByGroup,
};
