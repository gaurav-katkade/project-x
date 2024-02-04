import mongoose from "mongoose";
import { MODEL_NAME } from "../constants.js";

const mongodbConnection = async ()=>{
    try {
       const mongodbInstance=await mongoose.connect(`${process.env.MONGODB_URL}/${MODEL_NAME}`) ;
       console.log(`MONDODB CONNECTED ${mongodbInstance.connection.host}`);
    } catch (error) {
        console.log(`Failed Mongodb connection ! ${error}`);
    }
}
export default mongodbConnection;