import cors from "cors";
import express from "express";
import { MongoClient } from "mongodb";
import genhashedPassword from "./genhasedPassword.js";
import * as dotenv from 'dotenv';
import { genUserByEmail,userUpdatePassword,userUpdateToken } from "./helper.js";
import Randomstring from "randomstring";
import nodemailer from "nodemailer";


 
//This is for sending email
const sensResetPasswordMail= async(username, email,randstring)=>{
  try {
   const transpoter= nodemailer.createTransport({
    service: 'hotmail',
    port: 587,
    secure: false, // true for 465, false for other ports
    requireTLS:true,
    auth: {
      user: process.env.user, // generated ethereal user
      pass: process.env.pass, // generated ethereal password
    }

    })

    const mailOptions={
      from:process.env.user,
      to:email,
      subject:"To reset your Password",
      html:'<p> This message is to check the your account. If you want to reset the password<a href="">click here</a>and the your secret key is:</p>' +randstring,
    }

    transpoter.sendMail(mailOptions,function(error,info){
      if(error){
        console.log(error)
      }
      else{
        console.log("mail has been sent", info.response);
      }
    }
    )
  } catch (error) {
    res.status(400).send({success:false,message:error.message})
    
  }
}


dotenv.config();
const PORT = process.env.PORT|| 9000;
const app = express();
app.use(cors());
const MONGO_URL=process.env.MONGO_URL;



async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  console.log("Mongo is connected");
  await client.connect();
  return client;
}

export const client = await createConnection();
// console.log(process.env);

// Reset end points
app.get("/",(req, res)=>{
    res.send("Hello Everyone")
});


app.get("/api/users", async(req,res)=>{
  const users= await client.db("mentor_student").collection("username_password").find().toArray();
  res.send(users);
})

//------------Rest END point ------ Forgot Password----1
//  user enters email to get link
app.post("/api/users/forgot_password",express.json(), async (req, res) => {
  const email  = req.body.email;
  console.log(email);
  const user = await genUserByEmail(email);
  //generate a radom string
    const randstring = Randomstring.generate();
    console.log(randstring);
    const result= await userUpdateToken(user.email,randstring);
    console.log(result);
    sensResetPasswordMail(user.username,user.email,randstring);
// If the array is empty
  user ? res.send({"message":"Please check Your Mail"}) : res.status(404).send({ "message": "NO User FOUND with this emailID" });
});


//----------------Rest endpoint------------- Reset Password------------2
app.post("/api/users/reset_password", express.json(), async(req,res)=>{
  console.log("This is Reset password");
  // const ToUpdateuser= req.body.username;
  console.log(req.body.email);
  const user = await genUserByEmail(req.body.email);
  // // check if token is correct
  if(user.token==req.body.token){
    console.log("Token matches");
    //generate hased password
    const hashedpassword= await genhashedPassword(req.body.newpassword);
    console.log(hashedpassword);
    //update in database
    const result=await userUpdatePassword(req.body.email,hashedpassword);
    console.log(result);
    res.status(200).send({"message":"Password has reset"});
  }
  else{
    console.log("token dosnt match");
    res.status(200).send({"message":"String doesnt match"});
  }
  
})


// create a server
app.listen(PORT,()=>console.log("server started on port",PORT));


