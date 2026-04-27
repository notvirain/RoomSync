import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const asDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "-";

const GroupDetailsPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { groups, fetchGroups, addMemberToGroup, deleteGroup } = useAppContext();
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expenseToast, setExpenseToast] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [addingExpense, setAddingExpense] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState(false);

  const [memberUsername, setMemberUsername] = useState("");
  const [memberCode, setMemberCode] = useState("");
  const [expensePeriod, setExpensePeriod] = useState("all");
  const [expenseSort, setExpenseSort] = useState("newest");
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
    setSuccess("");

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
    document.body.dataset.page = "group";
    fetchGroups();
  }, [groupId]);

  useEffect(() => {
    loadDetails();
  }, [groupId]);

  useEffect(() => {
    if (!expenseToast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setExpenseToast("");
    }, 2200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [expenseToast]);

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

  const setAllSplitMembers = () => {
    const memberIds = (group?.members || []).map((member) => member._id);
    setExpenseForm((prev) => ({ ...prev, splitAmong: memberIds }));
  };

  const clearSplitMembers = () => {
    setExpenseForm((prev) => ({ ...prev, splitAmong: [] }));
  };

  const copyText = async (text, successMessage) => {
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setSuccess(successMessage);
      setError("");
    } catch (copyError) {
      setError("Copy failed. Please copy manually.");
    }
  };

  const submitAddMember = async (event) => {
    event.preventDefault();

    const username = memberUsername.trim().toLowerCase();
    const code = memberCode.trim().toUpperCase();

    if (!username && !code) {
      setError("Enter a username or a member code to invite someone.");
      return;
    }

    if (username && !/^[a-z0-9_]{3,20}$/.test(username)) {
      setError("Username format should be 3-20 lowercase characters, numbers, or underscore.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setAddingMember(true);
      await addMemberToGroup(groupId, {
        username: username || undefined,
        memberCode: code || undefined,
      });
      setMemberUsername("");
      setMemberCode("");
      setSuccess("Member invited successfully.");
      await loadDetails();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  const submitExpense = async (event) => {
    event.preventDefault();

    if (!expenseForm.description.trim()) {
      setError("Please add a short expense description.");
      return;
    }

    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) {
      setError("Please enter an amount greater than 0.");
      return;
    }

    if (!expenseForm.paidBy) {
      setError("Please select who paid.");
      return;
    }

    if (expenseForm.splitAmong.length === 0) {
      setError("Please select at least one member to split this expense.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setAddingExpense(true);
      await api.post("/expenses", {
        groupId,
        description: expenseForm.description,
        amount: Number(expenseForm.amount),
        paidBy: expenseForm.paidBy,
        splitAmong: expenseForm.splitAmong,
      });

      setExpenseForm({ description: "", amount: "", paidBy: "", splitAmong: [] });
      setExpenseToast("Expense added successfully.");
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

  const canDeleteGroup = group?.createdBy?._id === user?._id;

  const handleDeleteGroup = async () => {
    const shouldDelete = window.confirm("Delete this group and all its expenses?");
    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingGroup(true);
      await deleteGroup(groupId);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete group");
      setDeletingGroup(false);
    }
  };

  const filteredExpenses = expenses
    .filter((expense) => {
      if (expensePeriod === "all") {
        return true;
      }

      const created = new Date(expense.createdAt);
      const now = new Date();
      return (
        created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
      );
    })
    .sort((left, right) => {
      const leftTime = new Date(left.createdAt).getTime();
      const rightTime = new Date(right.createdAt).getTime();
      return expenseSort === "newest" ? rightTime - leftTime : leftTime - rightTime;
    });

  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const lastExpense = expenses[0];

  return (
    <div className="page-shell">
      {expenseToast ? <div className="toast-success">{expenseToast}</div> : null}

      <header className="top-bar">
        <div>
          <p className="caption">Group Details</p>
          <h1>{group?.name || "Group"}</h1>
        </div>
        <div className="action-row">
          {canDeleteGroup ? (
            <button
              type="button"
              className="danger-btn"
              onClick={handleDeleteGroup}
              disabled={deletingGroup}
            >
              {deletingGroup ? "Deleting..." : "Delete Group"}
            </button>
          ) : null}
          <Link to="/dashboard" className="secondary-btn link-btn">
            Back to Dashboard
          </Link>
        </div>
      </header>

      {error ? <p className="error-text">{error}</p> : null}
      {success ? <p className="success-text">{success}</p> : null}

      <section className="panel animate-rise">
        <h2>Balances</h2>
        {balances.length === 0 ? <p>No balances yet.</p> : null}
        <ul className="simple-list">
          {balances.map((entry) => (
            <li key={entry.userId}>
              {entry.name}: {entry.balance > 0 ? `+${inr.format(entry.balance)}` : inr.format(entry.balance)}
              <br />
              <span className="caption">
                {entry.balance > 0
                  ? `${entry.name} should receive ${inr.format(entry.balance)}`
                  : entry.balance < 0
                    ? `${entry.name} owes ${inr.format(Math.abs(entry.balance))}`
                    : `${entry.name} is settled up`}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <details className="dropdown-panel animate-rise" open>
        <summary>Group Summary</summary>
        <div className="summary-grid">
          <div className="summary-item">
            <p className="caption">Total expenses</p>
            <strong>{inr.format(totalExpenses)}</strong>
          </div>
          <div className="summary-item">
            <p className="caption">Members</p>
            <strong>{group?.members?.length || 0}</strong>
          </div>
          <div className="summary-item">
            <p className="caption">Last expense</p>
            <strong>{lastExpense ? asDateTime(lastExpense.createdAt) : "No expense yet"}</strong>
          </div>
          <div className="summary-item">
            <p className="caption">Group invite code</p>
            <div className="inline-copy">
              <strong>{group?.inviteCode || "-"}</strong>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => copyText(group?.inviteCode, "Group invite code copied.")}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
        <p className="caption">
          Created by {group?.createdBy?.name || "-"} on {asDateTime(group?.createdAt)}
        </p>
      </details>

      <details className="dropdown-panel animate-rise" open>
        <summary>Invite Members</summary>
        <form onSubmit={submitAddMember} className="inline-form nested-form">
          <input
            type="text"
            value={memberUsername}
            onChange={(event) => setMemberUsername(event.target.value)}
            placeholder="Invite by username"
            disabled={addingMember}
          />
          <input
            type="text"
            value={memberCode}
            onChange={(event) => setMemberCode(event.target.value)}
            placeholder="Or invite by member code"
            disabled={addingMember}
          />
          <button type="submit" disabled={addingMember}>
            {addingMember ? "Inviting..." : "Invite Member"}
          </button>
        </form>

        <h3 className="subheading">Current Members</h3>
        <ul className="simple-list">
          {(group?.members || []).map((member) => (
            <li key={member._id}>
              {member.name} ({member.email}) - @{member.username || "unknown"} - {member.memberCode || "-"}
            </li>
          ))}
        </ul>
      </details>

      <section className="panel animate-rise">
        <h2>Add Expense</h2>
        <form onSubmit={submitExpense} className="stack-form">
          <input
            type="text"
            placeholder="Description"
            value={expenseForm.description}
            disabled={addingExpense}
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
            disabled={addingExpense}
            onChange={(event) =>
              setExpenseForm((prev) => ({ ...prev, amount: event.target.value }))
            }
          />

          <select
            value={expenseForm.paidBy}
            disabled={addingExpense}
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
            <div className="split-toolbar">
              <button type="button" className="secondary-btn" onClick={setAllSplitMembers}>
                Select All
              </button>
              <button type="button" className="secondary-btn" onClick={clearSplitMembers}>
                Clear All
              </button>
              <span className="caption">{expenseForm.splitAmong.length} selected</span>
            </div>
            <div className="check-list">
              {(group?.members || []).map((member) => (
                <label key={member._id} className={expenseForm.splitAmong.includes(member._id) ? "is-selected" : ""}>
                  <input
                    type="checkbox"
                    checked={expenseForm.splitAmong.includes(member._id)}
                    disabled={addingExpense}
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

      <section className="panel animate-rise">
        <h2>Expenses</h2>

        <div className="filters-row compact-row">
          <select className="compact-select" value={expensePeriod} onChange={(event) => setExpensePeriod(event.target.value)}>
            <option value="all">All</option>
            <option value="thisMonth">This Month</option>
          </select>
          <select className="compact-select" value={expenseSort} onChange={(event) => setExpenseSort(event.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {filteredExpenses.length === 0 ? <p>No expenses for this filter yet.</p> : null}
        <ul className="simple-list">
          {filteredExpenses.map((expense) => (
            <li key={expense._id}>
              <strong>{expense.description || "Shared expense"}</strong> - {inr.format(Number(expense.amount || 0))} paid by {expense.paidBy?.name}
              <br />
              <span className="caption">
                Added by {expense.createdBy?.name || expense.paidBy?.name || "-"} on {asDateTime(expense.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
};

export default GroupDetailsPage;
