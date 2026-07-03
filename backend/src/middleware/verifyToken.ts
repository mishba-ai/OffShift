import type { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { Appjwtpayload } from "../types/index.js";

export const verifyToken = (req: Request, res: Response, next: NextFunction) =>{
  
    const authHeader =req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer")){
        return res.status(401).json({error:"no token provided"})
    }

    const token = authHeader.split(" ")[1]

    try {
        const decoded = jwt.verify(token!, process.env.JWT_SECRET!) as Appjwtpayload;
        req.body.user = {id:decoded.id,role:decoded.role};
        next();
    } catch (error) {
        return res.status(401).json({error:"Invalid token"})
    }
}