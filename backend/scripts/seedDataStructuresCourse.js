// Seed script for creating a comprehensive Data Structures course for testing
// Usage: From backend folder run: `node scripts/seedDataStructuresCourse.js`

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../src/models/mongo/userModel.js';
import Course from '../src/models/mongo/courseModel.js';
import Lesson from '../src/models/mongo/lessonModel.js';
import Field from '../src/models/mongo/fieldModel.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mindquest';

const createSampleCourse = async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✓ Connected to MongoDB');

    // 1) Create or find a teacher user
    const TEACHER_EMAIL = process.env.SEED_TEACHER_EMAIL || 'mmm@gmail.com';
    const TEACHER_PASSWORD = process.env.SEED_TEACHER_PASSWORD || '123123';

    let teacher = await User.findOne({ email: TEACHER_EMAIL });
    if (!teacher) {
      teacher = await User.create({
        name: 'Data Structures Teacher',
        email: TEACHER_EMAIL,
        password: TEACHER_PASSWORD,
        role: 'teacher',
        profileImage: '',
      });
      console.log('✓ Created teacher user:', teacher._id);
    } else {
      console.log('✓ Found existing teacher user:', teacher._id);
    }

    // 2) Create course
    const course = await Course.create({
      title: 'Introduction to Data Structures',
      description: 'A comprehensive course covering the fundamentals of data structures including introduction, arrays, and linked lists.',
      difficulty: 'Beginner',
      category: 'Computer Science',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400',
      teacherId: teacher._id,
      scoreOnFinish: 100,
      lessonsCount: 3,
      students: 0,
      duration: '4 weeks',
      tags: ['Data Structures', 'Arrays', 'Linked Lists', 'Computer Science'],
      price: 'Free',
    });
    console.log('✓ Created course:', course._id);

    // 3) Define lessons with detailed content
    const lessonsData = [
      {
        title: 'Lesson 1: Introduction to Data Structures',
        fields: [
          {
            type: 'paragraph',
            content: 'Data structures are specialized formats for organizing, processing, and storing data in a computer. They are crucial for efficient algorithm design and implementation. A data structure determines how data is arranged in memory and what operations can be performed on it efficiently.',
            order: 0,
          },
          {
            type: 'image',
            content: 'https://images.unsplash.com/photo-1516321318423-f06f70259b51?w=800&h=400',
            order: 1,
          },
          {
            type: 'paragraph',
            content: 'There are two main categories of data structures: linear and non-linear. Linear data structures (like arrays and linked lists) store data in a sequential manner, while non-linear data structures (like trees and graphs) organize data hierarchically. Understanding these fundamental concepts is essential for writing efficient code and solving complex problems.',
            order: 2,
          },
          {
            type: 'animation',
            content: null, // Will be updated when you create animations
            order: 3,
          },
          {
            type: 'paragraph',
            content: 'In this course, we will explore the most important data structures, their implementations, time complexities, and real-world applications. You will learn how to choose the right data structure for different problems and how to optimize your code for performance.',
            order: 4,
          },
          {
            type: 'youtube',
            content: 'https://www.youtube.com/embed/bum_19loj9A',
            order: 5,
          },
          {
            type: 'code',
            content: `// Basic example of why data structures matter
class DataStructureExample {
  // Linear: Array - O(1) access, O(n) insertion
  exampleArray = [1, 2, 3, 4, 5];
  
  // Different operations have different efficiencies
  accessElement(index) {
    return this.exampleArray[index]; // O(1)
  }
  
  insertElement(index, value) {
    // O(n) because we need to shift elements
    this.exampleArray.splice(index, 0, value);
  }
}`,
            order: 6,
          },
        ],
      },
      {
        title: 'Lesson 2: Arrays',
        fields: [
          {
            type: 'paragraph',
            content: 'Arrays are one of the most fundamental and widely used data structures. An array is a contiguous block of memory that stores multiple elements of the same type. Arrays provide constant-time O(1) access to any element by index, making them extremely efficient for retrieval operations.',
            order: 0,
          },
          {
            type: 'image',
            content: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400',
            order: 1,
          },
          {
            type: 'paragraph',
            content: 'The main advantage of arrays is their fast access time. However, insertion and deletion operations can be slow because they require shifting elements. In dynamic arrays (like JavaScript arrays or Java ArrayLists), the underlying structure is automatically resized when necessary. Understanding array operations and their time complexities is crucial for writing efficient algorithms.',
            order: 2,
          },
          {
            type: 'animation',
            content: null, // Will be updated when you create animations
            order: 3,
          },
          {
            type: 'paragraph',
            content: 'Arrays can be multi-dimensional, allowing you to represent matrices and higher-dimensional data. Common array operations include searching (linear or binary search), sorting, filtering, and mapping. Mastering array manipulation is fundamental to computer science.',
            order: 4,
          },
          {
            type: 'youtube',
            content: 'https://www.youtube.com/embed/RSXM7GeqALw',
            order: 5,
          },
          {
            type: 'code',
            content: `// Array operations and their time complexities
class ArrayOperations {
  constructor() {
    this.arr = [10, 20, 30, 40, 50];
  }
  
  // Access: O(1)
  getElement(index) {
    return this.arr[index];
  }
  
  // Search: O(n)
  linearSearch(target) {
    for (let i = 0; i < this.arr.length; i++) {
      if (this.arr[i] === target) return i;
    }
    return -1;
  }
  
  // Insertion: O(n)
  insert(index, value) {
    this.arr.splice(index, 0, value);
  }
  
  // Deletion: O(n)
  delete(index) {
    this.arr.splice(index, 1);
  }
  
  // Traversal: O(n)
  traverse() {
    this.arr.forEach((element, index) => {
      console.log(\`Index: \${index}, Value: \${element}\`);
    });
  }
}`,
            order: 6,
          },
        ],
      },
      {
        title: 'Lesson 3: Linked Lists',
        fields: [
          {
            type: 'paragraph',
            content: 'A linked list is a linear data structure where elements are stored in nodes, and each node contains a reference (or pointer) to the next node. Unlike arrays, linked lists do not require contiguous memory, making them flexible for dynamic allocation. Each node typically contains data and a link to the next node (and in doubly linked lists, also a link to the previous node).',
            order: 0,
          },
          {
            type: 'image',
            content: 'https://images.unsplash.com/photo-1579546905660-24626f00912b?w=800&h=400',
            order: 1,
          },
          {
            type: 'paragraph',
            content: 'The key advantage of linked lists is their efficient insertion and deletion operations, which are O(1) when you have a reference to the node. However, accessing an element requires traversing from the head, making random access O(n). Linked lists are commonly used in implementations of stacks, queues, and graphs. Understanding when to use a linked list versus an array is critical for algorithm optimization.',
            order: 2,
          },
          {
            type: 'animation',
            content: null, // Will be updated when you create animations
            order: 3,
          },
          {
            type: 'paragraph',
            content: 'There are several variations of linked lists: singly linked lists, doubly linked lists, and circular linked lists. Each variant has different properties and is suited for different use cases. Learning to implement and manipulate linked lists will strengthen your understanding of memory management and pointer-based programming.',
            order: 4,
          },
          {
            type: 'youtube',
            content: 'https://www.youtube.com/embed/WwfhLC16bis',
            order: 5,
          },
          {
            type: 'code',
            content: `// Linked List implementation
class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }
  
  // Insert at beginning: O(1)
  insertAtBeginning(data) {
    const newNode = new Node(data);
    newNode.next = this.head;
    this.head = newNode;
  }
  
  // Search: O(n)
  search(target) {
    let current = this.head;
    while (current !== null) {
      if (current.data === target) return true;
      current = current.next;
    }
    return false;
  }
  
  // Traverse: O(n)
  traverse() {
    let current = this.head;
    let result = [];
    while (current !== null) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }
  
  // Delete: O(n)
  delete(target) {
    if (this.head === null) return;
    if (this.head.data === target) {
      this.head = this.head.next;
      return;
    }
    let current = this.head;
    while (current.next !== null) {
      if (current.next.data === target) {
        current.next = current.next.next;
        return;
      }
      current = current.next;
    }
  }
}`,
            order: 6,
          },
        ],
      },
    ];

    // 4) Create lessons and fields
    const createdLessonIds = [];
    for (const lessonData of lessonsData) {
      const lesson = await Lesson.create({
        title: lessonData.title,
        courseId: course._id,
      });

      const createdFields = [];
      for (const fieldData of lessonData.fields) {
        const fieldDoc = await Field.create({
          lessonId: lesson._id,
          type: fieldData.type,
          content: fieldData.content,
          order: fieldData.order,
          questionId: null,
          animationId: null,
        });
        createdFields.push(fieldDoc._id);
      }

      lesson.fieldIds = createdFields;
      await lesson.save();
      createdLessonIds.push(lesson._id);
      console.log(`✓ Created lesson: "${lesson.title}" with ${createdFields.length} fields`);
    }

    // 5) Update course with lessons
    course.lessonIds = createdLessonIds;
    course.lessonsCount = createdLessonIds.length;
    await course.save();

    console.log('\n✅ Seeding complete!');
    console.log(`📚 Course ID: ${course._id}`);
    console.log(`📖 Lessons: ${createdLessonIds.length}`);
    console.log('\nCourse Details:');
    console.log(`  Title: ${course.title}`);
    console.log(`  Teacher: ${teacher.email}`);
    console.log(`  Total Fields: ${lessonsData.reduce((acc, lesson) => acc + lesson.fields.length, 0)}`);

    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

createSampleCourse();
