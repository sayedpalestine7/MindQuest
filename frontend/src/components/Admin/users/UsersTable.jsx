import { SearchBar } from "./SearchBar.jsx";
import { FilterBar } from "./FilterBar.jsx";
import { UserRow } from "./UserRow.jsx";
import { UserProfileDialog } from "./UserProfileDialog.jsx";
import { BanUserDialog } from "./BanUserDialog.jsx";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

function UsersTable() {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToBan, setUserToBan] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, userTypeFilter, statusFilter, sortField, sortOrder]);

  useEffect(() => {
    async function loadUsers() {
      try {
        if (initialLoad) setLoading(true);
        const params = new URLSearchParams({
          page: String(page),
          limit: String(pageSize),
          search: searchQuery,
          userType: userTypeFilter,
          status: statusFilter,
          sortField,
          sortOrder,
        });

        const res = await fetch(`http://localhost:5000/api/admin/users?${params.toString()}`);
        const data = await res.json();
        setUsers(data.items || []);
        setTotalUsers(data.total || 0);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        if (initialLoad) setLoading(false);
        setInitialLoad(false);
      }
    }

    loadUsers();
  }, [page, pageSize, searchQuery, userTypeFilter, statusFilter, sortField, sortOrder]);

  function handleSort(field) {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }

  async function handleBanUser(reason) {
    if (!userToBan) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/ban-user/${userToBan.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ reason: reason || "" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update user");

      setUsers((prev) =>
        prev.map((u) => (u.id === userToBan.id ? { ...u, status: data.user.status } : u))
      );

      setUserToBan(null);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  const totalPages = Math.max(Math.ceil(totalUsers / pageSize), 1);

  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    let start = Math.max(page - 2, 1);
    let end = Math.min(start + maxButtons - 1, totalPages);
    if (end - start + 1 < maxButtons) {
      start = Math.max(end - maxButtons + 1, 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

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
          {users.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-4 text-gray-500">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user, i) => (
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

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-sm text-gray-400">
        <div>
          Showing {users.length} of {totalUsers} users
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border border-gray-700 rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            {pageNumbers.map((p) => (
              <button
                key={p}
                className={`px-3 py-1 border border-gray-700 rounded ${p === page ? "bg-blue-500 text-white" : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="px-3 py-1 border border-gray-700 rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

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
