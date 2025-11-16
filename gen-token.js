import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // carrega o .env se existir

const payload = {
  usuario_id: "ALUNO_ID", //  ID real
  role: "ALUNO"
};

const secret = process.env.JWT_SECRET || "sua_chave_secreta_aleatoria";

const token = jwt.sign(payload, secret, { expiresIn: "7d" });

console.log(token);