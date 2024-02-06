import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { cloudinary_upload } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
const userRegister = asyncHandler(
   async  (req,res)=>{
          //get user data from frontend
          const {username,email,fullname,password}=req.body;
          console.log("🚀 ~ req.body:", req.body)
          console.log("🚀 ~ username,email,fullname,password:", username,email,fullname,password);
          //validation not empty

          if(
               [username,email,fullname,password].some((field=>field?.trim()===""))
          ){
               throw new ApiError(400,"All fields are required");
          }
          //check if user already exists
          const existedUser = await User.findOne({
               $or:[{ username },{ email }]
          });
          console.log("🚀 ~ existedUser:", existedUser)
          if(existedUser){
               throw new ApiError(401,"User with same username or email already exists");
          }
          //check for images 
          const avatarLocalPath = req.files?.avatar[0]?.path;
          console.log("🚀 ~ req.files:", req.files)
          console.log("🚀 ~ avatarLocalPath:", avatarLocalPath)
          const coverImagePath = req.files?.coverImage[0]?.path;
          console.log("🚀 ~ coverImagePath:", coverImagePath)

          const avatarResponse =  await cloudinary_upload(avatarLocalPath);
          const coverImageResponse = await cloudinary_upload(coverImagePath);

          if(!avatarResponse){
               throw new ApiError(401,"avatar image is not uploaded");
          }

          //creating user object to upload in db
          const user = await User.create({
               username,
               fullname,
               email,
               password,
               avatar:avatarResponse.url,
               coverImage:coverImageResponse?.url ||"",
          })
          //to check if user is created
          const CreatedUser = await User.findById(user._id).select("-password -refreshToken");
          console.log("🚀 ~ CreatedUser:", CreatedUser)
          //select with - is used to exclusion of the field
     
          if(!CreatedUser){
               console.log("🚀 ~ !CreatedUser:", !CreatedUser)
               throw new ApiError(500,"something went wrong wen creating the user");
          }
          return res.status(201).json(new ApiResponse(200,CreatedUser,"user registration is successfull"));
     }
    
);

const generateAccessTokenAndRefreshToken=async (userid)=>{
     try {
         const user = User.findById(userid);
          const accessToken =  await user.generateAccessToken();
          const refreshToken = await user.generateRefreshToken();
          user.refreshToken = refreshToken;
          user.save({validateBeforeSave:false})
        return {accessToken,refreshToken};
     } catch (error) {
          throw new ApiError(500,"something went wrong while genrating accessToken or refreshToken");
     }
}

const loginUser = asyncHandler(
     async (req,res)=>{
          //get data from user
          //check if user exist with same username or password
          //check the validation of password
          //refresh token and access token genearation
          const {username,email,password} = req.body;

          if(!username || !email){
               throw ApiError(401,"User not provided username or email");
          }

          const user = await User.findOne({$or:[{username},{email}]});

          if(!user){
               throw ApiError(401,"User does not exist");
          }

          if(!user.isPasswordCorrect(user.password)){
               throw ApiError(401,"Password is not correct");
          }
          
          //geneate token 
          const {accessToken,refreshToken} = generateAccessTokenAndRefreshToken(user._id);
          const options = {
               httpOnly:true,
               secure:true
          }

          const loggedInUser = User.findById(user._id).select("-password -refreshToken");

          return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
               new ApiResponse
               (200,
               {
                    user:loggedInUser,accessToken,refreshToken
               },
               "User loggin successfull"
               )
               
          );
     }
)

const logoutUser = asyncHandler(
     async(req,res,next)=>{

          // const {user} = req.body;
          //to remove refreshtoken 
          // new:true in used to return the updated user(by default it returns old)
          await User.findByIdAndUpdate(req.user._id,{$unset:{refreshToken:1}},{new:true});

          return res.status(200).clearCookies("accessToken",options).clearCookies("refreshToken",options).json(new ApiResponse(200,{},"User log out successfull!!"))
     }
)

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const refreshToken =req.cookies?.refreshToken;
    if(!refreshToken){
        throw new ApiError(401,"Refresh token does not exits");
    }
    const decodedRefreshToken = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_KEY)
    const user = await User.findById(decodedRefreshToken?._id);
    if(!user){
        throw new ApiError(401,"Invalid refresh token for user")
    }
    if(refreshToken !== user.refreshToken){
        throw new ApiError(401,"Refresh token does not match");
    }
    const {accessToken,newRefreshToken} = generateAccessTokenAndRefreshToken(user._id);
    const options={
        httpOnly:true,
        secure:true
    }
    res
    .status(200)
    .cookie("refreshToken",refreshToken,options)
    .cookie("accessToken",accessToken,options)
    .json(new ApiResponse(200,{refreshToken,accessToken,user},"access token refresh successfull!!  "));
})

const changePassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body;
    
    if(oldPassword === newPassword){
        throw new ApiError(401,"Old and new password are same");
    }
    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(401,"Invalid Old password");
    }
    user.password = newPassword;
    await user.save({validateBeforeSave:false});
    return res
    .status(200)
    .json(new ApiResponse(200,{user},"Password updated successfully"))

})

const updatedAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file.path;
    if(!avatarLocalPath){
        throw new ApiError(401,"Avatar is not uploaded");
    }
    const response = await cloudinary_upload(avatarLocalPath);
    
    const user = User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar:response.url
            }
        },
        {new :true}
    );
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Avatar is uploaded successfully"));
});

const updatedCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file.path;
    if(!coverImageLocalPath){
        throw new ApiError(401,"Cover Image  is not uploaded");
    }
    const response = await cloudinary_upload(coverImageLocalPath);
    
    const user = User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                coverImage:response.url
            }
        },
        {new :true}
    );
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Cover Image is uploaded successfully"));
});
//  const result = await userRegister();
export {userRegister,loginUser,logoutUser,refreshAccessToken};