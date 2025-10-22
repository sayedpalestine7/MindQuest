import React from 'react';
// REMOVED: import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid'; 

function Timeline({ project, setProject }) {
  const stages = project.stages || []; 
  const { activeStageIndex } = project;

  const setActiveStage = (index) => {
    setProject(prev => ({ ...prev, activeStageIndex: index }));
  };

  const addStage = () => {
    if (stages.length === 0) return;

    const lastStage = stages[stages.length - 1];
    
    const newStage = {
      stageId: lastStage.stageId + 1,
      duration: 1.0, 
      components: lastStage.components.map(comp => ({ 
          ...comp, 
          style: { ...comp.style } 
      })),
    };

    setProject(prev => ({ 
      ...prev, 
      stages: [...prev.stages, newStage],
      activeStageIndex: prev.stages.length, 
    }));
  };

  const deleteStage = (index) => {
    if (stages.length <= 1) {
      alert("Cannot delete the only remaining stage.");
      return;
    }
    setProject(prev => {
      const newStages = prev.stages.filter((_, i) => i !== index);
      const newActiveIndex = Math.min(index, newStages.length - 1);
      return { ...prev, stages: newStages, activeStageIndex: newActiveIndex };
    });
  };

  const updateDuration = (index, duration) => {
    // Defensive parsing
    const newDuration = Math.max(0.1, parseFloat(duration) || 1.0); 

    setProject(prev => {
      const newStages = [...prev.stages];
      if (newStages[index]) { 
         newStages[index] = { ...newStages[index], duration: newDuration };
      }
      return { ...prev, stages: newStages };
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-xl overflow-x-auto">
      <div className="flex space-x-4 min-w-max">
        
        {/* Stage List */}
        {stages.map((stage, index) => (
          <div 
            key={index} 
            className={`flex flex-col items-center p-3 border-b-4 transition-colors ${
              index === activeStageIndex 
                ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                : 'border-transparent hover:border-gray-300'
            } rounded-md`}
          >
            <button 
              onClick={() => setActiveStage(index)}
              className="font-bold text-gray-700 w-24 h-16 border rounded-md mb-2 bg-white flex items-center justify-center text-sm hover:bg-gray-100"
            >
              Stage {index + 1}
            </button>
            
            {/* Transition Control */}
            {index > 0 ? (
              <div className="flex flex-col items-center">
                <label className="text-xs text-gray-500 mb-1">Duration (s)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={Math.max(0.1, stage.duration || 1.0)} 
                  onChange={(e) => updateDuration(index, e.target.value)}
                  className="w-16 text-center text-sm border rounded p-1"
                />
              </div>
            ) : (
              <span className="text-xs text-gray-400 mt-2">Start Frame</span>
            )}

            {/* Stage Controls */}
            {index !== 0 && (
                <button 
                    onClick={() => deleteStage(index)} 
                    className="mt-2 text-red-500 hover:text-red-700 p-1"
                    title="Delete Stage"
                >
                    {/* Replaced <TrashIcon /> with text */}
                    <span className="text-sm">🗑️</span> 
                </button>
            )}
          </div>
        ))}

        {/* Add Stage Button */}
        <button
          onClick={addStage}
          className="w-24 h-24 flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg text-gray-600 hover:bg-gray-200 transition"
        >
          {/* Replaced <PlusIcon /> with text */}
          <span className="text-2xl font-light">+</span> 
          <span className="text-sm">Add Stage</span>
        </button>

      </div>
    </div>
  );
}

export default Timeline;