import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";

export const verifyJwt = asyncHandler(async (req, _, next) => {
    try {
        console.log(req.cookies)
        const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
        // console.log("accessToken", req.cookies?.accessToken);
        // console.log('Request Headers:', req.headers);
        // console.log('Request Cookies:', req.cookies);
        // console.log("Authorization", req.header("Authorization")?.replace("Bearer ", ""));
        // console.log('Token:', token);

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        
        // console.log(process.env.ACCESS_TOKEN_SECRET)
        // console.log(jwt.verify(token, process.env.ACCESS_TOKEN_SECRET ))
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET );
        // console.log('Decoded Token:', decodedToken);

        if (decodedToken.exp && Date.now() >= decodedToken.exp * 1000) {
            throw new ApiError(401, "Access token has expired");
        }

        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, 'Access token has expired');
        } else {
            throw new ApiError(401, error?.message || "Invalid Access Token");
        }
    }
});
