import type { Response, NextFunction } from "express";
import type { Role,AuthRequest } from "../types/index.js"

export const requireRole = (...allowedRoles: Role[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: "not authenticated" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "access denied: insufficient permissions" });
        }

        next();
    };
};