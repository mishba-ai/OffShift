import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

// GET /pending-leaves
export const getPendingLeaves = async (req: Request, res: Response) => {
  try {
    const { department, leaveType, page = "1", limit = "10" } = req.query;

    const where: any = { status: "PENDING" };
    if (leaveType) where.leaveType = leaveType as string;
    if (department) {
      where.employee = { department: department as string };
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const [leaves, total] = await prisma.$transaction([
      prisma.leave.findMany({
        where,
        include: {
          employee: {
            select: { id: true, name: true, email: true, department: true },
          },
        },
        orderBy: { createdAt: "asc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.leave.count({ where }),
    ]);

    return res.status(200).json({
      leaves,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /leaves/:id/approve
export const approveLeave = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    if (!id || typeof id !== "string") {
            return res.status(400).json({ error: "Invalid leave id" });
        }

    const leave = await prisma.leave.findUnique({ where: { id } });

    if (!leave) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    if (leave.status !== "PENDING") {
      return res.status(400).json({
        error: `Cannot approve a leave that is already ${leave.status.toLowerCase()}`,
      });
    }

    const year = new Date(leave.startDate).getFullYear();
    const totalDays = Math.round(
      (leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    const balance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveType_year: {
          employeeId: leave.employeeId,
          leaveType: leave.leaveType,
          year,
        },
      },
    });

    if (!balance || balance.remaining < totalDays) {
      return res.status(400).json({
        error: "Insufficient leave balance to approve this request",
      });
    }

    const [updatedLeave] = await prisma.$transaction([
      prisma.leave.update({
        where: { id },
        data: {
          status: "APPROVED",
          managerComments: comments ?? null,
        },
      }),
      prisma.leaveBalance.update({
        where: {
          employeeId_leaveType_year: {
            employeeId: leave.employeeId,
            leaveType: leave.leaveType,
            year,
          },
        },
        data: {
          used: { increment: totalDays },
          remaining: { decrement: totalDays },
        },
      }),
    ]);

    return res.status(200).json({ leave: updatedLeave });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /leaves/:id/reject
export const rejectLeave = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
  if (!id || typeof id !== "string") {
            return res.status(400).json({ error: "Invalid leave id" });
        }
    if (!comments || !comments.trim()) {
      return res.status(400).json({ error: "Comments are required when rejecting a leave" });
    }

    const leave = await prisma.leave.findUnique({ where: { id } });

    if (!leave) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    if (leave.status !== "PENDING") {
      return res.status(400).json({
        error: `Cannot reject a leave that is already ${leave.status.toLowerCase()}`,
      });
    }

    const updatedLeave = await prisma.leave.update({
      where: { id },
      data: {
        status: "REJECTED",
        managerComments: comments,
      },
    });

    return res.status(200).json({ leave: updatedLeave });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};