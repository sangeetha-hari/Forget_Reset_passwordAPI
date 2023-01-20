import bcrypt from 'bcrypt';
import { client } from "./index.js";



export  default async function genhasedPassword(password) {
  const salt = await bcrypt.genSalt(10);
  console.log(salt);
  const hashpassword = await bcrypt.hash(password, salt);
  console.log(hashpassword);
  return(hashpassword)

}
