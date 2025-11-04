// import React, { useRef, useState, useEffect } from "react";
// import { fabric } from "fabric";
// import { PlusIcon, PlayIcon, PauseIcon, TrashIcon } from "@radix-ui/react-icons";

// const CanvasStudio = () => {
//   const canvasRef = useRef(null);
//   const fabricRef = useRef(null);

//   const [activeTool, setActiveTool] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [stages, setStages] = useState([{ id: 0, objects: [] }]);
//   const [currentStage, setCurrentStage] = useState(0);

//   // 🖼️ Initialize Fabric canvas
//   useEffect(() => {
//     const canvas = new fabric.Canvas(canvasRef.current, {
//       width: 900,
//       height: 550,
//       backgroundColor: "#fff",
//       selection: true,
//     });

//     fabricRef.current = canvas;

//     // drag move listener
//     canvas.on("object:modified", saveStageState);
//     canvas.on("object:added", saveStageState);
//     return () => canvas.dispose();
//   }, []);

//   // 🧠 Save current canvas state to stage
//   const saveStageState = () => {
//     const json = fabricRef.current.toJSON();
//     setStages((prev) =>
//       prev.map((stage, idx) =>
//         idx === currentStage ? { ...stage, objects: json.objects } : stage
//       )
//     );
//   };

//   // 🔄 Load selected stage objects
//   const loadStage = (index) => {
//     const stage = stages[index];
//     const canvas = fabricRef.current;
//     canvas.clear();
//     canvas.setBackgroundColor("#fff", canvas.renderAll.bind(canvas));
//     if (stage?.objects?.length) {
//       canvas.loadFromJSON({ objects: stage.objects }, canvas.renderAll.bind(canvas));
//     }
//     setCurrentStage(index);
//   };

//   // ➕ Add shape
//   const addShape = (type) => {
//     const canvas = fabricRef.current;
//     let shape;

//     switch (type) {
//       case "circle":
//         shape = new fabric.Circle({
//           radius: 40,
//           fill: "#4F46E5",
//           left: 100,
//           top: 100,
//         });
//         break;
//       case "square":
//         shape = new fabric.Rect({
//           width: 80,
//           height: 80,
//           fill: "#10B981",
//           left: 150,
//           top: 100,
//         });
//         break;
//       case "triangle":
//         shape = new fabric.Triangle({
//           width: 80,
//           height: 80,
//           fill: "#F59E0B",
//           left: 200,
//           top: 100,
//         });
//         break;
//       case "text":
//         shape = new fabric.Textbox("Text", {
//           left: 250,
//           top: 100,
//           fontSize: 22,
//           fill: "#111827",
//         });
//         break;
//       default:
//         return;
//     }

//     canvas.add(shape);
//     canvas.setActiveObject(shape);
//     canvas.renderAll();
//   };

//   // 🎬 Animation Playback (stage switching)
//   const playAnimation = async () => {
//     if (isPlaying) return;
//     setIsPlaying(true);
//     for (let i = 0; i < stages.length; i++) {
//       loadStage(i);
//       await new Promise((r) => setTimeout(r, 1000));
//     }
//     setIsPlaying(false);
//   };

//   const addStage = () => {
//     const newStage = { id: stages.length, objects: [] };
//     setStages((prev) => [...prev, newStage]);
//   };

//   const deleteStage = (index) => {
//     setStages((prev) => prev.filter((_, i) => i !== index));
//     if (currentStage >= stages.length - 1) setCurrentStage(stages.length - 2);
//   };

//   const exportJSON = () => {
//     const data = JSON.stringify(stages);
//     const blob = new Blob([data], { type: "application/json" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = "animation.json";
//     link.click();
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gray-100">
//       {/* 🔝 Top Bar */}
//       <div className="flex items-center justify-between bg-indigo-600 text-white px-4 py-2 shadow">
//         <h1 className="text-lg font-semibold">🎨 MindQuest Animation Studio</h1>
//         <div className="flex gap-2">
//           <button onClick={addStage} className="bg-indigo-500 hover:bg-indigo-400 px-3 py-1 rounded flex items-center gap-1">
//             <PlusIcon /> Stage
//           </button>
//           <button
//             onClick={playAnimation}
//             className="bg-green-500 hover:bg-green-400 px-3 py-1 rounded flex items-center gap-1"
//           >
//             {isPlaying ? <PauseIcon /> : <PlayIcon />} Play
//           </button>
//           <button
//             onClick={exportJSON}
//             className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
//           >
//             Save JSON
//           </button>
//         </div>
//       </div>

//       {/* 🧭 Studio Layout */}
//       <div className="flex flex-1 overflow-hidden">
//         {/* Toolbox */}
//         <div className="w-48 bg-white shadow flex flex-col p-3 border-r border-gray-200">
//           <h2 className="font-medium mb-2 text-gray-800">Tools</h2>
//           <button onClick={() => addShape("circle")} className="bg-blue-100 hover:bg-blue-200 mb-2 py-1 rounded">Circle</button>
//           <button onClick={() => addShape("square")} className="bg-green-100 hover:bg-green-200 mb-2 py-1 rounded">Square</button>
//           <button onClick={() => addShape("triangle")} className="bg-yellow-100 hover:bg-yellow-200 mb-2 py-1 rounded">Triangle</button>
//           <button onClick={() => addShape("text")} className="bg-gray-100 hover:bg-gray-200 mb-2 py-1 rounded">Text</button>
//         </div>

//         {/* Canvas */}
//         <div className="flex-1 flex items-center justify-center bg-gray-50">
//           <canvas ref={canvasRef} className="border border-gray-300 rounded-lg shadow-sm"></canvas>
//         </div>

//         {/* Stage List */}
//         <div className="w-52 bg-white border-l border-gray-200 shadow-sm flex flex-col p-3">
//           <h2 className="font-medium mb-3 text-gray-800">Stages</h2>
//           {stages.map((stage, index) => (
//             <div
//               key={stage.id}
//               onClick={() => loadStage(index)}
//               className={`flex justify-between items-center px-3 py-1 mb-2 rounded cursor-pointer ${
//                 index === currentStage ? "bg-indigo-100" : "hover:bg-gray-100"
//               }`}
//             >
//               <span>Stage {index + 1}</span>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   deleteStage(index);
//                 }}
//                 className="text-red-500 hover:text-red-700"
//               >
//                 <TrashIcon />
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CanvasStudio;
