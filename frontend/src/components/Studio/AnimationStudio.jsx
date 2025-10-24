import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import Toolbox from './Toolbox';
import Timeline from './Timeline';
import ComponentRenderer from './ComponentRenderer';

const INITIAL_PROJECT_STATE = {
  activeStageIndex: 0,
  nextComponentId: 1,
  stages: [{ stageId: 1, duration: 1.0, components: [] }], // Stage 0 is the starting state
};

function AnimationStudio() {
  const [project, setProject] = useState(INITIAL_PROJECT_STATE);
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedCompId, setDraggedCompId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // --- Core State & Stage Management ---

  const getActiveStage = useCallback(() => project.stages[project.activeStageIndex], [project.activeStageIndex, project.stages]);

  const updateStage = (newComponents) => {
    setProject(prev => {
      const newStages = [...prev.stages];
      newStages[prev.activeStageIndex] = {
        ...newStages[prev.activeStageIndex],
        components: newComponents,
      };
      return { ...prev, stages: newStages };
    });
  };

  const addComponent = (type, position) => {
    const newComponent = {
      id: project.nextComponentId,
      type,
      content: type === 'text' ? 'Hello' : '',
      style: {
        width: type === 'triangle' ? '100px' : '50px',
        height: type === 'triangle' ? '100px' : '50px',
        backgroundColor: type === 'text' ? 'transparent' : (type === 'circle' ? 'red' : (type === 'square' ? 'blue' : 'green')),
        color: 'black',
        fontSize: '24px',
        // Center element on the drop/click position
        top: `${position.y - (type === 'triangle' ? 50 : 25)}px`,
        left: `${position.x - (type === 'triangle' ? 50 : 25)}px`,
      },
    };
    updateStage([...getActiveStage().components, newComponent]);
    setProject(prev => ({ ...prev, nextComponentId: prev.nextComponentId + 1 }));
  };

  // --- Drag & Drop Logic for components on Canvas ---

  const handleComponentDragStart = (e, componentId) => {
    e.stopPropagation();
    setIsDragging(true);
    setDraggedCompId(componentId);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !draggedCompId || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - canvasRect.left;
    const newY = e.clientY - canvasRect.top;

    setProject(prev => {
      const stage = prev.stages[prev.activeStageIndex];
      const componentIndex = stage.components.findIndex(c => c.id === draggedCompId);
      if (componentIndex === -1) return prev;

      const newComp = {
        ...stage.components[componentIndex],
        style: {
          ...stage.components[componentIndex].style,
          // Simple positioning based on pointer
          left: `${newX}px`,
          top: `${newY}px`,
        }
      };

      const newComponents = [...stage.components];
      newComponents[componentIndex] = newComp;

      const newStages = [...prev.stages];
      newStages[prev.activeStageIndex] = { ...stage, components: newComponents };

      return { ...prev, stages: newStages };
    });
  }, [isDragging, draggedCompId]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDraggedCompId(null);
    }
  }, [isDragging]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);


  // --- Playback / Preview Logic ---

  const playAnimation = () => {
    if (project.stages.length < 2) {
      alert("Need at least two stages to run an animation!");
      return;
    }
    setIsPlaying(true);
    let cumulativeTime = 0;

    // 1. Reset components to Stage 1 styles immediately before starting
    const stage1Components = project.stages[0].components;
    stage1Components.forEach(comp => {
      const element = document.getElementById(`comp-${comp.id}`);
      if (element) {
        Object.entries(comp.style).forEach(([prop, value]) => {
          element.style.transition = 'none';
          element.style[prop] = value;
        });
      }
    });

    // 2. Schedule transitions (starting from Stage 1 -> Stage 2)
    for (let i = 1; i < project.stages.length; i++) {
      const currentStage = project.stages[i];

      setTimeout(() => {
        currentStage.components.forEach(nextComp => {
          const element = document.getElementById(`comp-${nextComp.id}`);
          if (element) {
            // Set the transition duration
            element.style.transition = `all ${currentStage.duration}s ease-in-out`;

            // Apply the target styles from the current stage
            Object.entries(nextComp.style).forEach(([prop, value]) => {
              element.style[prop] = value;
            });
          }
        });

        // End of animation check
        if (i === project.stages.length - 1) {
          setTimeout(() => setIsPlaying(false), currentStage.duration * 1000);
        }
      }, cumulativeTime * 1000);

      cumulativeTime += currentStage.duration;
    }
  };

  // --- Save & Download Handlers ---

  // Option 1: Use absolute URL
  const API_BASE = 'http://localhost:5000/api/animations';

  const handleSave = async () => {
    try {
      const response = await axios.post(`${API_BASE}`, {
        ...project,
        name: prompt("Enter a name for your animation:", "My New Animation")
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } // if using JWT
      });
      alert('Animation saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save animation. Check server logs and authentication.');
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.post(`${API_BASE}/download`, { stages: project.stages }, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'animation.html');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download animation HTML. Check the backend route.');
    }
  };



  // --- Render UI ---
  return (
    <div className="flex flex-col h-[80vh] gap-4">

      {/* Top Controls: Save, Play, Download */}
      <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
        <div className="space-x-4">
          <button onClick={handleSave} className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition">
            💾 Save Project
          </button>
          <button
            onClick={playAnimation}
            disabled={isPlaying}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition disabled:opacity-50"
          >
            {isPlaying ? '▶️ Playing...' : '▶️ Preview'}
          </button>
        </div>
        <button onClick={handleDownload} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition">
          ⬇️ Download HTML
        </button>
      </div>

      <div className="flex flex-1 gap-4">
        {/* Left: Toolbox */}
        <Toolbox addComponent={addComponent} />

        {/* Center: Canvas */}
        <div
          ref={canvasRef}
          id="animation-canvas"
          className="relative flex-1 bg-white border-2 border-dashed border-gray-300 rounded-lg shadow-inner overflow-hidden"
          // Drag-and-drop handler for placing new components
          onDrop={(e) => {
            e.preventDefault();
            if (!canvasRef.current) return;
            const canvasRect = canvasRef.current.getBoundingClientRect();
            const type = e.dataTransfer.getData('componentType');
            const x = e.clientX - canvasRect.left;
            const y = e.clientY - canvasRect.top;
            if (type) addComponent(type, { x, y });
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          {getActiveStage().components.map(comp => (
            <ComponentRenderer
              key={comp.id}
              component={comp}
              onDragStart={handleComponentDragStart}
              isActive={!isPlaying} // Only allow interaction when not playing
            />
          ))}
          {/* Visual indicator for canvas border */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-gray-400 font-medium">
            Canvas Area (800x600px effective)
          </div>
        </div>
      </div>

      {/* Bottom: Timeline */}
      <Timeline project={project} setProject={setProject} />
    </div>
  );
}

export default AnimationStudio;