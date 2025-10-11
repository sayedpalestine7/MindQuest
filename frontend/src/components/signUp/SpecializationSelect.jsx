import React from "react"

function SpecializationSelect({ formData, setFormData, specializations = [] }) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="specialization"
        className="text-sm font-medium text-gray-700"
      >
        Specialization <span className="text-red-500">*</span>
      </label>

      <select
        id="specialization"
        value={formData.specialization}
        onChange={(e) =>
          setFormData({ ...formData, specialization: e.target.value })
        }
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 transition-all duration-200"
      >
        <option value="">Select your specialization</option>
        {specializations.map((spec) => (
          <option key={spec} value={spec}>
            {spec}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SpecializationSelect
