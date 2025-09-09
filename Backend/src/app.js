import express from 'express';
import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import morgan from 'morgan';

const app= express()

app.use(cors({
    origin: process.env.CORS_OROGIN || 'http://localhost:5173',
    credentials: true,
}))

// app.use(morgan('dev'))
app.use(express.json({limit: '16kb'}))
app.use(express.urlencoded({extended: true, limit: '16kb'}))
app.use(express.static('public'))
// app.use(cookieParser())


// routes import
import userRouter from "./routes/user.routes.js"
import listingRouter from './routes/listing.routes.js'

// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/listing", listingRouter)

export { app }