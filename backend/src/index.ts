import "dotenv/config";
import express from 'express'
import cors from 'cors'
import { router } from './routes/index.js'
import { AppError } from "./utils/AppError.js";
import { errorHandler } from "./middleware/errorHandler.js";
// temporarily add near top of index.ts
console.log("JWT_SECRET loaded:", !!process.env.JWT_SECRET)

const app = express()

const PORT = 3001
const apiRoutes = router
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']

}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1',apiRoutes)

app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`'http://localhost:${PORT}'`);
})