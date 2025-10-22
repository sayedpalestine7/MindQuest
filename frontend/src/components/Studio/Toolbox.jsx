import React from 'react';

// Define the component types available
const COMPONENT_TYPES = [
  { type: 'square', label: 'Square', color: 'bg-blue-500' },
  { type: 'circle', label: 'Circle', color: 'bg-red-500' },
  { type: 'triangle', label: 'Triangle', color: 'bg-green-500' },
  { type: 'text', label: 'Text', color: 'bg-gray-700' },
];

function Toolbox() {
  const handleDragStart = (e, type) => {
    // Send the component type data with the drag event
    e.dataTransfer.setData('componentType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="w-48 bg-white p-4 rounded-lg shadow-lg flex flex-col space-y-4 h-full">
      <h3 className="text-lg font-semibold border-b pb-2">Components</h3>
      {COMPONENT_TYPES.map((comp) => (
        <div
          key={comp.type}
          className={`p-3 text-white text-center rounded-md shadow-md cursor-grab active:cursor-grabbing 
                      ${comp.color} hover:shadow-xl transition transform hover:scale-105`}
          draggable
          onDragStart={(e) => handleDragStart(e, comp.type)}
        >
          {comp.label}
        </div>
      ))}
    </div>
  );
}

export default Toolbox;