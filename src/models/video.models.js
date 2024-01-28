import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const VideoSchema = new mongoose.Schema({
    videoFile:{
        type:String,
        required:[true,"Please upload a file"]
    },
    title:{
        type: String,
        require: [true, 'A title is required']
        } ,
    thumbnail:{
        type:String, //cloudnary file
        required:true
    },
    description:{
        type:String,
       required:true
        },
    views : {
            type:Number,
            default:0
            },
    duration:{
        type: Number,
        required:true
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type: mongoose.Types.ObjectId,
        ref:"User",
    }

},{timestamps:true})

VideoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",VideoSchema)