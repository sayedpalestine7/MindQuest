import { BookOpen, Users } from "lucide-react"
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';

export default function UserNavigates() {
  const navigate = useNavigate();

  const handleStudentEvent = () => {
    navigate('/signup');
  }
  
  const handleTeacherEvent = () => {
    navigate('/teacher/signup');
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  }

  const hoverVariants = {
    hover: {
      scale: 1.03,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.98
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with animation */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 text-balance">Student & Teacher Roles</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto text-pretty">
            Understand the unique capabilities and responsibilities of each role in our learning platform
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div 
          className="grid md:grid-cols-2 gap-8 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Student Card */}
          <motion.div 
            onClick={handleStudentEvent} 
            className="mq-card mq-card-hover hover:border-blue-500 transition-all duration-300 cursor-pointer"
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
            custom={0}
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-lg">
              <div className="flex items-center gap-3 mb-2">
                <motion.div 
                  className="p-2 bg-white/20 rounded-lg"
                  whileHover={{ rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <BookOpen className="w-6 h-6 text-white" />
                </motion.div>
                <h2 className="text-3xl text-white font-bold">Student</h2>
              </div>
              <p className="text-blue-100 text-base">
                Learner focused on growth and knowledge acquisition
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">What Students Can Do:</h4>
                  <ul className="space-y-3">
                    {[
                      { title: "Access Interactive Lessons", desc: "Learn algorithms, data structures, and software engineering concepts using animations, diagrams, and visual explanations." },
                      { title: "Take Quizzes & Practice Problems", desc: "Answer MCQs, coding logic questions, and instant-feedback quizzes to test understanding." },
                      { title: "Track Learning Progress", desc: "Monitor completed lessons, earned points, badges, and overall course progress." },
                      { title: "Save & Resume Courses", desc: "Return to lessons exactly where they left off, with progress automatically saved." },
                      { title: "Engage With Challenges", desc: "Participate in daily or weekly practice challenges to reinforce key concepts." }
                    ].map((item, index) => (
                      <motion.li 
                        key={index}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + (index * 0.1) }}
                      >
                        <span className="text-blue-500 font-bold mt-1">•</span>
                        <div>
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Teacher Card */}
          <motion.div 
            onClick={handleTeacherEvent} 
            className="mq-card mq-card-hover hover:border-green-500 transition-all duration-300 cursor-pointer"
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
            custom={1}
          >
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-t-lg">
              <div className="flex items-center gap-3 mb-2">
                <motion.div 
                  className="p-2 bg-white/20 rounded-lg"
                  whileHover={{ rotate: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Users className="w-6 h-6 text-white" />
                </motion.div>
                <h2 className="text-3xl text-white font-bold">Teacher</h2>
              </div>
              <p className="text-green-100 text-base">
                Educator dedicated to facilitating learning outcomes
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">What Teachers Can Do:</h4>
                  <ul className="space-y-3">
                    {[
                      { title: "Create & Upload Interactive Lessons", desc: "Design lessons enriched with text explanations, diagrams, and step-by-step animations." },
                      { title: "Build Quizzes & Assessments", desc: "Add quizzes, practice tasks, and problems with correct answers and explanations." },
                      { title: "Manage Courses", desc: "Add new courses, update content, reorder lessons, or delete outdated materials." },
                      { title: "Review Student Analytics", desc: "Access statistics like course completion rates, student scores, and lesson engagement." },
                      { title: "Verify & Approve Certificates", desc: "Submit professional certificates to prove teacher identity and get approval from admin." }
                    ].map((item, index) => (
                      <motion.li 
                        key={index}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + (index * 0.1) }}
                      >
                        <span className="text-green-500 font-bold mt-1">•</span>
                        <div>
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p className="text-gray-600">
            Both roles work together to create an engaging and effective learning environment
          </p>
        </motion.div>
      </div>
    </main>
  )
}