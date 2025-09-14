import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add/Edit state
  const [newRole, setNewRole] = useState(null);
  const [editingRole, setEditingRole] = useState(null);

  // Fetch roles (GraphQL)
  const fetchRoles = async () => {
    const query = `
      query {
        roles {
          name
          description
        }
      }
    `;

    try {
      setLoading(true);
      const res = await api.post(
        "/graphql",
        { query },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      setRoles(res.data.data.roles || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  // ➕ Create role
  const handleSaveNew = async () => {
    try {
      await api.post("/api/roles", newRole, { withCredentials: true });
      setNewRole(null);
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // ✏️ Update role
  const handleSaveEdit = async () => {
    try {
      await api.put(`/api/roles/${editingRole.name}`, editingRole, {
        withCredentials: true,
      });
      setEditingRole(null);
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // 🗑️ Delete role
  const handleDelete = async (roleName) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      await api.delete(`/api/roles/${roleName}`, { withCredentials: true });
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h2>Role Management</h2>
        </div>

        <section className="card" style={{ padding: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 16px",
            }}
          >
            <strong>Available Roles ({roles.length})</strong>
            <button
              onClick={() =>
                setNewRole({ name: "", description: "" })
              }
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "6px 14px",
                cursor: "pointer",
              }}
            >
              ➕ Add Role
            </button>
          </div>

          <div style={{ overflowX: "auto", marginTop: 0 }}>
            {loading ? (
              <div style={{ padding: 24 }}>Loading roles...</div>
            ) : error ? (
              <div style={{ padding: 24, color: "red" }}>Error: {error}</div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 15,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f9fafb",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* ➕ New Role Row */}
                  {newRole && (
                    <tr style={{ background: "#eef" }}>
                      <td>
                        <input
                          value={newRole.name}
                          onChange={(e) =>
                            setNewRole({ ...newRole, name: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={newRole.description}
                          onChange={(e) =>
                            setNewRole({
                              ...newRole,
                              description: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td>
                        <button
                          onClick={handleSaveNew}
                          style={{ marginRight: 8 }}
                        >
                          Save
                        </button>
                        <button onClick={() => setNewRole(null)}>Cancel</button>
                      </td>
                    </tr>
                  )}

                  {/* Existing Roles */}
                  {roles.length > 0 ? (
                    roles.map((role) =>
                      editingRole?.name === role.name ? (
                        <tr key={role.name} style={{ background: "#fef9c3" }}>
                          <td>
                            <input
                              value={editingRole.name}
                              onChange={(e) =>
                                setEditingRole({
                                  ...editingRole,
                                  name: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <input
                              value={editingRole.description}
                              onChange={(e) =>
                                setEditingRole({
                                  ...editingRole,
                                  description: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <button
                              onClick={handleSaveEdit}
                              style={{ marginRight: 8 }}
                            >
                              Save
                            </button>
                            <button onClick={() => setEditingRole(null)}>
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ) : (
                        <tr
                          key={role.name}
                          style={{ borderBottom: "1px solid #f1f1f1" }}
                        >
                          <td>{role.name}</td>
                          <td>{role.description}</td>
                          <td>
                            <button
                              onClick={() => setEditingRole(role)}
                              style={{
                                marginRight: 8,
                                background: "#2563eb",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                padding: "4px 12px",
                                cursor: "pointer",
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(role.name)}
                              style={{
                                color: "#dc2626",
                                background: "#fff1f2",
                                border: "1px solid #dc2626",
                                borderRadius: 6,
                                padding: "4px 12px",
                                cursor: "pointer",
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center", padding: 24 }}>
                        No roles found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
