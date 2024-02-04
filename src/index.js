import dotenv from 'dotenv';
import mongoose from "mongoose";
import { MODEL_NAME } from "./constants.js";
import mongodbConnection from './db/index.js';
import { app } from './app.js';
dotenv.config({
    path:"./.env"
});

mongodbConnection().then(()=>{
     app.listen(process.env.PORT || 3000,()=>{
        console.log(`server started at ${process.env.PORT}`);
     })
}).catch(()=>{
    console.log(`mongodb connection failed !!! `);
});
/*
;(async ()=>{
    try {
        console.log(`${process.env.MONGODB_URL}/${MODEL_NAME}`);
        await mongoose.connect(`${process.env.MONGODB_URL}/${MODEL_NAME}`)
    } catch (error) {
        console.error(`ERROR ${error}`);
    }
})()
*/