require('dotenv-safe').config();
//Implementar JSON webtoken.
var jwt = require('jsonwebtoken');

//Criar servidor HTTP.
var http = require('http');
//Criar rotas.
const express = require('express');
const app = express();

//Enviar Cookies para o servidor para validar.
//Codificar e parsear as informações dos cookies.
var cookieParser = require('cookie-parser');
//Extender codificação da URL.
const bodyParser = require('body-parser');

//Usar JSON dentro do bodyParser.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.get('/clientes', verifyJWT, (req, res) => {
    console.log("Retornou todos clientes!");
    res.json([{ id: 1, nome: 'adm' }]);
})

function verifyJWT(req, res, next){
    const token = req.headers['x-access-token'];
    if(!token){
        return res.status(401).json({auth: false, message: 'Nenhum token fornecido.'});
    }
    jwt.verify(token, process.env.SECRET, function(err, decoded){
        if(err){
            return res.status(500).json({auth: false, message: 'Falha ao autenticar o token.'});
        }
    req.userId = decoded.id;
    next();
    });
}

app.post('/login', (req, res) => {
    //Para gerar o token de forma diferente, é o caso de se criar um .env secret key.

    //O certo seria usar um banco de dados.
    const user = req.body.user;
    const password = req.body.password;
    //Aqui deveria ser feita a validação do usuário com o banco de dados.
    //Se no corpo do da requisição JSON o usuário e senha forem iguais a adm e 123.
    if(user === 'adm' && password === '123'){
        const id = 1;
        var token = jwt.sign({id}, process.env.SECRET, {
            expiresIn: 300 //5 minutos
        });
        return res.status(200).json({auth: true, token: token});
    }
    // Adicionar um else para lidar com credenciais inválidas
    else {
        return res.status(401).json({ auth: false, message: 'Usuário ou senha inválidos.' });
    }
});

app.post('/logout', (req, res) => {
    res.json({auth: false, token: null});
})

var server = http.createServer(app);
server.listen(3000);
console.log("Servidor rodando na porta 3000.")
