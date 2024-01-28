import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"
// method for generate access and refersh token
const generateAccessAndRefershTokens = async(userId)=>{
    try {
       const user = await User.findById(userId) 
       const accessToken = user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()

       user.refreshToken = refreshToken
       await user.save({ validateBeforeSave:false })
       return { accessToken, refreshToken}
    } catch (error) {
       throw new ApiError(500,"Somthing went wrong while generating access and refresh tokens") 
    }

}



const registerUser = asyncHandler( async(req,res)=>{
    const {username,fullname,password,email} = req.body;

    // check if any field is empity
    if([username,fullname,password,email].some((field)=>field.trim()=== "")){
        throw new ApiError(400, "All fields are required")
    }

    //check user already exist
    const userAlreadyExist = await User.findOne(
        {
            $or:[{ username },{ email }]
        }
    )

    if(userAlreadyExist){
        throw new ApiError(409, "User with this username or email already exists");
    }

    // upload files on cloudinary

    // console.log('Step 1');
const avtarLocalPath = req.files?.avtar[0]?.path;
// console.log('Step 2', avtarLocalPath);
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

if(!avtarLocalPath){
    throw new ApiError(400,"Avtar field is required")
}

const avtar = await uploadOnCloudinary(avtarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

if(!avtar){
    throw new ApiError(400,"Avtar field is required")
}

const user = await User.create({
    username:username.toLowerCase(),
    fullname,
    avtar:avtar.url,
    coverImage:coverImage?.url || "",
    email,
    password
})


const createUser = await User.findById(user._id).select(
    '-password -refreshToken'
);

if(!createUser){
 throw new ApiError(500, "Somthing went wrong while creating the user")
}

return res.status(201).json(
    new ApiResponse(200,createUser,"User is successfully registered")
)
})


//login controller

const logedInUser = asyncHandler(async(req,res)=>{
const {email,username,password} = req.body;

if(!(email || username)){
    throw new ApiError(400,"Username or email is required")
}
const user = await User.findOne(
    {
        $or:[{email}, {username}]
    }
)

if(!user){
    throw new ApiError(404,'user does not exist')
}

const isPasswordverify = await user.isPasswordCorrect(password)
if (!isPasswordverify) {
    throw new ApiError(401, 'Invalid credentials');
    }

    const { refreshToken, accessToken } = await generateAccessAndRefershTokens(user._id);
    // console.log(accessToken, refreshToken);
const userlogedIn = await User.findById(user._id)
.select("-password -refreshToken")

const options ={
    httpOnly:true,
    secure:true
}

// console.log(accessToken, refreshToken);
return res.status(200)
.cookie("refreshToken",refreshToken,options)
.cookie("accessToken",accessToken,options)
.json(
    new ApiResponse(
        200,
        {
            user:userlogedIn,refreshToken,accessToken
        },
        "Logged in successfully!"
    )
)
})

const logedOut = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken : undefined
            },
        },
        {
            new: true
        }

        )

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("refreshToken",options)
    .clearCookie("accessToken",options)
    .json(
        new ApiResponse(
            200,
            {},
            'User logged out!'
            )
    )
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    // Get the user from the session (from the cookies)
   try {
     const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
 
     if(!incommingRefreshToken){
         throw new ApiError(401,"unAuthorized token")
     }
 
     const decodedToken = jwt.verify(incommingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
      const user = await User.findById(decodedToken?._id)
 
      if(!user){
         throw new ApiError(401,'Invalid refresh Token')
      }
 
 
      if(incommingRefreshToken !== user?.refreshToken){
         throw new ApiError(401,' refresh Token is expired or used')
      }
 
      const options ={
         httpOnly:true,
         secure:true
      }
 
      const {accessToken,newRefreshToken} = await generateAccessAndRefershTokens(user?._id)
 
      return res
      . status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",newRefreshToken,options)
      .json(
         new ApiResponse(
             200,
            {accessToken , refreshToken:newRefreshToken},
             "New Access Token Generated Successfully!",
         )
      )
   } catch (error) {
    throw new ApiError(401,error?.message || "Invalid Refresh Token")
   }
})

const changedCurrentPassword = asyncHandler(async(req,res)=>{
const {oldPassword,newPassword,conformPassword} = req.body;

if(!(newPassword === conformPassword)){
    throw new ApiError(422, "New password and confirm password do not match");
}

const user = await User.findById(req.user?._id)
console.log(user)
const isPasswordMatched = await user.isPasswordCorrect(oldPassword)

if(!isPasswordMatched){
    throw  new ApiError(401,"Old password does not matched")
}

user.password = newPassword

await user.save({validateBeforeSave:false})

return res
.status(200)
.json(
    new ApiResponse(
        200,
        {},
        'Password has been successfully updated'
        ))
})


const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(
        new ApiResponse(
            200,
            req.user,
            "current user fetched successfully"
            )
    )
})

const updateUserDetails = asyncHandler(async(req,res)=>{
    const {email,fullname} = req.body;
    
    if(!(email || fullname)){
        throw new ApiError(400,'Please provide at least email or name to update')
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                email:email,
                fullname
            }
        },
        {new:true}
        ).select("-password")


        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "User details have been successfully updated!"
            )
        )

})

const changedUserCoverImage = asyncHandler(async(req,res)=>{
    const coverLocalPath = req.file?.path;
    if(!coverLocalPath){
        throw new ApiError(400,"No  image provided!");
    }

const coverImage = await uploadOnCloudinary(coverLocalPath)
if(!coverImage.url){
    throw new ApiError(400,"Error while uploading image")
}
if(req.user?.avtar){
    const publicUrl = req.user?.coverImage.split('/').pop().split('.')[0]
   const res = await deleteFromCloudinary(publicUrl)
  if(res){
    console.log("old Image deleted successfully");
  }else{
    console.log("error in deleting old Image",res)
  }
}
const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
            coverImage : coverImage.url
            }
    },
    {new:true}
)

 return res.
 status(200)
 .json(
    new ApiResponse(
        200,    
        user,
        'CoverImage has been uploaded'
        )
        );
})
const changedUserAvtar = asyncHandler(async(req,res)=>{
    
    const avtarLocalPath = req.file?.path;
    console.log('avtarLocalPath',avtarLocalPath);
    if(!avtarLocalPath){
        throw new ApiError(400,"No Avatar image provided!");
    }

const avtar = await uploadOnCloudinary(avtarLocalPath)
if(!avtar.url){
    throw new ApiError(400,"Error while uploading image")
}

// delete old image from cloudnary
if(req.user?.avtar){
    const publicUrl = req.user?.avtar.split('/').pop().split('.')[0]
   const res = await deleteFromCloudinary(publicUrl)
  if(res){
    console.log("old Image deleted successfully");
  }else{
    console.log("error in deleting old Image",res)
  }
}
const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
           avtar : avtar.url
            }
    },
    {new:true}
)

 return res.
 status(200)
 .json(
    new ApiResponse(
        200,    
        user,
        'Avatar has been uploaded'
        )
        );
})

export {
     registerUser,
    logedInUser,
    logedOut,
    refreshAccessToken,
    changedCurrentPassword,
    getCurrentUser,
    updateUserDetails,
    changedUserAvtar,
    changedUserCoverImage
 }