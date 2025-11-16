import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // carrega o .env se existir

const payload = {
  email: "admin@demo.local", //  ID real
  role: "ADMIN"
};

const secret = process.env.JWT_SECRET || "sua_chave_secreta_aleatoria";

const token = jwt.sign(payload, secret, { expiresIn: "7d" });

console.log(token);