const Group = require("../models/Group");
const User = require("../models/User");

const randomGroupCode = () =>
  `GRP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const generateUniqueInviteCode = async () => {
  for (let index = 0; index < 20; index += 1) {
    const candidate = randomGroupCode();
    const existingGroup = await Group.findOne({ inviteCode: candidate });
    if (!existingGroup) {
      return candidate;
    }
  }

  throw new Error("Failed to generate invite code");
};

const userProjection = "name email username memberCode";

const createGroup = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const group = await Group.create({
      name: name.trim(),
      inviteCode: await generateUniqueInviteCode(),
      createdBy: req.user._id,
      members: [req.user._id],
    });

    const populatedGroup = await Group.findById(group._id)
      .populate("createdBy", userProjection)
      .populate("members", userProjection);

    return res.status(201).json(populatedGroup);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create group" });
  }
};

const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate("createdBy", userProjection)
      .populate("members", userProjection)
      .sort({ createdAt: -1 });

    return res.status(200).json(groups);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch groups" });
  }
};

const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, memberCode } = req.body;
    const normalizedUsername = (username || "").toLowerCase().trim();
    const normalizedMemberCode = (memberCode || "").toUpperCase().trim();

    if (!normalizedUsername && !normalizedMemberCode) {
      return res.status(400).json({ message: "Provide either username or member code" });
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

    const memberUser = await User.findOne(
      normalizedUsername ? { username: normalizedUsername } : { memberCode: normalizedMemberCode }
    );

    if (!memberUser) {
      return res.status(404).json({ message: "No user found for this username/member code" });
    }

    const memberId = memberUser._id.toString();

    const isAlreadyMember = group.members.some(
      (member) => member.toString() === memberId
    );

    if (isAlreadyMember) {
      return res.status(400).json({ message: "User is already in this group" });
    }

    group.members.push(memberId);
    await group.save();

    const updatedGroup = await Group.findById(id)
      .populate("createdBy", userProjection)
      .populate("members", userProjection);

    return res.status(200).json(updatedGroup);
  } catch (error) {
    return res.status(500).json({ message: "Failed to add member" });
  }
};

const joinGroup = async (req, res) => {
  try {
    const inviteCode = (req.body.inviteCode || "").toUpperCase().trim();

    if (!inviteCode) {
      return res.status(400).json({ message: "Invite code is required" });
    }

    const group = await Group.findOne({ inviteCode });
    if (!group) {
      return res.status(404).json({ message: "Group not found for this invite code" });
    }

    const alreadyMember = group.members.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (!alreadyMember) {
      group.members.push(req.user._id);
      await group.save();
    }

    const updatedGroup = await Group.findById(group._id)
      .populate("createdBy", userProjection)
      .populate("members", userProjection);

    return res.status(200).json(updatedGroup);
  } catch (error) {
    return res.status(500).json({ message: "Failed to join group" });
  }
};

module.exports = {
  createGroup,
  getGroups,
  addMember,
  joinGroup,
};
