import mongoose from "mongoose";
import JWT from "jsonwebtoken";
import bcrypt from "bcrypt";
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true,trim:true,lowercase:true,unique:true,index:true },
    password: { type: String, required: true},
    email:{type :String ,required:true,trim:true,unique:true,lowercase:true},
    fullname:{
type:String,
required:true,
trim:true,
index:true
    },
avtar:{
    type:String,
    required:true
},
coverImage:{
    type:String
},
watchHistory:[
        {type:mongoose.Types.ObjectId,
        ref:'Video'}
    ],
    refreshToken:{
    type:String
}
},{timestamps:true})

UserSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10);
    next()
})

UserSchema.methods.isPasswordCorrect = async function (password) {
    const isMatch = await bcrypt.compare(password, this.password);
    return isMatch;
};


UserSchema.methods.generateAccessToken = function(){
   return JWT.sign(
        {
        _id:this._id,
        username:this.username,
        email:this.email,
        fullname:this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}

UserSchema.methods.generateRefreshToken = function (){
   return JWT.sign(
        {
        _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}

export const User = mongoose.model("User",UserSchema)