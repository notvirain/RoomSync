import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { groups, groupsLoading, groupsError, fetchGroups, createGroup } = useAppContext();
  const [groupName, setGroupName] = useState("");
  const [localError, setLocalError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (event) => {
    event.preventDefault();
    setLocalError("");

    if (!groupName.trim()) {
      setLocalError("Group name is required");
      return;
    }

    try {
      setCreating(true);
      await createGroup(groupName.trim());
      setGroupName("");
    } catch (error) {
      setLocalError(error.response?.data?.message || "Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page-shell">
      <header className="top-bar">
        <div>
          <p className="caption">Welcome</p>
          <h1>{user?.name || "User"}</h1>
        </div>
        <button onClick={logout} className="secondary-btn">
          Logout
        </button>
      </header>

      <section className="panel">
        <h2>Create Group</h2>
        <form onSubmit={handleCreateGroup} className="inline-form">
          <input
            type="text"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            placeholder="e.g. Flat 4A"
          />
          <button type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create"}
          </button>
        </form>
        {localError ? <p className="error-text">{localError}</p> : null}
      </section>

      <section className="panel">
        <h2>Your Groups</h2>
        {groupsLoading ? <LoadingSpinner message="Loading groups..." /> : null}
        {groupsError ? <p className="error-text">{groupsError}</p> : null}

        {!groupsLoading && groups.length === 0 ? <p>No groups yet.</p> : null}

        <div className="group-list">
          {groups.map((group) => (
            <Link key={group._id} to={`/groups/${group._id}`} className="group-card">
              <h3>{group.name}</h3>
              <p>{group.members.length} member(s)</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
