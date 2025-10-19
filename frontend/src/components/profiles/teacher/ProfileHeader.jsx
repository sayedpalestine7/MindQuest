import React from "react"

export default function ProfileHeader({ profileData, stats, onEdit }) {
  return (
    <div style={{ background: "#fff", padding: "2rem", borderRadius: "12px", marginBottom: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <img
          src={profileData.avatar}
          alt="Avatar"
          style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" }}
        />
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0 }}>{profileData.name}</h2>
          <p>{profileData.title} • {profileData.department}</p>
          <p style={{ color: "#666" }}>{profileData.email}</p>
          <button onClick={onEdit} style={{ marginTop: "0.5rem", background: "transparent", border: "1px solid #ccc", padding: "0.4rem 0.8rem", borderRadius: "6px" }}>
            Edit Profile
          </button>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#666", marginBottom: "0.2rem" }}>Total Revenue</p>
          <p style={{ fontWeight: "bold", fontSize: "1.5rem", color: "#16a34a" }}>${stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
