
// components/TeacherChat/dummyData.js

export const dummyStudents = [
  {
    id: "1",
    name: "Alex Johnson",
    avatar: "/student-avatar.png",
    status: "online",
    course: "React Fundamentals",
    unreadCount: 2,
    isFavorite: false,
    lastMessage: "Thanks for the feedback!",
    lastMessageTime: "2:30 PM",
  },
  {
    id: "2",
    name: "Maria Garcia",
    avatar: "/female-student-avatar.png",
    status: "online",
    course: "Web Development",
    unreadCount: 0,
    isFavorite: true,
    lastMessage: "Can I get an extension?",
    lastMessageTime: "1:15 PM",
  },
  {
    id: "3",
    name: "John Smith",
    avatar: "/male-student-avatar.png",
    status: "offline",
    course: "JavaScript Concepts",
    unreadCount: 1,
    isFavorite: false,
    lastMessage: "The assignment was great",
    lastMessageTime: "12:45 PM",
  },
  {
    id: "4",
    name: "Emma Wilson",
    avatar: "/student-avatar.png",
    status: "online",
    course: "React Fundamentals",
    unreadCount: 0,
    isFavorite: false,
    lastMessage: "See you in the live session",
    lastMessageTime: "11:20 AM",
  },
  {
    id: "5",
    name: "David Lee",
    avatar: "/male-student-avatar.png",
    status: "offline",
    course: "Web Development",
    unreadCount: 3,
    isFavorite: true,
    lastMessage: "When is the project due?",
    lastMessageTime: "10:05 AM",
  },
];

export const dummyMessages = {
  "1": [
    {
      id: "m1",
      sender: "student",
      content: "Hi Dr. Mitchell, I have a question about the React hooks lesson",
      timestamp: "2:15 PM",
      studentId: "1",
    },
    {
      id: "m2",
      sender: "teacher",
      content: "Of course! What would you like to know about React hooks?",
      timestamp: "2:20 PM",
      studentId: "1",
    },
    {
      id: "m3",
      sender: "student",
      content: "I'm confused about the useEffect cleanup function. When should I use it?",
      timestamp: "2:25 PM",
      studentId: "1",
    },
    {
      id: "m4",
      sender: "teacher",
      content:
        "The cleanup function is useful for canceling subscriptions, timers, and other side effects.",
      timestamp: "2:28 PM",
      studentId: "1",
    },
    {
      id: "m5",
      sender: "student",
      content: "Thanks for the feedback!",
      timestamp: "2:30 PM",
      studentId: "1",
    },
  ],
  "2": [
    {
      id: "m1",
      sender: "student",
      content: "Dr. Mitchell, can I get an extension on the assignment?",
      timestamp: "1:10 PM",
      studentId: "2",
    },
    {
      id: "m2",
      sender: "teacher",
      content: "Sure, when do you need it by?",
      timestamp: "1:12 PM",
      studentId: "2",
    },
    {
      id: "m3",
      sender: "student",
      content: "Can I get an extension?",
      timestamp: "1:15 PM",
      studentId: "2",
    },
  ],
};
