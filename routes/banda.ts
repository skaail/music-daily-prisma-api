import { PrismaClient } from '@prisma/client'
import express, { Request, Response } from 'express'

export const bandaRoute = express.Router()
const prisma = new PrismaClient()

bandaRoute.get('/minhas-bandas', async  (req: Request, res: Response) => {
    const bandas = await prisma.banda.findMany({
        include: {
            albums: true
        },
        orderBy: {
            nome: 'asc'
        }
    })
    res.send(bandas)
})