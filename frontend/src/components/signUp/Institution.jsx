import React from "react"

function Institution({ formData, setFormData }) {
  return (
    <div className="space-y-2">
      <label htmlFor="institution" className="text-sm font-medium text-gray-700">
        Institution / University <span className="text-gray-400 text-xs">(Optional)</span>
      </label>
      <input
        id="institution"
        type="text"
        placeholder="Stanford University"
        value={formData.institution}
        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
        className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500 border rounded-lg px-3 py-2 w-full"
      />
    </div>
  )
}

export default Institution
