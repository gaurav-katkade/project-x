import cookieParser from "cookie-parser";
import express, { urlencoded } from "express";
import cors from "cors";
const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));
app.use(express.json({limit:"134kb"}));
app.use(express.urlencoded({extended:true,limit:"143kb"}));
app.use(express.static("public"));
app.use(cookieParser());

//route import 
import userRouter from "./routes/user.route.js";
// console.log(userRouter);
app.use("/api/v1/users",userRouter);

export {app};