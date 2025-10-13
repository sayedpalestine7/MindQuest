import React from 'react'
import Sidebar from './Sidebar'
import UsersTable from './users/UsersTable'
import { motion } from "framer-motion"

function ManageUsers() {
    return (
    <div className="flex min-h-screen bg-base-200">

      <Sidebar />
      <div className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-8"
        >
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Manage Users
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            View and manage all registered students, track their progress, and moderate accounts.
          </p>
          <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
        </motion.div>

        <UsersTable/>

      </div>
    </div>
  )
}

export default ManageUsers