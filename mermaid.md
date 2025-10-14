``` mermaid
classDiagram
    class User {
        +id: String
        +name: String
        +email: String
        +password: String
        +profileImage: String
        +role: "admin" | "teacher" | "student"
        +createdAt: Date
        +teacherData?: TeacherData
        +studentData?: StudentData
    }

    class TeacherData {
        +specialization: String
        +institution: String
        +certification: File
        +score: Int
    }

    class StudentData {
        +score: Int
        +finishedCourses: Int
    }

    class Course {
        +id: String
        +title: String
        +description: String
        +thumbnail: Image
        +teacherId: ObjectId
        +lessonIds: ObjectId[]
        +quizId: ObjectId
        +difficulty: String
        +scoreOnFinish: Int
        +createdAt: Date
    }

    class Lesson {
        +id: String
        +title: String
        +fields: ObjectId[]
        +createdAt: Date
    }

    class Field {
        +id: String
        +type: "paragraph" | "image" | "youtube" | "html" | "minigame" | "question"
        +content: Mixed
        +questionId?: ObjectId
    }

    class Quiz {
        +id: String
        +title: String
        +questionIds: ObjectId[]
    }

    class Question {
        +id: String
        +text: String
        +type: "mcq" | "tf" | "short"
        +options: String[]
        +correctAnswer: String
        +points: Int
        +explanation: String
    }

    class Progress {
        +id: String
        +studentId: ObjectId
        +courseId: ObjectId
        +completedLessons: ObjectId[]
        +quizScore: Int
        +totalScore: Int
        +status: "in-progress" | "completed"
    }

    %% Relationships
    User "1" --> "many" Course : creates >
    Course "1" --> "many" Lesson
    Lesson "1" --> "many" Field
    Field "1" --> "0..1" Question
    Course "1" --> "1" Quiz
    Quiz "1" --> "many" Question
    User "1" --> "many" Progress : tracks >
    Course "1" --> "many" Progress : has >

```