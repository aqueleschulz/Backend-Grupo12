import bcrypt from "bcryptjs";
bcrypt.hash("123456", 10).then(console.log);
bcrypt.hash("444422", 10).then(console.log);
bcrypt.hash("333221", 10).then(console.log);