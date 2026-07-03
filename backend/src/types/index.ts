import type { JwtPayload } from "jsonwebtoken";
import type {Request} from 'express'
export interface Appjwtpayload extends JwtPayload {
    id:string;
    role:"EMPLOYEE"|"MANAGER"
}

export type Role = "EMPLOYEE" | "MANAGER";

 export interface AuthRequest extends Request {
    user?: {
        role: Role;
        [key: string]: any;
    };
}
