import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";

const DashboardPage = () => {
  const { user, logout, loading, updateProfile, deleteProfile } = useAuth();
  const { groups, groupsLoading, groupsError, fetchGroups, createGroup, joinGroup } = useAppContext();
  const [groupName, setGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [profileForm, setProfileForm] = useState({ name: "", username: "" });
  const [localError, setLocalError] = useState("");
  const [localSuccess, setLocalSuccess] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(false);

  useEffect(() => {
    document.body.dataset.page = "dashboard";
    fetchGroups();
  }, []);

  useEffect(() => {
    setProfileForm({
      name: user?.name || "",
      username: user?.username || "",
    });
  }, [user]);

  const copyText = async (text, successMessage) => {
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setLocalSuccess(successMessage);
      setLocalError("");
    } catch (error) {
      setLocalError("Copy failed. Please copy manually.");
    }
  };

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

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setLocalError("");
    setLocalSuccess("");

    const nextName = profileForm.name.trim();
    const nextUsername = profileForm.username.trim().toLowerCase();

    if (!nextName || !nextUsername) {
      setLocalError("Name and username are required.");
      return;
    }

    if (!/^[a-z0-9_]{3,20}$/.test(nextUsername)) {
      setLocalError("Username must be 3-20 chars using lowercase letters, numbers, or underscore.");
      return;
    }

    try {
      setUpdatingProfile(true);
      await updateProfile({ name: nextName, username: nextUsername });
      setLocalSuccess("Profile updated.");
    } catch (error) {
      setLocalError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleProfileDelete = async () => {
    const shouldDelete = window.confirm("Delete your profile? This cannot be undone.");
    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingProfile(true);
      await deleteProfile();
    } catch (error) {
      setLocalError(error.response?.data?.message || "Failed to delete profile");
      setDeletingProfile(false);
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

      <section className="panel animate-rise">
        <h2>Your Profile</h2>
        <div className="profile-grid">
          <div>
            <p className="caption">Name</p>
            <strong>{user?.name || "-"}</strong>
          </div>
          <div>
            <p className="caption">Username</p>
            <strong>@{user?.username || "-"}</strong>
          </div>
          <div>
            <p className="caption">Member Code</p>
            <div className="inline-copy">
              <strong>{user?.memberCode || "-"}</strong>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => copyText(user?.memberCode, "Member code copied.")}
              >
                Copy
              </button>
            </div>
          </div>
          <div>
            <p className="caption">Member ID</p>
            <div className="inline-copy">
              <strong>{user?._id || "-"}</strong>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => copyText(user?._id, "Member ID copied.")}
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        <details className="dropdown-panel">
          <summary>My Profile Settings</summary>
          <form onSubmit={handleProfileSave} className="stack-form nested-form">
            <input
              type="text"
              value={profileForm.name}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Name"
              disabled={updatingProfile || deletingProfile || loading}
            />
            <input
              type="text"
              value={profileForm.username}
              onChange={(event) =>
                setProfileForm((prev) => ({ ...prev, username: event.target.value.toLowerCase() }))
              }
              placeholder="Username"
              disabled={updatingProfile || deletingProfile || loading}
            />
            <div className="action-row">
              <button type="submit" disabled={updatingProfile || deletingProfile || loading}>
                {updatingProfile ? "Saving..." : "Save Profile"}
              </button>
              <button
                type="button"
                className="danger-btn"
                onClick={handleProfileDelete}
                disabled={updatingProfile || deletingProfile || loading}
              >
                {deletingProfile ? "Deleting..." : "Delete Profile"}
              </button>
            </div>
          </form>
        </details>
      </section>

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
        {groupsLoading ? <LoadingSpinner message="Loading groups..." /> : null}
        {groupsError ? <p className="error-text">{groupsError}</p> : null}

        {!groupsLoading && groups.length === 0 ? (
          <p>No groups yet. Create a group or join one with an invite code above.</p>
        ) : null}

        <div className="group-list">
          {groups.map((group) => (
            <Link key={group._id} to={`/groups/${group._id}`} className="group-card">
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
