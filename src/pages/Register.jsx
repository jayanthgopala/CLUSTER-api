import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
// import Navbar from "../components/Navbar"; // ✅ add navbar for consistency
import api from "../services/api"; // if you use Axios service wrapper

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role_id: 2, // default role (user)
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Simple validation
  const validateForm = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.email.includes("@")) return "Invalid email address";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/api/register", form, { withCredentials: true });
      if (res.data.success) {
        setSuccess("✅ Registered successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(res.data.message || "Registration failed");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {/* <Navbar /> */}
        <div className="page-header">
          <h2>User Registration</h2>
        </div>

        <section className="card" style={{ maxWidth: 500, margin: "20px auto" }}>
          {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
          {success && <div style={{ color: "green", marginBottom: 12 }}>{success}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
            </div>

            <div>
              <label htmlFor="role_id">Role</label>
              <select id="role_id" name="role_id" value={form.role_id} onChange={handleChange}>
                <option value={1}>Admin</option>
                <option value={2}>User</option>
                <option value={3}>Manager</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 14px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Register;
