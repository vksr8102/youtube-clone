import dotenv from "dotenv"
import ConnectDb from "./db/index.js"
import { app } from "./app.js"




dotenv.config({
    path: `./env`,
})
ConnectDb()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
}).catch((err)=>{
    console.log("MOGODB connection failled !!!",err)
})