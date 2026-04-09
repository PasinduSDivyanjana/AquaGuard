import jwt from "jsonwebtoken";

const token = jwt.sign(
  { id: "69987d9814314948daacfbf2", role: "admin" }, // payload
  "your-super-secret-key-change-in-production",                 // secret
  { expiresIn: "7d" }              // token validity
);

// const token = jwt.sign(
//   { id: "699d9b1bc7bb98a74776ba66", role: "officer" }, // payload
//   "your-super-secret-key-change-in-production",                 // secret
//   { expiresIn: "7d" }              // token validity
// );

// const token = jwt.sign(
//   { id: "6998844c14314948daacfbf7", role: "public" }, // payload
//   "your-super-secret-key-change-in-production",                 // secret
//   { expiresIn: "7d" }              // token validity
// );


console.log("Your admin token:");
console.log(token);