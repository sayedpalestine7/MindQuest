import React from "react";
import { BookOpen, User, FileText, Settings } from "lucide-react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";

function Dashboard() {
    const navigate = useNavigate();

    const actions = [
        {
            title: "Manage Courses",
            description: "Create, edit, and organize your courses",
            icon: BookOpen,
            route: "/admin/courses",
        },
        {
            title: "Manage Users",
            description: "View and manage student accounts",
            icon: User,
            route: "/admin/users",
        },
        {
            title: "Manage Quizzes",
            description: "Create and edit quiz questions",
            icon: FileText,
            route: "/admin/quizzes",
        },
        {
            title: "Settings",
            description: "Update platform configuration and preferences",
            icon: FileText,
            route: "/admin/Settings",
        },
    ];

    return (
        <div className="p-6">
<motion.div
    initial={{ opacity: 0, y: -15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    className="mb-8"
  >
    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
      Quick Actions
    </h1>

    <p className="text-[15px] text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
      Monitor performance, manage users, and keep your courses up to date with smooth administrative control.
    </p>

    {/* Optional subtle divider for professional look */}
    <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700"></div>
  </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ">
                {actions.map((action, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.5,
                            delay: 0.15, // staggered delay for each card
                            ease: [0.25, 0.1, 0.25, 1],
                        }}
                        whileHover={{
                            y: -4,
                            scale: 1.02,
                            boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                            transition: { duration: 0.3 },
                        }}
                        onClick={() => navigate(action.route)}
                        className="relative overflow-hidden bg-gray-900 border border-gray-700 rounded-xl shadow-md cursor-pointer p-6"
                    >
                        <div>
                            <div className="flex items-center mb-4">
                                <action.icon className="h-6 w-6 text-primary mr-3" />
                                <h3 className="text-lg font-semibold text-base-300">
                                    {action.title}
                                </h3>
                            </div>
                            <p className="text-sm text-base-300 mb-4">{action.description}</p>
                            <div className="self-end text-primary">
                                <span className="text-xl">→</span>
                            </div>
                            {/* Animated gradient overlay */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 rounded-xl"
                                whileHover={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;
