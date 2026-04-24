import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAppContext } from "../context/AppContext";

const GroupDetailsPage = () => {
  const { groupId } = useParams();
  const { groups, fetchGroups, addMemberToGroup } = useAppContext();
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [addingExpense, setAddingExpense] = useState(false);

  const [memberId, setMemberId] = useState("");
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    paidBy: "",
    splitAmong: [],
  });

  const group = useMemo(() => groups.find((item) => item._id === groupId), [groups, groupId]);

  const loadDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const [expensesRes, balancesRes] = await Promise.all([
        api.get(`/expenses/${groupId}`),
        api.get(`/balances/${groupId}`),
      ]);

      setExpenses(expensesRes.data);
      setBalances(balancesRes.data.balances || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load group details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [groupId]);

  useEffect(() => {
    loadDetails();
  }, [groupId]);

  const handleSplitToggle = (userId) => {
    setExpenseForm((prev) => {
      const exists = prev.splitAmong.includes(userId);
      return {
        ...prev,
        splitAmong: exists
          ? prev.splitAmong.filter((id) => id !== userId)
          : [...prev.splitAmong, userId],
      };
    });
  };

  const submitAddMember = async (event) => {
    event.preventDefault();
    if (!memberId.trim()) {
      setError("Member ID is required");
      return;
    }

    try {
      setError("");
      setAddingMember(true);
      await addMemberToGroup(groupId, memberId.trim());
      setMemberId("");
      await loadDetails();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  const submitExpense = async (event) => {
    event.preventDefault();

    if (!expenseForm.amount || !expenseForm.paidBy || expenseForm.splitAmong.length === 0) {
      setError("Amount, paidBy, and splitAmong are required");
      return;
    }

    try {
      setError("");
      setAddingExpense(true);
      await api.post("/expenses", {
        groupId,
        description: expenseForm.description,
        amount: Number(expenseForm.amount),
        paidBy: expenseForm.paidBy,
        splitAmong: expenseForm.splitAmong,
      });

      setExpenseForm({ description: "", amount: "", paidBy: "", splitAmong: [] });
      await loadDetails();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add expense");
    } finally {
      setAddingExpense(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading group details..." />;
  }

  return (
    <div className="page-shell">
      <header className="top-bar">
        <div>
          <p className="caption">Group Details</p>
          <h1>{group?.name || "Group"}</h1>
        </div>
        <Link to="/dashboard" className="secondary-btn link-btn">
          Back to Dashboard
        </Link>
      </header>

      {error ? <p className="error-text">{error}</p> : null}

      <section className="panel">
        <h2>Members</h2>
        <ul className="simple-list">
          {(group?.members || []).map((member) => (
            <li key={member._id}>
              {member.name} ({member.email})
            </li>
          ))}
        </ul>

        <form onSubmit={submitAddMember} className="inline-form">
          <input
            type="text"
            value={memberId}
            onChange={(event) => setMemberId(event.target.value)}
            placeholder="Member user ID"
            disabled={addingMember}
          />
          <button type="submit" disabled={addingMember}>
            {addingMember ? "Adding..." : "Add Member"}
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>Add Expense</h2>
        <form onSubmit={submitExpense} className="stack-form">
          <input
            type="text"
            placeholder="Description"
            value={expenseForm.description}
            onChange={(event) =>
              setExpenseForm((prev) => ({ ...prev, description: event.target.value }))
            }
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Amount"
            value={expenseForm.amount}
            onChange={(event) =>
              setExpenseForm((prev) => ({ ...prev, amount: event.target.value }))
            }
          />

          <select
            value={expenseForm.paidBy}
            onChange={(event) => setExpenseForm((prev) => ({ ...prev, paidBy: event.target.value }))}
          >
            <option value="">Select who paid</option>
            {(group?.members || []).map((member) => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>

          <div>
            <p className="caption">Split among</p>
            <div className="check-list">
              {(group?.members || []).map((member) => (
                <label key={member._id}>
                  <input
                    type="checkbox"
                    checked={expenseForm.splitAmong.includes(member._id)}
                    onChange={() => handleSplitToggle(member._id)}
                  />
                  {member.name}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={addingExpense}>
            {addingExpense ? "Adding..." : "Add Expense"}
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>Expenses</h2>
        {expenses.length === 0 ? <p>No expenses yet.</p> : null}
        <ul className="simple-list">
          {expenses.map((expense) => (
            <li key={expense._id}>
              <strong>{expense.description || "Shared expense"}</strong> - ${expense.amount.toFixed(2)} paid by {expense.paidBy?.name}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Balances</h2>
        {balances.length === 0 ? <p>No balances yet.</p> : null}
        <ul className="simple-list">
          {balances.map((entry) => (
            <li key={entry.userId}>
              {entry.name}: {entry.balance > 0 ? `+${entry.balance}` : entry.balance}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default GroupDetailsPage;
