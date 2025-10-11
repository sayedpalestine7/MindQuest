import { motion } from "framer-motion";
import { Link } from "react-router";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-50 to-white text-gray-800">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-md sticky top-0 z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl font-bold text-indigo-600"
        >
          MindQuest
        </motion.h1>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg text-indigo-600 hover:bg-indigo-100 transition"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="flex flex-col items-center text-center mt-16 px-6">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold text-indigo-700 mb-4"
        >
          Learn. Play. Master.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-lg md:text-xl text-gray-600 max-w-2xl"
        >
          Learn interactively with animations, mini-games, and quizzes —
          making complex topics simple and fun.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-8"
        >
          <Link
            to="/courses"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-lg hover:bg-indigo-700 transition"
          >
            Start Learning
          </Link>
        </motion.div>
      </header>

      {/* Features Section */}
      <section className="mt-20 mb-16 px-6 grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {[
          {
            title: "Interactive Animations",
            desc: "Visualize algorithms and data structures in motion to understand how they truly work.",
            icon: "🎬",
          },
          {
            title: "Mini-Games",
            desc: "Play, challenge yourself, and reinforce your learning through fun practice games.",
            icon: "🎮",
          },
          {
            title: "Smart Quizzes",
            desc: "Test your understanding with instant feedback and detailed explanations.",
            icon: "🧠",
          },
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
            className="bg-white shadow-lg rounded-2xl p-8 hover:shadow-xl transition cursor-default"
          >
            <div className="text-5xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-indigo-700">
              {feature.title}
            </h3>
            <p className="text-gray-600">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-gray-500 border-t">
        © {new Date().getFullYear()} MindQuest — All Rights Reserved
      </footer>
    </div>
  );
}
