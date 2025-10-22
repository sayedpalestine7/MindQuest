import React from 'react';

function ComponentRenderer({ component, onDragStart, isActive }) {
  const { id, type, style, content } = component;
  
  // Convert style object to inline CSS string for the div
  const styleString = Object.entries(style)
    .map(([prop, value]) => `${prop}: ${value}`)
    .join('; ');

  let shapeClasses = '';
  let contentDisplay = content;

  // Map component type to Tailwind/CSS classes
  switch (type) {
    case 'circle':
      shapeClasses = 'rounded-full';
      break;
    case 'square':
      shapeClasses = 'rounded-none';
      break;
    case 'triangle':
      // The triangle uses CSS border tricks, which complicates dynamic styles.
      // For simplicity in this React view, we'll use a rotated box or focus on the pure CSS approach.
      // We will stick to dynamic position/color for now.
      shapeClasses = 'triangle-shape'; // Use a dedicated CSS class for this
      break;
    case 'text':
      shapeClasses = 'p-1';
      break;
    default:
      break;
  }

  // Combine inline styles and a single class for base behavior/transition
  return (
    <div
      id={`comp-${id}`}
      className={`absolute transition-all ease-in-out duration-300 ${shapeClasses} ${isActive ? 'cursor-move' : ''}`}
      style={{ ...style, position: 'absolute' }}
      onMouseDown={isActive ? (e) => onDragStart(e, id) : undefined}
      // Make sure the component is draggable/interactive only when editing
    >
        {type === 'text' ? (
            <div style={{color: style.color, fontSize: style.fontSize, backgroundColor: style.backgroundColor}}>
                {contentDisplay}
            </div>
        ) : null}
    </div>
  );
}

export default ComponentRenderer;