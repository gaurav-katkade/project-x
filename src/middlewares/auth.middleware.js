// import { verify } from "jsonwebtoken";

import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async(req,res,next)=>{
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("bearer ","");
    if(!token){
        throw new ApiError(401,"token does not exits");
    }
    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_KEY);
    const user  = await User.findById(decodedToken._id).select("-password -refreshToken");
    if(!user){
        throw ApiError(401,"User does not exits ")
    }
    req.user = user;
    next();
});

export {verifyJWT};