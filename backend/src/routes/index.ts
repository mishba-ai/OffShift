import { Router } from "express";
import auth from "./auth.route.js";
import empRoutes from "./employee.route.js";
import type { Router as ExpressRouter } from 'express'

const router: ExpressRouter = Router()

router.use('', auth)

export {router}