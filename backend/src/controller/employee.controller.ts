import type { Request, Response, NextFunction } from "express"
import prisma from "../lib/prisma.js"


export const getEmployee = async (req: Request, res: Response) => {
    try {
        const id = req.params.id 
        if (!id || typeof id !== "string") {
            return res.status(401).json({ error: 'id  is required ' })
        }
        const employee = await prisma.employee.findUnique(
            { where: { id } }
        )

        if (!employee) {
            return res.status(404).json({ error: "employee not found" })
        }

        const { password, ...employeeWithoutPassword } = employee;

        return res.status(200).json({ employee: employeeWithoutPassword });

    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "internal server error" })
    }
}

export const getEmployees = async (req: Request, res: Response) => {
    try {
        const { cursor, limit, search, department } = req.query
        const take = limit ? Math.min(Number(limit), 50) : 10

        const where: any = {}

        if (search && typeof search === 'string') {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ]
        }

        if (department && typeof department === "string") {
            where.department = department
        }

        const employees = await prisma.employee.findMany({
            where,
            take: take + 1,
            ...(cursor && {
                skip: 1,
                cursor: { id: String(cursor) }
            }),
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                department: true,
                role: true,
                createdAt: true

            }
        })
        const hasNextPage = employees.length > take
        const items = hasNextPage ? employees.slice(0, take) : employees;

        const nextCursor = hasNextPage ? items[items.length - 1]?.id ?? null : null


        return res.status(200).json({
            data: items,
            pagination: {
                nextCursor,
                hasNextPage,
                count: items.length
            }
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({error:"internal server error"})
    }
}