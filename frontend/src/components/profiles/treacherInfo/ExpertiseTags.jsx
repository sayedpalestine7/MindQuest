import React from "react";

export default function ExpertiseTags({ skills }) {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-gray-500 mb-3">EXPERTISE</h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="px-3 py-1 text-sm bg-gray-200 rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
