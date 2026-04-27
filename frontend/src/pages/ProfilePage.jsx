import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user, loading, error, setError, updateProfile, deleteProfile } = useAuth();
  const [formData, setFormData] = useState({ name: "", username: "" });
  const [localSuccess, setLocalSuccess] = useState("");

  useEffect(() => {
    document.body.dataset.page = "profile";
    setFormData({
      name: user?.name || "",
      username: user?.username || "",
    });
  }, [user]);

  const copyText = async (text) => {
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setLocalSuccess("Copied to clipboard.");
    } catch (copyError) {
      setError("Copy failed. Please copy manually.");
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setError("");
    setLocalSuccess("");

    const nextName = formData.name.trim();
    const nextUsername = formData.username.trim().toLowerCase();

    if (!nextName || !nextUsername) {
      setError("Name and username are required.");
      return;
    }

    if (!/^[a-z0-9_]{3,20}$/.test(nextUsername)) {
      setError("Username must be 3-20 chars using lowercase letters, numbers, or underscore.");
      return;
    }

    try {
      await updateProfile({ name: nextName, username: nextUsername });
      setLocalSuccess("Profile updated.");
    } catch (requestError) {
      // error already set in context
    }
  };

  const handleDelete = async () => {
    const shouldDelete = window.confirm("Delete your profile? This cannot be undone.");
    if (!shouldDelete) {
      return;
    }

    try {
      await deleteProfile();
    } catch (requestError) {
      // error already set in context
    }
  };

  return (
    <div className="page-shell">
      <header className="top-bar">
        <div>
          <p className="caption">My Profile</p>
          <h1>{user?.name || "Profile"}</h1>
        </div>
        <Link to="/dashboard" className="secondary-btn link-btn">
          Back to Dashboard
        </Link>
      </header>

      <section className="panel animate-rise">
        <h2>Identity</h2>
        <div className="profile-grid">
          <div>
            <p className="caption">Name</p>
            <strong>{user?.name || "-"}</strong>
          </div>
          <div>
            <p className="caption">Email</p>
            <strong>{user?.email || "-"}</strong>
          </div>
          <div>
            <p className="caption">Username</p>
            <strong>@{user?.username || "-"}</strong>
          </div>
          <div>
            <p className="caption">Member Code</p>
            <div className="inline-copy">
              <strong>{user?.memberCode || "-"}</strong>
              <button type="button" className="secondary-btn" onClick={() => copyText(user?.memberCode)}>
                Copy
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="panel animate-rise">
        <h2>Modify Profile</h2>
        <form onSubmit={handleUpdate} className="stack-form">
          <div>
            <p className="field-label">Name</p>
            <input
              type="text"
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              disabled={loading}
            />
          </div>
          <div>
            <p className="field-label">Username</p>
            <input
              type="text"
              value={formData.username}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, username: event.target.value.toLowerCase() }))
              }
              disabled={loading}
            />
          </div>
          <div className="action-row">
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Profile"}
            </button>
            <button type="button" className="danger-btn" onClick={handleDelete} disabled={loading}>
              {loading ? "Please wait..." : "Delete Profile"}
            </button>
          </div>
        </form>

        {error ? <p className="error-text">{error}</p> : null}
        {localSuccess ? <p className="success-text">{localSuccess}</p> : null}
      </section>
    </div>
  );
};

export default ProfilePage;
