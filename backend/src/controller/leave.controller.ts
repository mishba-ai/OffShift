import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { LeaveStatus, LeaveType } from "../generated/prisma/client.js";

const calculateDays = (start: Date, end: Date): number => {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((end.getTime() - start.getTime()) / msPerDay) + 1;
};

export const applyLeave = async (req: Request, res: Response) => {
    try {
        const employeeId = req.user!.id;
        const { leaveType, startDate, endDate, reason } = req.body;

        if (!leaveType || !startDate || !endDate || !reason) {
            return res.status(400).json({ error: "leaveType, startDate, endDate, and reason are required" });
        }

        if (!Object.values(LeaveType).includes(leaveType)) {
            return res.status(400).json({ error: "Invalid leaveType" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        if (end < start) {
            return res.status(400).json({ error: "endDate cannot be before startDate" });
        }

        const totalDays = calculateDays(start, end);
        const year = start.getFullYear();

        // check balance before allowing the request 
        const balance = await prisma.leaveBalance.findUnique({
            where: { employeeId_leaveType_year: { employeeId, leaveType, year } },
        });

        if (balance && balance.remaining < totalDays) {
            return res.status(400).json({
                error: `Insufficient leave balance. Remaining: ${balance.remaining}, requested: ${totalDays}`,
            });
        }

        const leave = await prisma.leave.create({
            data: {
                employeeId,
                leaveType,
                startDate: start,
                endDate: end,
                totalDays,
                reason,
                status: LeaveStatus.PENDING,
            },
        });

        return res.status(201).json({ leave });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Employee's own leaves
export const getMyLeaves = async (req: Request, res: Response) => {
    try {
        const employeeId = req.user!.id;
        const { status, type, search } = req.query;

        const where: any = { employeeId };

        if (status) {
            if (!Object.values(LeaveStatus).includes(status as LeaveStatus)) {
                return res.status(400).json({ error: "Invalid status filter" });
            }
            where.status = status;
        }

        if (type) {
            if (!Object.values(LeaveType).includes(type as LeaveType)) {
                return res.status(400).json({ error: "Invalid type filter" });
            }
            where.leaveType = type;
        }

        if (search) {
            where.reason = { contains: search as string, mode: "insensitive" };
        }

        const leaves = await prisma.leave.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        return res.status(200).json({ leaves });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

//  /api/leaves/:id
export const getLeaveById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const requester = req.user!;
        if (!id || typeof id !== "string") {
            return res.status(400).json({ error: "Invalid leave id" });
        }
        const leave = await prisma.leave.findUnique({
            where: { id },
            include: { employee: { select: { id: true, name: true, email: true, department: true } } },
        });

        if (!leave) {
            return res.status(404).json({ error: "Leave not found" });
        }

        const isOwner = leave.employeeId === requester.id;
        const isManager = requester.role === "MANAGER";

        if (!isOwner && !isManager) {
            return res.status(403).json({ error: "Access denied" });
        }

        return res.status(200).json({ leave });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// PUT /api/leaves/:id 
export const updateLeave = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const employeeId = req.user!.id;
        const { leaveType, startDate, endDate, reason } = req.body;
        if (!id || typeof id !== "string") {
            return res.status(400).json({ error: "Invalid leave id" });
        }
        const existing = await prisma.leave.findUnique({ where: { id } });

        if (!existing) {
            return res.status(404).json({ error: "Leave not found" });
        }

        if (existing.employeeId !== employeeId) {
            return res.status(403).json({ error: "You can only edit your own leave requests" });
        }

        if (existing.status !== LeaveStatus.PENDING) {
            return res.status(400).json({ error: `Cannot edit a leave request that is already ${existing.status}` });
        }

        const start = startDate ? new Date(startDate) : existing.startDate;
        const end = endDate ? new Date(endDate) : existing.endDate;

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        if (end < start) {
            return res.status(400).json({ error: "endDate cannot be before startDate" });
        }

        if (leaveType && !Object.values(LeaveType).includes(leaveType)) {
            return res.status(400).json({ error: "Invalid leaveType" });
        }

        const totalDays = calculateDays(start, end);

        const updated = await prisma.leave.update({
            where: { id },
            data: {
                leaveType: leaveType ?? existing.leaveType,
                startDate: start,
                endDate: end,
                totalDays,
                reason: reason ?? existing.reason,
            },
        });

        return res.status(200).json({ leave: updated });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// DELETE /api/leaves/:id 
export const deleteLeave = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const employeeId = req.user!.id;
        if (!id || typeof id !== "string") {
            return res.status(400).json({ error: "Invalid leave id" });
        }
        const existing = await prisma.leave.findUnique({ where: { id } });

        if (!existing) {
            return res.status(404).json({ error: "Leave not found" });
        }

        if (existing.employeeId !== employeeId) {
            return res.status(403).json({ error: "You can only cancel your own leave requests" });
        }

        if (existing.status !== LeaveStatus.PENDING) {
            return res.status(400).json({ error: `Cannot cancel a leave request that is already ${existing.status}` });
        }

        const cancelled = await prisma.leave.update({
            where: { id },
            data: { status: LeaveStatus.CANCELLED },
        });

        return res.status(200).json({ leave: cancelled });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};