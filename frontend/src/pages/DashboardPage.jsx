import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import Icon from "../components/Icon";
import SkeletonLoader from "../components/SkeletonLoader";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { groups, groupsLoading, groupsError, fetchGroups, createGroup, joinGroup } = useAppContext();
  const [groupName, setGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [localError, setLocalError] = useState("");
  const [localSuccess, setLocalSuccess] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [hasRetried, setHasRetried] = useState(false);

  useEffect(() => {
    document.body.dataset.page = "dashboard";
  }, []);

  useEffect(() => {
    if (user?._id) {
      fetchGroups();
    }
  }, [user?._id]);

  useEffect(() => {
    if (!groupsLoading && !groupsError && groups.length === 0 && !hasRetried) {
      setHasRetried(true);
      const retryTimer = window.setTimeout(() => {
        fetchGroups();
      }, 650);

      return () => {
        window.clearTimeout(retryTimer);
      };
    }
    return undefined;
  }, [groupsLoading, groupsError, groups.length, hasRetried]);

  const handleCreateGroup = async (event) => {
    event.preventDefault();
    setLocalError("");
    setLocalSuccess("");

    if (!groupName.trim()) {
      setLocalError("Please enter a group name.");
      return;
    }

    try {
      setCreating(true);
      await createGroup(groupName.trim());
      setGroupName("");
      setLocalSuccess("Group created successfully.");
    } catch (error) {
      setLocalError(error.response?.data?.message || "Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGroup = async (event) => {
    event.preventDefault();
    setLocalError("");
    setLocalSuccess("");

    const inviteCode = joinCode.trim().toUpperCase();
    if (!inviteCode) {
      setLocalError("Please enter an invite code to join a group.");
      return;
    }

    try {
      setJoining(true);
      await joinGroup(inviteCode);
      setJoinCode("");
      setLocalSuccess("Joined group successfully.");
    } catch (error) {
      setLocalError(error.response?.data?.message || "Failed to join group");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="page-shell">
      <header className="top-bar">
        <div>
          <p className="caption">Welcome</p>
          <h1>{user?.name || "User"}</h1>
        </div>
        <div className="action-row">
          <Link to="/profile" className="profile-icon-link" title="Open profile page" aria-label="Open profile page">
            👤
          </Link>
          <button onClick={logout} className="secondary-btn">
            Logout
          </button>
        </div>
      </header>

      <section className="panel animate-rise">
        <h2>Start or Join</h2>
        <div className="option-grid">
          <div className="option-card">
            <h3>Create a Group</h3>
            <p className="caption">Start a new room, trip, or event expense group.</p>
            <form onSubmit={handleCreateGroup} className="inline-form">
              <input
                type="text"
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                placeholder="e.g. Flat 4A"
                disabled={creating || joining}
              />
              <button type="submit" disabled={creating || joining}>
                {creating ? "Creating..." : "Create"}
              </button>
            </form>
          </div>

          <div className="option-card">
            <h3>Join a Group</h3>
            <p className="caption">Paste a group invite code shared by a member.</p>
            <form onSubmit={handleJoinGroup} className="inline-form">
              <input
                type="text"
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value)}
                placeholder="e.g. GRP-ABC123"
                disabled={creating || joining}
              />
              <button type="submit" disabled={creating || joining}>
                {joining ? "Joining..." : "Join"}
              </button>
            </form>
          </div>
        </div>
        {localError ? <p className="error-text">{localError}</p> : null}
        {localSuccess ? <p className="success-text">{localSuccess}</p> : null}
      </section>

      <section className="panel animate-rise">
        <h2>Your Groups</h2>
        {groupsError ? <p className="error-text">{groupsError}</p> : null}

        {groupsLoading ? (
          <div>
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
          </div>
        ) : null}

        {!groupsLoading && groups.length === 0 ? (
          <div className="empty-state" style={{ display: "flex", alignItems: "center" }}>
            <span className="icon"><Icon name="group" /></span>
            <div>
              <p>No groups yet. Start by creating one or joining with an invite code.</p>
              <div className="action-row">
                <button type="button" className="secondary-btn" onClick={() => setGroupName("My First Group")}>Use Sample Group Name</button>
                <button type="button" className="secondary-btn" onClick={() => fetchGroups()}>Refresh Groups</button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="group-list stagger-list">
          {groups.map((group, idx) => (
            <Link key={group._id} to={`/groups/${group._id}`} className="group-card animate-fluid" style={{ ['--i']: idx }}>
              <h3>{group.name}</h3>
              <p>{group.members.length} member(s)</p>
              <p className="caption">Invite code: {group.inviteCode || "-"}</p>
              <p className="caption">
                Created by {group.createdBy?.name || "-"} on {new Date(group.createdAt).toLocaleDateString("en-IN")}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
