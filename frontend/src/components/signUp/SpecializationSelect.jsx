import React, { useState, useEffect } from "react";

function SpecializationSelect({ formData, setFormData, specializations }) {
  const [customSpec, setCustomSpec] = useState(
    formData.customSpecialization || ""
  );

  // Sync local state with formData
  useEffect(() => {
    setCustomSpec(formData.customSpecialization || "");
  }, [formData.customSpecialization]);

  const handleChange = (e) => {
    const value = e.target.value;
    if (value === "Other") {
      setFormData({ ...formData, specialization: "Other" });
    } else {
      setFormData({ ...formData, specialization: value, customSpecialization: "" });
    }
  };

  const handleCustomChange = (e) => {
    const value = e.target.value;
    setCustomSpec(value);
    setFormData({ ...formData, customSpecialization: value });
  };

  return (
    <div className="space-y-2">
      <label htmlFor="specialization" className="text-sm font-medium text-gray-700">
        Specialization <span className="text-red-500">*</span>
      </label>

      <select
        id="specialization"
        value={
          formData.specialization && specializations.includes(formData.specialization)
            ? formData.specialization
            : formData.specialization === "Other"
            ? "Other"
            : ""
        }
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all duration-200"
      >
        <option value="">Select your specialization</option> {/* Empty default */}
        {specializations.map((spec) => (
          <option key={spec} value={spec}>
            {spec}
          </option>
        ))}
        <option value="Other">Other</option>
      </select>

      {/* Show text input if “Other” is selected */}
      {formData.specialization === "Other" && (
        <input
          type="text"
          placeholder="Enter your specialization"
          value={customSpec}
          onChange={handleCustomChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        />
      )}
    </div>
  );
}

export default SpecializationSelect;
