const Expense = require("../models/Expense");
const Group = require("../models/Group");

const cleanupByRetention = async (group) => {
  const retentionDays = Number(group.expenseRetentionDays || 3650);
  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  await Expense.deleteMany({ group: group._id, createdAt: { $lt: cutoffDate } });
};

const getGroupBalances = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId).populate("members", "name email");
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const requesterInGroup = group.members.some(
      (member) => member._id.toString() === req.user._id.toString()
    );

    if (!requesterInGroup) {
      return res.status(403).json({ message: "Not allowed to view balances for this group" });
    }

    await cleanupByRetention(group);

    const expenses = await Expense.find({ group: groupId });

    const balancesMap = new Map();

    group.members.forEach((member) => {
      balancesMap.set(member._id.toString(), {
        userId: member._id,
        name: member.name,
        email: member.email,
        balance: 0,
      });
    });

    expenses.forEach((expense) => {
      const splitCount = expense.splitAmong.length;
      if (splitCount === 0) {
        return;
      }

      const splitAmount = expense.amount / splitCount;
      const paidById = expense.paidBy.toString();

      expense.splitAmong.forEach((splitUserIdObj) => {
        const splitUserId = splitUserIdObj.toString();

        if (splitUserId !== paidById) {
          const debtorEntry = balancesMap.get(splitUserId);
          const creditorEntry = balancesMap.get(paidById);

          if (debtorEntry) {
            debtorEntry.balance -= splitAmount;
          }

          if (creditorEntry) {
            creditorEntry.balance += splitAmount;
          }
        }
      });
    });

    const balances = Array.from(balancesMap.values()).map((entry) => ({
      ...entry,
      balance: Number(entry.balance.toFixed(2)),
    }));

    return res.status(200).json({
      group: {
        _id: group._id,
        name: group.name,
      },
      balances,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to calculate balances" });
  }
};

module.exports = { getGroupBalances };
