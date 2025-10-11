``` mermaid
classDiagram
    class Admin {
        +id: String
        +name: String
        +email: String
        +password: String
    }

    class Teacher {
        +id: String
        +name: String
        +email: String
        +password: String
        +profileImage: Image
        +createAt: Date
        +specialization: String
        +instetution: String
        +certification: File
        +numberOfStudent: Int
        +numberOfCoures: Int
        +score: Int
    }

    Teacher : +getNumberOfCourses(Int)

    class Student {
        +id: String
        +name: String
        +email: String
        +password: String
        +profileImage: Image
        +score: Int
        +createAt: Date
        +numberOfFinishedCoureses : Int
    }

    class Course {
        +id: String
        +title: String
        +description: String
        +thumpnail : Image
        +lessons: Lesson[]
        +quizzes: Quiz
        +progress: Int
        +scoreOnFinish: Int
        +difficulty : String
    }

    class Lesson {
        +id: String
        +title: String
        +content: Field[]
    }

    class Field {
        +paragraph : String
        +image : Image
        +video : Link
        +animation : File
        +minigame : File
        +questions : Question[]
    }

    class Quiz {
        +id: String
        +title: String
        +questions: Question[]
    }

    class Question {
        +id: String
        +text: String
        +answerField : String
        +correctAnswer: String
    }

    Student --> Course
    Course --> Lesson
    Lesson --> Field
    Course --> Quiz
    Quiz --> Question
    Field --> Question
    Teacher --> Course
    
```