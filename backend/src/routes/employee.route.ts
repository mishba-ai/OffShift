import  { Router } from "express";
import { getEmployee ,getEmployees} from "../controller/employee.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const empRoutes: Router = Router();

empRoutes.get('/employees',verifyToken,requireRole("MANAGER"),getEmployees)
empRoutes.get('/employee/:id',verifyToken,getEmployee)


export default empRoutes;