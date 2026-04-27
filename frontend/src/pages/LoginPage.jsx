import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { token, loading, error, setError, login } = useAuth();
  const [formData, setFormData] = useState({ identifier: "", password: "" });

  useEffect(() => {
    document.body.dataset.page = "auth";
  }, []);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const onChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    await login(formData.identifier, formData.password).catch(() => {});
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-pop">
        <h1>RoomSync</h1>
        <h2>Login</h2>
        <p className="caption auth-description">
          Track shared expenses with roommates, split bills fairly, and instantly see who owes what.
        </p>

        <form onSubmit={onSubmit} className="auth-form">
          <input
            type="text"
            name="identifier"
            placeholder="Email or username"
            value={formData.identifier}
            onChange={onChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={onChange}
            required
          />
          {error ? <p className="error-text">{error}</p> : null}
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p>
          New user? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
