import type { Request, Response, NextFunction } from "express";
import prisma from '../lib/prisma.js'
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const Register = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { email, password, name, role, department } = req.body

        if (!email || !password || !name) {
            return res.status(400).json({
                error: "email and password are required"
            })
        }

        const existingUser = await prisma.employee.findUnique({ where: { email } })
        if (existingUser) {
            return res.status(409).json({ error: 'user already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.employee.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role ?? 'EMPLOYEE',
                department,

            }
        });
        const { password: _, ...userWithoutPassword } = user;
        return res.status(201).json({ user: userWithoutPassword })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "internal server error" })
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ error: "email and password are required" })
        }
        const user = await prisma.employee.findUnique({ where: { email } })
        if (!user) {
            return res.status(401).json({ error: 'invalid credentials' })
        }

        const ismatch = await bcrypt.compare(password, user.password)
        if (!ismatch) {
            return res.status(401).json({ error: 'invalid credentials' })
        }

        const token = jwt.sign({
            id: user.id, role: user.role
        }, process.env.JWT_SECRET!, { expiresIn: "1d" })
        
        return res.status(200).json({ token, role: user.role })
    }
    catch (error) {
        console.error(error)
    }
}

export const logout = async (req: Request, res: Response) => {
    try {

    } catch (error) {
        console.error(error)
    }
}