import React, { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Brain, Check, Eye, Loader2, LogOut, Menu, Save, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell";
import { Button } from "../courseBuilder/UI";

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

export default function AppHeader({ subtitle, showNotifications, courseBuilderControls }) {
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

  const saveStatus = courseBuilderControls?.saveStatus;
  const showCourseBuilderControls = Boolean(courseBuilderControls);
  const canToggleSidebar = Boolean(courseBuilderControls?.onToggleSidebar);

  return (
    <header className="mq-header sticky top-0 z-30">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showCourseBuilderControls && canToggleSidebar && (
            <Button
              onClick={courseBuilderControls.onToggleSidebar}
              variant="ghost"
              size="sm"
              className="hidden lg:inline-flex p-2 h-auto hover:bg-gray-100"
              title={courseBuilderControls.isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
            >
              {courseBuilderControls.isSidebarCollapsed ? (
                <Menu className="w-5 h-5 text-gray-600" />
              ) : (
                <X className="w-5 h-5 text-gray-600" />
              )}
            </Button>
          )}

          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="w-10 h-10 rounded-xl mq-header-logo flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold mq-header-title">MindQuest</h1>
              {subtitle && <p className="text-sm mq-header-subtitle">{subtitle}</p>}
            </div>
          </Link>
        </div>

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
          {showCourseBuilderControls && (
            <div className="flex items-center gap-3">
              {saveStatus && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 border-gray-300">
                  {saveStatus === "saved" && (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-gray-600">Saved</span>
                    </>
                  )}
                  {saveStatus === "saving" && (
                    <>
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      <span className="text-xs font-medium text-gray-600">Saving...</span>
                    </>
                  )}
                  {saveStatus === "unsaved" && (
                    <>
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="text-xs font-medium text-gray-600">Unsaved</span>
                    </>
                  )}
                </div>
              )}

              <Button
                onClick={courseBuilderControls.onPreview}
                variant="outline"
                className="gap-2 bg-transparent hover:bg-blue-50 hover:bg-opacity-100"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>

              <Button
                onClick={courseBuilderControls.onSave}
                // className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                className="gap-2 bg-transparent hover:bg-blue-50 hover:bg-opacity-100"
                variant="outline"
              >
                <Save className="w-4 h-4" />
                Save Course
              </Button>
            </div>
          )}

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
