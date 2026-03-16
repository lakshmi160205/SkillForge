import exp from 'express'
import {connect} from "mongoose"
import { config } from 'dotenv';
import { StudentApp } from './API/Student.js';
import cors from "cors"
//read environment variables
config();
//create http server
const app=exp();
//add body parser middleware
app.use (exp.json())
//add cors middleware
app.use(cors({
    origin:"http://localhost:5173",
    methods:["GET","POST","DELETE","PUT","PATCH"]
}))
//forward req
app.use("/student-api",StudentApp)


//connect to db
async function connectDB() {
    try {
        await connect(process.env.DB_URL);
        console.log("connected to db successfully")
        //assign port
        const port=process.env.PORT;
        app.listen(port,()=>console.log("app listening on port 5000"))
    }catch(err){
        console.log("err in connection to db:" , err)
    }
    
}
connectDB()
//add error handling middleware
app.use((err, req, res, next) => {
  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.errors,
    });
  }
  // Invalid ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID format",
    });
  }
  // Duplicate key
  if (err.code === 11000) {
    return res.status(409).json({
      message: "Duplicate field value",
    });
  }
  res.status(500).json({
    message: "Internal Server Error",
  });
});