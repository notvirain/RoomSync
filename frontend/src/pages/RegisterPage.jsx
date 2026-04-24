import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const { token, loading, error, setError, register } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

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
    await register(formData.name, formData.email, formData.password).catch(() => {});
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>RoomSync</h1>
        <h2>Register</h2>

        <form onSubmit={onSubmit} className="auth-form">
          <input
            type="text"
            name="name"
            placeholder="Full name"
            value={formData.name}
            onChange={onChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={onChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 chars)"
            value={formData.password}
            onChange={onChange}
            minLength={6}
            required
          />
          {error ? <p className="error-text">{error}</p> : null}
          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
