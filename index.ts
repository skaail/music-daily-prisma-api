import { PrismaClient } from '@prisma/client'
import express from 'express'
import { routes } from './routes/routes'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import { createServer } from 'http'
import * as socketio from "socket.io";

const prisma = new PrismaClient()
const app = express()
const httpServer = createServer(app)

app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
dotenv.config()

export const io = new socketio.Server(httpServer);

app.use(express.json())



app.use('/', routes)

const PORT = process.env.PORT || 4000

httpServer.listen(PORT, () => {
  console.log(`Server is running on <http://localhost:${PORT}> 🚀`)
})