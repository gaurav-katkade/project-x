import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
            trim:true,
            lowercase:true,
        },
        fullname:{
            type:String,
            required:true,
            trim:true,
            index:true,
        },
        email:{
            type:String,
            required:true,
            lowercase:[true,"Email is invalid"],
        },
        password:{
            type:String,
            required:true,
        },
        avatar:{
            type:String,
            required:true,
        },
        coverImage:{
            type:String,
        },
        refreshToken:{
            type:String,
        },
        watchHistory:[
            {
                type:mongoose.Types.ObjectId,
                ref:"Video",
            }
        ]

    } ,{timestamps:true}  
);
userSchema.pre("save",async function(next){
    if(!this.isModified("password"))
        return next();
    this.password =await bcrypt.hash(this.password, 5)
    next();
})
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
};
userSchema.methods.generateAccessToken=function(){
    return jwt.sign({
        _id :this._id,
        username:this.username,
        email:this.email,
        fullname:this.fullname,
    },
    process.env.ACCESS_TOKEN_KEY,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    });
}

userSchema.methods.generateRefreshToken=function(){
    return jwt.sign({
        _id :this._id,
    },
    process.env.REFRESH_TOKEN_KEY,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    });
}

export const User = mongoose.model("User",userSchema);