import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bell } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();

  // Mock notification count logic (keeps previous behavior)
  const totalNotifications =
    user?.role === "student"
      ? 3
      : user?.role === "teacher"
      ? 5
      : 0;

  return (
    <header
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #e6edf3",
        marginLeft: "240px",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "12px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            BMSIT Placement Training Portal
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "#6b7280",
            }}
          >
            Welcome back, {user?.name}!{" "}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <button
            style={{
              position: "relative",
              padding: 8,
              borderRadius: 9999,
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            
            
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                minWidth: 44,
                minHeight: 44,
                aspectRatio: "1 / 1",
                borderRadius: "9999px",
                background: "#3b82f6",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 16,
                overflow: "hidden",
                boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                border: "2px solid #fff",
                boxSizing: "border-box",
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                {user?.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  textTransform: "capitalize",
                }}
              >
                {user?.role}
              </div>
            </div>
            <button
              onClick={logout}
              className="btn primary small"
              style={{
                background: "#2563eb",
                borderRadius: 8,
                padding: "4px 10px",
                fontWeight: 600,
                fontSize: 13,
                minWidth: 64,
                lineHeight: "1",
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
