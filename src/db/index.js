import mongoose from "mongoose"
import { DB_Name } from "../constant.js"


const ConnectDb = async()=>{
    try {
        const connectionOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };
        const ConnectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
            ...connectionOptions,
            dbName: DB_Name,
        });

        console.log("MongoDB Connected:",ConnectionInstance.connection.host)
        
    } catch (error) {
        console.log("MONGODB connection error :" ,error);
        process.exit(1)

    }
}

export default ConnectDb