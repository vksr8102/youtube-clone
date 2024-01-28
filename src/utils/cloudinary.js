import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});


// for upload the image
 export const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) return null;
        //Upload the file on cloudaniry
        const result = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        });

        //file has been uploaded successfull
        console.log("Image uploaded to Cloudinary",result);
        fs.unlinkSync(localFilePath)
        return result;

    } catch (error) {
        fs.unlinkSync(localFilePath)     // remove the locally saved temporary file as the upload operaton got failed
    }


}

// for delete old image from cloudinary

export const deleteFromCloudinary = async(publicId)=>{
    try {
        const result = await cloudinary.uploader.destroy(publicId)
        console.log('Delete result:', result);
        return true;
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error.message);
        return false
    }
}