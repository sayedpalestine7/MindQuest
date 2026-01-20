import React from 'react'
import Sidebar from './Sidebar'
function Settings() {
    return (
    <div className="min-h-screen bg-base-200">
      <div className="flex min-h-screen bg-base-200">
        <Sidebar />
        <div className="flex-1 p-6">
          <div>manage setting</div>
        </div>
      </div>
    </div>
  )
}

export default Settings