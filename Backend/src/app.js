import express from 'express';
import cors from 'cors';

const app = express()

// Update CORS for production
app.use(cors({
    origin: [
        'http://localhost:5173', // Local development
        'https://havenly-rho.vercel.app', // Add your Vercel URL later
        process.env.CORS_ORIGIN // From environment variable
    ].filter(Boolean), // Remove any undefined values
    credentials: true,
}))

app.use(express.json({limit: '16kb'}))
app.use(express.urlencoded({extended: true, limit: '16kb'}))
app.use(express.static('public'))

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// routes import
import userRouter from "./routes/user.routes.js"
import listingRouter from './routes/listing.routes.js'
import bookingRouter from './routes/booking.routes.js'

// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/listing", listingRouter)
app.use("/api/v1/booking", bookingRouter)

export { app }