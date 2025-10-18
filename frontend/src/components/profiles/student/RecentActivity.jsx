import React from "react"

export default function RecentActivity({ activities }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
      <ul className="space-y-3">
        {activities.map((a) => (
          <li key={a.id} className="flex justify-between p-3 border rounded-md hover:bg-gray-50">
            <div>
              <p className="font-medium">{a.title}</p>
              <p className="text-sm text-gray-500">{a.date}</p>
            </div>
            {a.points > 0 && <p className="text-blue-600 font-semibold">+{a.points}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
