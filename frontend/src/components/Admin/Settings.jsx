import React from 'react'
import Sidebar from './Sidebar'
import AppHeader from "../shared/AppHeader"
function Settings() {
    return (
    <div className="min-h-screen bg-base-200">
      <AppHeader subtitle="Admin - Settings" showNotifications={false} />
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