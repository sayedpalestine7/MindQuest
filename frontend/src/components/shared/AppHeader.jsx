import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Bell, Brain, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationsContext";
import NotificationBell from "./NotificationBell";

const resolveUserId = (user) => user?._id || user?.id || localStorage.getItem("userId");

const buildNavItems = (role, userId) => {
  const safeUserId = userId || "me";

  const common = [
    { label: "Home", to: "/" },
  ];

  const browsing = { label: "Browse", to: "/courses" };

  if (!role) {
    return [
      ...common,
      browsing,
      { label: "Login", to: "/login" },
      { label: "Sign Up", to: "/signup" },
    ];
  }

  if (role === "student") {
    return [
      ...common,
      browsing,
      { label: "My Profile", to: `/student/${safeUserId}` },
    ];
  }

  if (role === "teacher") {
    return [
      ...common,
      { label: "Dashboard", to: `/teacher/${safeUserId}` },
      { label: "Course Builder", to: "/teacher/courseBuilder" },
      { label: "Studio", to: "/studio" },
    ];
  }

  if (role === "admin") {
    return [
      { label: "Admin", to: "/admin" },
      { label: "Users", to: "/admin/users" },
      { label: "Courses", to: "/admin/courses" },
      { label: "Reports", to: "/admin/reports" },
      { label: "Settings", to: "/admin/Settings" },
    ];
  }

  return common;
};

export default function AppHeader({ subtitle, showNotifications }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userId = resolveUserId(user);
  const role = user?.role || null;
  const navItems = useMemo(() => buildNavItems(role, userId), [role, userId]);
  const displayNotifications = showNotifications !== false && (role === "student" || role === "teacher");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="mq-header sticky top-0 z-30">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <div className="w-10 h-10 rounded-xl mq-header-logo flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold mq-header-title">MindQuest</h1>
            {subtitle && <p className="text-sm mq-header-subtitle">{subtitle}</p>}
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {displayNotifications && <NotificationBell />}

          {user ? (
            <button
              onClick={handleLogout}
              className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
