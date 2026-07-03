import { Router } from "express";
import auth from "./auth.route.js";
import empRoutes from "./employee.route.js";
import type { Router as ExpressRouter } from 'express'
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const router: ExpressRouter = Router()

router.use('', auth)
router.use('',empRoutes)


export {router}