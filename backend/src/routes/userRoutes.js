import express from "express";
import { getAllUsers, approveTeacher, getPendingTeachers, toggleBanUser, rejectTeacher } from "../controllers/userController.js";


const router = express.Router();

// /api/admin/users
router.get("/users", getAllUsers);
router.put("/ban-user/:id", toggleBanUser);
router.put("/approve-teacher/:id", approveTeacher);
router.get("/pending-teachers", getPendingTeachers);
router.put("/reject-teacher/:id", rejectTeacher);



export default router;
