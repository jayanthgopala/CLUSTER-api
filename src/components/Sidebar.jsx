import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  // { to: "/notifications", label: "Notifications" },
  { to: "/companies", label: "Companies" },
  { to: "/jobs", label: "Jobs" },
  { to: "/users", label: "Users" },
  { to: "/roles", label: "Roles" },
  { to: "/permissions", label: "Permissions" },
  { to: "/register", label: "Register" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        {/* <h2>Menu</h2> */}
      </div>
      <nav className="sidebar-nav">
        <ul>
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
