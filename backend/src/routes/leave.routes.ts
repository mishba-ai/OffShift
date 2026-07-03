import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  applyLeave,
  getMyLeaves,
  getLeaveById,
  updateLeave,
  deleteLeave,
} from "../controller/leave.controller.js";

const leaveRouter:Router = Router();

leaveRouter.post("/leaves", verifyToken, applyLeave);
leaveRouter.get("/leaves", verifyToken, getMyLeaves);
leaveRouter.get("/leaves/:id", verifyToken, getLeaveById);
leaveRouter.put("/leaves/:id", verifyToken, updateLeave);
leaveRouter.delete("/leaves/:id", verifyToken, deleteLeave);

export default leaveRouter;