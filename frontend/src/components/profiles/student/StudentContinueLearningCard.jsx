import React from "react";
import { motion } from "framer-motion";
import { PlayCircle, BookOpen, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router";

/**
 * Helper: Format relative time (e.g., "2 hours ago", "3 days ago")
 */
function getRelativeTime(date) {
  if (!date) return null;
  
  const now = new Date();
  const target = new Date(date);
  const diffMs = now - target;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

/**
 * StudentContinueLearningCard
 * 
 * Replaces "Learning Overview" with actionable "Continue Learning" section
 * and "Recent Activity" information.
 * 
 * Props:
 * - continueLearning: { courseId, courseTitle, nextLessonTitle, completedLessons, totalLessons, resumeLessonId }
 * - recentActivity: array of { icon: Component, text: string, timestamp: Date }
 */
export default function StudentContinueLearningCard({ continueLearning, recentActivity = [] }) {
  const navigate = useNavigate();

  const handleResume = () => {
    if (!continueLearning?.courseId) return;
    
    // Navigate to course page with optional resumeLessonId state
    navigate(`/student/coursePage/${continueLearning.courseId}`, {
      state: { resumeLessonId: continueLearning.resumeLessonId }
    });
  };

  return (
    <div 
      className="rounded-lg shadow-sm p-4 h-full flex flex-col" 
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', borderWidth: '1px', borderStyle: 'solid' }}
    >
      {/* Section 1: Continue Learning (Action) */}
      {continueLearning ? (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: '#263238' }}>
            <PlayCircle className="w-5 h-5" style={{ color: '#546E7A' }} />
            Continue Learning
          </h2>
          
          <div className="space-y-2">
            {/* Course Title */}
            <div className="flex items-start gap-2">
              <BookOpen className="w-4 h-4 mt-0.5" style={{ color: '#78909C' }} />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#263238' }}>
                  {continueLearning.courseTitle}
                </p>
                
                {/* Next Lesson Title (if available) */}
                {continueLearning.nextLessonTitle && (
                  <p className="text-xs mt-0.5" style={{ color: '#607D8B' }}>
                    Next: {continueLearning.nextLessonTitle}
                  </p>
                )}
                
                {/* Progress Summary */}
                <p className="text-xs mt-1" style={{ color: '#90A4AE' }}>
                  {continueLearning.completedLessons} / {continueLearning.totalLessons} lessons
                </p>
              </div>
            </div>
            
            {/* Resume Button */}
            <motion.button
              onClick={handleResume}
              className="w-full mt-3 py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: '#546E7A', 
                color: '#FFFFFF',
                transition: 'all 0.2s ease'
              }}
              whileHover={{ scale: 1.02, backgroundColor: '#455A64' }}
              whileTap={{ scale: 0.98 }}
            >
              <PlayCircle className="w-4 h-4" />
              Resume Lesson
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-lg font-bold mb-3" style={{ color: '#263238' }}>
            Continue Learning
          </h2>
          <p className="text-sm" style={{ color: '#90A4AE' }}>
            No active courses yet. Browse courses to get started!
          </p>
        </motion.div>
      )}

      {/* Separator */}
      {continueLearning && recentActivity.length > 0 && (
        <div className="border-t" style={{ borderColor: '#E0E0E0' }} />
      )}

      {/* Section 2: Recent Activity (Info) */}
      {recentActivity.length > 0 && (
        <motion.div
          className="mt-4 flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3 className="text-base font-semibold mb-3" style={{ color: '#607D8B' }}>
            Recent Activity
          </h3>
          
          <div className="space-y-3">
            {recentActivity.slice(0, 3).map((item, index) => {
              const Icon = item.icon;
              const relativeTime = getRelativeTime(item.timestamp);
              
              return (
                <motion.div
                  key={index}
                  className="flex items-start gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 + index * 0.05 }}
                >
                  <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#78909C' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: '#263238' }}>
                      {item.text}
                    </p>
                    {relativeTime && (
                      <p className="text-xs mt-0.5" style={{ color: '#90A4AE' }}>
                        {relativeTime}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
