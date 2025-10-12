import React from 'react'
import Sidebar from './Sidebar'
import UsersTable from './users/UsersTable'
function ManageUsers() {
    return (
    <div className="flex min-h-screen bg-base-200">

      <Sidebar />
      <div className="flex-1 p-6 ">

        <UsersTable/>

      </div>
    </div>
  )
}

export default ManageUsers