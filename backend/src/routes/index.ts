import { Router } from "express";
import auth from "./auth.route.js";
import empRoutes from "./employee.route.js";
import leaveRouter from "./leave.routes.js";
import managerRouter from "./manager.route.js";
import type { Router as ExpressRouter } from 'express'

const router: ExpressRouter = Router()

router.use('', auth)
router.use('',empRoutes)
router.use('',leaveRouter)
router.use('',managerRouter)


export {router}