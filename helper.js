import { client } from "./index.js";

// console.log(genhasedPassword("password123"));
export async function genUserByEmail(name) {
  console.log("this is in getUserByEmail function");
  const user = await client.db("mentor_student").collection("username_password").findOne({ email: name });
  return (user);
}
export async function userUpdateToken(name,randstring) {
  console.log("this is update function");
  const result= await client.db("mentor_student").collection("username_password").updateOne({email:name},{$set:{token:randstring}});
  return (result);
}

export async function userUpdatePassword(name,hashedpassword) {
  console.log("this is Password update function");
  const result= await client.db("mentor_student").collection("username_password").updateOne({email:name},{$set:{password:hashedpassword,token:""}});
  return (result);
}

