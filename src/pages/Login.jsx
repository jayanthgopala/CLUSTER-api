import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaGraduationCap } from "react-icons/fa6";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password); // your AuthContext should return a response
      setSuccess("Login successful!");
      console.log("Login response:", res); // debug / inspect response
      navigate("/dashboard"); // redirect after login
    } catch (err) {
      setError(err?.message || "Login failed. Please try again.");
      console.error("Login error:", err); // debug request error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{textAlign: 'left', padding: '36px 32px', maxWidth: 400}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18}}>
          <FaGraduationCap style={{fontSize: 32, color: '#2563eb'}} />
          <div>
            <div style={{fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.1}}>Sign in to BMSIT<br/>PlacementHub</div>
          </div>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form className="auth-form" onSubmit={handleSubmit} style={{gap: 18}}>
          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your email"
              required
              style={{background: '#f4f8ff'}}
            />
          </div>
          <div className="form-row">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="your password"
              required
              style={{background: '#f4f8ff'}}
            />
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 10}}>
            <button className="btn primary" type="submit" disabled={loading} style={{width: 180, fontSize: '1rem', padding: '10px 0', borderRadius: 10, background: '#2563eb'}}>
              {loading ? "Signing in" : "Sign In"}
            </button>
            <button type="button" className="btn" style={{width: 180,background: 'none', color: '#555', boxShadow: 'none', fontWeight: 500, fontSize: '1rem', padding: 0}} onClick={() => navigate('/')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
