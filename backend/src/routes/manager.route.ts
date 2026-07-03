import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";
import { getPendingLeaves, approveLeave, rejectLeave } from "../controller/manager.controller.js";

const managerRouter:Router = Router();

managerRouter.get("/pending-leaves", verifyToken, requireRole("MANAGER"), getPendingLeaves);
managerRouter.put("/leaves/:id/approve", verifyToken, requireRole("MANAGER"), approveLeave);
managerRouter.put("/leaves/:id/reject", verifyToken, requireRole("MANAGER"), rejectLeave);

export default managerRouter;