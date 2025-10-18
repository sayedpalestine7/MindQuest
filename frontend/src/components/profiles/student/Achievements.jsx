import React from "react"

export default function Achievements({ badges }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-xl font-bold mb-6">Achievements</h3>
      <div className="space-y-3">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`p-4 border rounded-lg flex justify-between items-center ${
              b.earned ? "bg-blue-50 border-blue-300" : "bg-gray-100 text-gray-400"
            }`}
          >
            <div>
              <p className="font-semibold">{b.name}</p>
              <p className="text-sm">{b.earned ? "Earned" : "Locked"}</p>
            </div>
            {b.earned && <span className="text-blue-600 text-lg font-bold">✓</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
