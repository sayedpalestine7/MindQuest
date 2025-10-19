import React from "react"

export default function Header({ onLogout }) {
  return (
    <header style={{ background: "#fff", padding: "1rem 2rem", borderBottom: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>MindQuest Instructor Dashboard</div>
      <div>
        <button style={{ marginRight: "1rem", padding: "0.5rem 1rem", background: "#007bff", color: "#fff", border: "none", borderRadius: "6px" }}>
          + Create Course
        </button>
        <button onClick={onLogout} style={{ padding: "0.5rem 1rem", background: "#eee", border: "1px solid #ccc", borderRadius: "6px" }}>
          Logout
        </button>
      </div>
    </header>
  )
}
