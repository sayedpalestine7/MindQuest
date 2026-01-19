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
    <div className="mq-card p-4 h-full flex flex-col">
      {/* Section 1: Continue Learning (Action) */}
      {continueLearning ? (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-slate-800">
            <PlayCircle className="w-5 h-5 text-slate-600" />
            Continue Learning
          </h2>
          
          <div className="space-y-2">
            {/* Course Title */}
            <div className="flex items-start gap-2">
              <BookOpen className="w-4 h-4 mt-0.5 text-slate-500" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  {continueLearning.courseTitle}
                </p>
                
                {/* Next Lesson Title (if available) */}
                {continueLearning.nextLessonTitle && (
                  <p className="text-xs mt-0.5 text-slate-600">
                    Next: {continueLearning.nextLessonTitle}
                  </p>
                )}
                
                {/* Progress Summary */}
                <p className="text-xs mt-1 text-slate-400">
                  {continueLearning.completedLessons} / {continueLearning.totalLessons} lessons
                </p>
              </div>
            </div>
            
            {/* Resume Button */}
            <motion.button
              onClick={handleResume}
              className="mq-btn-primary w-full mt-3 py-2 px-4 text-sm"
              whileHover={{ scale: 1.02 }}
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
          <h2 className="text-lg font-bold mb-3 text-slate-800">
            Continue Learning
          </h2>
          <p className="text-sm text-slate-400">
            No active courses yet. Browse courses to get started!
          </p>
        </motion.div>
      )}

      {/* Separator */}
      {continueLearning && recentActivity.length > 0 && (
        <div className="border-t border-slate-200" />
      )}

      {/* Section 2: Recent Activity (Info) */}
      {recentActivity.length > 0 && (
        <motion.div
          className="mt-4 flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3 className="text-base font-semibold mb-3 text-slate-600">
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
                  <Icon className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800">
                      {item.text}
                    </p>
                    {relativeTime && (
                      <p className="text-xs mt-0.5 text-slate-400">
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
