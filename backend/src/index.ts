import "dotenv/config";
import express from 'express'
import cors from 'cors'
import { router } from './routes/index.js'

const app = express()

const PORT = 3001
const apiRoutes = router
app.use(cors({
  origin: ['http://localhost:3001'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']

}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1',apiRoutes)

app.listen(PORT, () => {
    console.log(`'http://localhost:${PORT}'`,PORT);
})