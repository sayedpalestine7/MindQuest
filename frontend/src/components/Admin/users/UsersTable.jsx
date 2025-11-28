import { SearchBar } from "./SearchBar.jsx";
import { FilterBar } from "./FilterBar.jsx";
import { UserRow } from "./UserRow.jsx";
import { UserProfileDialog } from "./UserProfileDialog.jsx";
import { BanUserDialog } from "./BanUserDialog.jsx";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToBan, setUserToBan] = useState(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        // fetch combined users from backend
        const res = await fetch("http://localhost:5000/api/admin/users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  function handleSort(field) {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }

async function handleBanUser() {
  if (!userToBan) return;

  try {
    const res = await fetch(`http://localhost:5000/api/admin/ban-user/${userToBan.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update user");

    // Update state with the new status
    setUsers(users.map(u => 
      u.id === userToBan.id ? { ...u, status: data.user.status } : u
    ));

    setUserToBan(null);

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        const matchSearch =
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchType = userTypeFilter === "all" || u.userType === userTypeFilter;
        const matchStatus = statusFilter === "all" || u.status === statusFilter;
        return matchSearch && matchType && matchStatus;
      })
      .sort((a, b) => {
        const aVal =
          typeof a[sortField] === "string" ? a[sortField].toLowerCase() : a[sortField] ?? 0;
        const bVal =
          typeof b[sortField] === "string" ? b[sortField].toLowerCase() : b[sortField] ?? 0;
        return sortOrder === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
      });
  }, [users, searchQuery, sortField, sortOrder, userTypeFilter, statusFilter]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="p-6 border border-gray-700 rounded-lg bg-gray-900 shadow ">
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <FilterBar
        userTypeFilter={userTypeFilter}
        setUserTypeFilter={setUserTypeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <table className="w-full mt-4 border-collapse">
        <thead>
          <tr className="border-b text-white">
            <th className="p-2 text-start">Avatar</th>
            <th className="p-2 cursor-pointer text-start" onClick={() => handleSort("name")}>
              Name
            </th>
            <th className="p-2 text-start">Email</th>
            <th className="p-2">User Type</th>
            <th className="p-2 cursor-pointer" onClick={() => handleSort("points")}>
              Points
            </th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-4 text-gray-500">
                No users found
              </td>
            </tr>
          ) : (
            filteredUsers.map((user, i) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <UserRow
                  user={user}
                  onView={() => setSelectedUser(user)}
                  onBan={() => setUserToBan(user)}
                />
              </motion.tr>
            ))
          )}
        </tbody>
      </table>

      <UserProfileDialog user={selectedUser} onClose={() => setSelectedUser(null)} />
      <BanUserDialog
        user={userToBan}
        onCancel={() => setUserToBan(null)}
        onConfirm={handleBanUser}
      />
    </div>
  );
}

export default UsersTable;
