// Seed script for creating a full sample course (no minigame/animation)
// Usage:
// 1. Ensure backend is configured with MONGO_URI env var (or update below).
// 2. From backend folder run: `node scripts/seedCourse.js`
// This script will create a teacher user (if not provided), create a course with lessons and fields,
// and print created IDs. It is safe to run multiple times (creates new documents each run).

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../src/models/mongo/userModel.js';
import Course from '../src/models/mongo/courseModel.js';
import Lesson from '../src/models/mongo/lessonModel.js';
import Field from '../src/models/mongo/fieldModel.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mindquest';

const createSample = async () => {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  // 1) Create or find a teacher user
  // Use the teacher account provided by user
  const TEACHER_EMAIL = process.env.SEED_TEACHER_EMAIL || 'mmm@gmail.com';
  const TEACHER_PASSWORD = process.env.SEED_TEACHER_PASSWORD || '123123';

  let teacher = await User.findOne({ email: TEACHER_EMAIL });
  if (!teacher) {
    teacher = await User.create({
      name: 'Seeded Teacher',
      email: TEACHER_EMAIL,
      password: TEACHER_PASSWORD,
      role: 'teacher',
      profileImage: '',
    });
    console.log('Created teacher user:', teacher._id, TEACHER_EMAIL);
  } else {
    console.log('Found existing teacher user:', teacher._id, TEACHER_EMAIL);
  }

  // 2) Create course
  const course = await Course.create({
    title: 'Full Sample Course: Introduction to MindQuest',
    description: 'A comprehensive sample course created for testing. Contains multiple lesson types and a quiz.',
    difficulty: 'Beginner',
    thumbnail: '',
    teacherId: teacher._id,
    scoreOnFinish: 100,
  });
  console.log('Created course:', course._id);

  // 3) Lessons with fields
  const lessonsData = [
    {
      title: 'Lesson 1: Welcome & Overview',
      fields: [
        { type: 'paragraph', content: 'Welcome to the course! This lesson covers the overview and goals.' },
        { type: 'image', content: 'https://placekitten.com/800/400' },
        { type: 'youtube', content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      ],
    },
    {
      title: 'Lesson 2: Basics',
      fields: [
        { type: 'paragraph', content: 'Basic concepts explained in plain language.' },
        { type: 'code', content: "console.log('Hello World')", questionId: null },
        { type: 'question', content: 'What is 2 + 2?', answer: '4', explanation: 'Simple arithmetic' },
      ],
    },
    {
      title: 'Lesson 3: Deep Dive',
      fields: [
        { type: 'paragraph', content: 'A deeper explanation with examples and links.' },
        { type: 'html', content: '<h3>Embedded HTML example</h3><p>This is a test.</p>' },
        { type: 'question', content: 'Which option is correct?', answer: 'Option B', explanation: 'Because B is best' },
      ],
    },
  ];

  const createdLessonIds = [];
  for (const lessonData of lessonsData) {
    const lesson = await Lesson.create({ title: lessonData.title, courseId: course._id });
    const createdFields = [];
    for (let i = 0; i < lessonData.fields.length; i++) {
      const f = lessonData.fields[i];
      const fieldDoc = await Field.create({
        lessonId: lesson._id,
        type: f.type,
        content: f.content,
        questionId: f.questionId || null,
        order: i,
      });
      createdFields.push(fieldDoc._id);
    }
    lesson.fieldIds = createdFields;
    await lesson.save();
    createdLessonIds.push(lesson._id);
    console.log(`Created lesson ${lesson.title} with ${createdFields.length} fields`);
  }

  // Update course with lessons
  course.lessonIds = createdLessonIds;
  course.lessonsCount = createdLessonIds.length;
  await course.save();

  console.log('Seeding complete.');
  console.log('Course ID:', course._id);
  console.log('Lesson IDs:', createdLessonIds);

  await mongoose.disconnect();
  console.log('Disconnected.');
};

createSample().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
