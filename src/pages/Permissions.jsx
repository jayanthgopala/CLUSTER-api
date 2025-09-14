import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

export default function Permissions() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form states
  const [newPermission, setNewPermission] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", description: "" });

  // Fetch permissions
  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/permissions");
      setPermissions(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (err) {
      setError("Failed to load permissions");
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // === CRUD Handlers ===

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newPermission.name.trim()) return alert("Name is required");

    try {
      const res = await api.post("/api/permissions", newPermission, { withCredentials: true });
      setPermissions([...permissions, res.data]); // backend should return the created permission
      setNewPermission({ name: "", description: "" });
    } catch (err) {
      alert("Failed to add permission");
    }
  };

  const handleEditStart = (perm) => {
    setEditingId(perm.id);
    setEditData({ name: perm.name, description: perm.description || "" });
  };

  const handleEditSave = async (id) => {
    try {
      const res = await api.put(`/api/permissions/${id}`, editData, { withCredentials: true });
      setPermissions(permissions.map(p => (p.id === id ? res.data : p))); // backend should return updated permission
      setEditingId(null);
    } catch (err) {
      alert("Failed to update permission");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this permission?")) return;
    try {
      await api.delete(`/api/permissions/${id}`, { withCredentials: true });
      setPermissions(permissions.filter(p => p.id !== id));
    } catch (err) {
      alert("Failed to delete permission");
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h2>Permission Management</h2>
        </div>

        {/* Add New Permission Form */}
        <section className="card" style={{ marginBottom: 20 }}>
          <h3>Add Permission</h3>
          <form onSubmit={handleAdd} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Permission name"
              value={newPermission.name}
              onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
              style={{ flex: "1 1 200px", padding: 6 }}
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newPermission.description}
              onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
              style={{ flex: "1 1 200px", padding: 6 }}
            />
            <button type="submit" style={{ padding: "6px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6 }}>
              Add
            </button>
          </form>
        </section>

        {/* Permissions Table */}
        <section className="card">
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "8px 12px", textAlign: "left" }}>ID</th>
                  <th style={{ padding: "8px 12px", textAlign: "left" }}>Name</th>
                  <th style={{ padding: "8px 12px", textAlign: "left" }}>Description</th>
                  <th style={{ padding: "8px 12px", textAlign: "left" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {permissions.length > 0 ? (
                  permissions.map((perm) => (
                    <tr key={perm.id} style={{ borderBottom: "1px solid #f1f1f1" }}>
                      <td style={{ padding: "8px 12px" }}>{perm.id}</td>
                      <td style={{ padding: "8px 12px" }}>
                        {editingId === perm.id ? (
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          />
                        ) : (
                          perm.name
                        )}
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        {editingId === perm.id ? (
                          <input
                            type="text"
                            value={editData.description}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                          />
                        ) : (
                          perm.description || "-"
                        )}
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        {editingId === perm.id ? (
                          <>
                            <button
                              onClick={() => handleEditSave(perm.id)}
                              style={{ marginRight: 8, background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px" }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              style={{ background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 10px" }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditStart(perm)}
                              style={{ marginRight: 8, background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px" }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(perm.id)}
                              style={{ color: "#dc2626", background: "#fff1f2", border: "1px solid #dc2626", borderRadius: 6, padding: "4px 10px" }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: 20 }}>
                      No permissions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
