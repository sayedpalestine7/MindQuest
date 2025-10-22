import React from 'react';
import AnimationStudio from '../components/Studio/AnimationStudio';
// You may uncomment this if you have a shared layout component for teachers
// import TeacherLayout from '../components/Layout/TeacherLayout'; 

function AnimationStudioPage() {
  return (
    // <TeacherLayout> // Uncomment this if wrapping in a layout
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Animation Studio 🎬</h1>
        {/* The main studio component is rendered here */}
        <AnimationStudio />
      </div>
    // </TeacherLayout>
  );
}

export default AnimationStudioPage;