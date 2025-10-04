# Interactive Course Builder

> A web-based platform for interactive learning of technical topics like data structures and algorithms.  
> Users can explore courses with animations, mini-games, and quizzes to reinforce concepts.

---

## 🧠 Project Overview

This project is designed as a graduation project for a computer engineering degree.  
The goal is to build a **fully functional web application** that provides an engaging, interactive learning experience.

### Features
- User authentication (signup, login)
- Interactive lessons with animations (stack push/pop, linked list traversal, etc.)
- Mini-games and simulations to practice concepts
- Quizzes for each lesson
- Progress tracking and optional achievements/points system

---

## 🧰 Tech Stack

**Frontend:**  
- React  
- Tailwind CSS  
- Framer Motion (for animations)  

**Backend:**  
- Node.js + Express  
- PostgreSQL + Prisma (for user accounts, progress tracking)  
- MongoDB + Mongoose (for courses, lessons, animations, quizzes)  

**DevOps / Tools:**  
- Git & GitHub  
- Docker (optional for deployment consistency)  

---

## 📂 Project Structure

backend/
├── src/
│ ├── controllers/
│ ├── routes/
│ ├── middleware/
│ ├── models/
│ ├── utils/
│ ├── prisma/
│ ├── db/
│ └── server.js
frontend/
├── src/
│ ├── components/
│ ├── pages/
│ ├── context/
│ ├── hooks/
│ ├── services/
│ └── App.jsx


---

## ⚙️ Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/sayedpalestine7/MindQuest
    cd interactive-course-builder/backend

2. Install backend dependencie
    npm install

3. Create .env file in backend/
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/coursebuilder
    POSTGRES_URL=postgresql://USER:PASSWORD@localhost:5432/coursebuilder
    JWT_SECRET=your_super_secret_key

4. Initialize Prisma
    npx prisma generate
    npx prisma migrate dev --name init

5. Start backend server
    npm run dev

6.Frontend setup
    Go to frontend/ and install dependencies:
    npm install
    npm start

🔗 Links

GitHub Repository: <your-repo-url>

Project Documentation: TBD

📝 License

This project is licensed under the MIT License.

👨‍💻 Author

Sayed Qutob
Ahmad Dardouk
Computer Engineering Student | Graduation Project