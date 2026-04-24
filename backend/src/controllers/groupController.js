const mongoose = require("mongoose");
const Group = require("../models/Group");
const User = require("../models/User");

const createGroup = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const group = await Group.create({
      name: name.trim(),
      createdBy: req.user._id,
      members: [req.user._id],
    });

    const populatedGroup = await Group.findById(group._id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    return res.status(201).json(populatedGroup);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create group" });
  }
};

const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(groups);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch groups" });
  }
};

const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({ message: "memberId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: "Invalid memberId" });
    }

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const requesterInGroup = group.members.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (!requesterInGroup) {
      return res.status(403).json({ message: "Not allowed to modify this group" });
    }

    const memberUser = await User.findById(memberId);
    if (!memberUser) {
      return res.status(404).json({ message: "Member user not found" });
    }

    const isAlreadyMember = group.members.some(
      (member) => member.toString() === memberId
    );

    if (isAlreadyMember) {
      return res.status(400).json({ message: "User is already in this group" });
    }

    group.members.push(memberId);
    await group.save();

    const updatedGroup = await Group.findById(id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    return res.status(200).json(updatedGroup);
  } catch (error) {
    return res.status(500).json({ message: "Failed to add member" });
  }
};

module.exports = {
  createGroup,
  getGroups,
  addMember,
};
