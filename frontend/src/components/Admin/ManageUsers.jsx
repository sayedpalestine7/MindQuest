import React from 'react'
import Sidebar from './Sidebar'
import UsersTable from './users/UsersTable'
function ManageUsers() {
    return (
    <div className="flex min-h-screen bg-base-200">

      <Sidebar />
      <div className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">

        <UsersTable/>

      </div>
    </div>
  )
}

export default ManageUsers