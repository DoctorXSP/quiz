const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

// Configuração do multer para armazenar arquivos na pasta 'src/img'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/img')
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
    cb(null, file.fieldname + '-' + Date.now() + ext)
  }
})

const upload = multer({ storage: storage })

// Crie uma conexão com o banco de dados
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'paulo',
  password: 'freire@241',
  database: 'bdquiz',
  port: 3306
});

// Conecte-se ao banco de dados
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Conexão com o banco de dados estabelecida com sucesso!');

  // Teste a conexão e a existência da tabela
  db.query('SELECT 1 FROM repositorio LIMIT 1', (err, results) => {
    if (err) {
      console.log('Erro ao acessar a tabela bdquiz:', err);
    } else {
      console.log('Acesso à tabela bdquiz bem sucedido!');
    }
  });
});

// Crie um aplicativo express
const app = express();

// Middleware para permitir o parsing de JSON
app.use(express.json()); 

// Configuração do CORS para aceitar requisições de http://localhost:3000
app.use(cors());  // Liberando para todas as origens
//app.use(cors({ origin: 'http://localhost:3000' }));
//app.use(cors({ origin: 'exp://172.16.18.72:8081' }));


// Inicie o servidor
app.listen(3012, () => {
  console.log('Servidor rodando na porta 3012');
});
