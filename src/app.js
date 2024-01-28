import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(cookieParser())

// For file acceptancex
app.use(express.json({
    limit:"16kb"
}))

// for url acceptance
app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))
app.use(express.static("public"))


//import routes
import userRouter from "./routes/user.routes.js";


//decleare routes
app.use("/api/v1/users",userRouter)

export {app}