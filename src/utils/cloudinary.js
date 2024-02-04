import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'; 
import dotenv from "dotenv";
dotenv.config();
cloudinary.config({ 
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY, 
  api_secret:process.env.CLOUDINARY_API_SECRET
    });

async function cloudinary_upload(localFilePath){
    try{
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath,
        { resource_type:'auto' }, 
        function(error, result) {console.log(result); });
        fs.unlinkSync(localFilePath);
        return response;
    }catch(error){
        fs.unlinkSync(localFilePath);
        console.log(`CLOUDINARY ERROR !! ${error}`);
        return null;
    }
   
};
export {cloudinary_upload};