import { Register, login, logout } from "../controller/auth.controller.js";
import  { Router } from "express";

const auth: Router = Router();

auth.post('/auth/register', Register);
auth.post('/auth/login', login);
auth.post('/auth/logout', logout);

export default auth;