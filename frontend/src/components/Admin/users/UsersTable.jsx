import React from "react"
import UserRow from "./UserRow"

function UserTable() {
  // Fake users for testing
  const fakeUsers = [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      avatar: "https://i.pravatar.cc/150?img=1",
      progress: 85,
      points: 1200,
      status: "active",
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob@example.com",
      avatar: "https://i.pravatar.cc/150?img=2",
      progress: 60,
      points: 950,
      status: "banned",
    },
    {
      id: 3,
      name: "Charlie Brown",
      email: "charlie@example.com",
      avatar: "",
      progress: 45,
      points: 500,
      status: "active",
    },
  ]

  // Example event handlers
  const handleView = (user) => {
    alert(`Viewing ${user.name}`)
  }

  const handleBan = (user) => {
    alert(`${user.name} is now ${user.status === "banned" ? "unbanned" : "banned"}`)
  }

  return (
    <div className="overflow-x-auto p-6">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Avatar</th>
            <th>Name</th>
            <th>Email</th>
            <th>Progress</th>
            <th>Points</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {fakeUsers.map((user, index) => (
            <UserRow
              key={user.id}
              user={user}
              index={index}
              onView={() => handleView(user)}
              onBan={() => handleBan(user)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UserTable
