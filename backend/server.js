// Carrega as variáveis de ambiente declaradas no arquivo .env para o objeto global process.env
require('dotenv').config();

// Importa o framework Express para gerenciar rotas, middlewares e requisições HTTP
const express = require('express');

// Importa o cliente MySQL com suporte nativo a Promises (permitindo o uso de async/await)
const mysql = require('mysql2/promise');

// Importa o middleware Multer para processamento de formulários multipart/form-data (upload de imagens)
const multer = require('multer');

// Importa o middleware CORS para controle de permissões de origens e cabeçalhos entre domínios
const cors = require('cors');

// Importa o módulo nativo do Node.js para normalização e concatenação de caminhos de arquivos
const path = require('path');

// Importa o módulo nativo do Node.js para manipulação de pastas e arquivos no sistema operacional
const fs = require('fs');

// Importa a classe GoogleGenAI do SDK oficial do Google GenAI
const { GoogleGenAI } = require('@google/genai');

// Cria a instância principal da aplicação Express
const app = express();

// Instancia o cliente da IA passando a chave de API cadastrada nas variáveis de ambiente
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Bloco de validação e log no console para reconhecimento da chave de API e do modelo da IA
(() => {
  const modeloIa = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
  const chaveApi = process.env.GEMINI_API_KEY;

  if (chaveApi && chaveApi.trim() !== '') {
    const chaveMascarada = `${chaveApi.substring(0, 4)}...${chaveApi.slice(-4)}`;
    console.log(`🤖 [Google GenAI] Modelo encontrado: '${modeloIa}' | Chave de API reconhecida com sucesso! (${chaveMascarada})`);
  } else {
    console.warn(`⚠️ [Google GenAI] ATENÇÃO: A variável GEMINI_API_KEY não foi encontrada ou está vazia no arquivo .env!`);
  }
})();

// Carrega a lista de origens autorizadas do .env ou define a lista padrão (local e produção)
const origensPermitidas = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origem) => origem.trim())
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:3042',
      'http://192.168.0.16:3042',
      'https://quiz.emersonsilv.win'
    ];

// Configura o comportamento dinâmico do CORS validando se a origem está na lista permitida
const opcoesCors = {
  origin: (origem, callback) => {
    if (!origem) {
      return callback(null, true);
    }

    if (origensPermitidas.includes(origem)) {
      return callback(null, true);
    }

    return callback(new Error(`Origem não permitida pelo CORS: ${origem}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Define o caminho absoluto para o diretório de imagens ('src/img')
const diretorioUpload = path.join(__dirname, 'src/img');

// Garante que a pasta de destino exista
if (!fs.existsSync(diretorioUpload)) {
  fs.mkdirSync(diretorioUpload, { recursive: true });
}

// Configuração do armazenamento do Multer
const armazenamentoDisco = multer.diskStorage({
  destination: (req, file, cb) => cb(null, diretorioUpload),
  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${extensao}`);
  }
});

// Inicializa a instância do Multer
const upload = multer({
  storage: armazenamentoDisco,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite expandido para 10MB
  },
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = [
      'image/jpeg',
      'image/pjpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ];

    if (tiposPermitidos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de imagem inválido. Use JPG, PNG, GIF ou WEBP.'));
    }
  }
});

// Cria o pool de conexões com o MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(express.json());
app.use(cors(opcoesCors));

// Expõe publicamente a pasta de uploads sob /imagens e /src/img
app.use('/imagens', express.static(diretorioUpload));
app.use('/src/img', express.static(diretorioUpload));

// Define a pasta onde estão os arquivos compilados do React
const pastaBuildReact = fs.existsSync(path.join(__dirname, 'dist'))
  ? path.join(__dirname, 'dist')
  : path.join(__dirname, 'build');

app.use(express.static(pastaBuildReact));

// Teste de conexão com a base de dados no arranque
(async () => {
  try {
    const conexao = await pool.getConnection();
    console.log('📦 [MySQL] Conexão ao MySQL via Pool estabelecida com sucesso!');
    conexao.release();
  } catch (erro) {
    console.error('❌ [MySQL] Falha ao conectar no banco de dados:', erro.message);
  }
})();

// Rota GET aleatória
app.get('/consultaAleatoria', async (req, res) => {
  try {
    const [linhas] = await pool.query('SELECT * FROM repositorio ORDER BY RAND() LIMIT 1');
    if (linhas.length === 0) {
      return res.status(404).json({ message: 'Nenhum registro encontrado.' });
    }
    res.json(linhas[0]);
  } catch (erro) {
    console.error('Erro ao buscar registro aleatório:', erro);
    res.status(500).json({ message: 'Erro interno ao consultar registro.' });
  }
});

// Rota POST com IA
app.post('/gerar-questoes', async (req, res) => {
  try {
    const { tema, promptUsuario, quantidade } = req.body;
    const modeloEscolhido = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

    const promptInstrucao = `
Você é um gerador de questões para um quiz no estilo "Torta na Cara".
Gere exatamente ${quantidade} questões de múltipla escolha sobre o tema "${tema}".
Instrução adicional do usuário: "${promptUsuario}".

Retorne EXCLUSIVAMENTE um array em formato JSON puro, sem formatação markdown (sem aspas de código), no seguinte formato:
[
  {
    "tema": "${tema}",
    "pergunta": "Texto claro e direto da pergunta",
    "A": "Texto da alternativa A",
    "B": "Texto da alternativa B",
    "C": "Texto da alternativa C",
    "D": "Texto da alternativa D",
    "correta": "A"
  }
]
`;

    const respostaIa = await ai.models.generateContent({
      model: modeloEscolhido,
      contents: promptInstrucao,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const questoesProcessadas = JSON.parse(respostaIa.text.trim());
    res.json(questoesProcessadas);
  } catch (erro) {
    console.error('Erro ao gerar questões com IA:', erro);
    res.status(500).json({
      message: 'Erro ao gerar questões com IA',
      error: erro.message
    });
  }
});

// Rota POST /insert
app.post('/insert', upload.single('imagem'), async (req, res) => {
  try {
    const { tema, pergunta, A, B, C, D, correta } = req.body;
    const nomeArquivo = req.file ? req.file.filename : null;

    const instrucaoSql = `
      INSERT INTO repositorio (tema, pergunta, A, B, C, D, imagem, correta) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const valoresParametros = [tema, pergunta, A, B, C, D, nomeArquivo, correta];

    const [resultadoInsercao] = await pool.query(instrucaoSql, valoresParametros);
    const [novoRegistro] = await pool.query(
      'SELECT * FROM repositorio WHERE numero = ?',
      [resultadoInsercao.insertId]
    );

    res.status(201).json({
      message: 'Registro inserido com sucesso!',
      data: novoRegistro[0] || { id: resultadoInsercao.insertId }
    });
  } catch (erro) {
    console.error('Erro ao inserir:', erro);
    res.status(500).json({
      message: 'Erro ao inserir dados no banco de dados',
      error: erro.message
    });
  }
});

// Rota GET /temas
app.get('/temas', async (req, res) => {
  try {
    const [linhas] = await pool.query('SELECT DISTINCT tema FROM repositorio');
    res.json(linhas);
  } catch (erro) {
    console.error('Erro ao buscar temas:', erro);
    res.status(500).json({ message: 'Erro ao buscar temas' });
  }
});

// Rota GET /registros
app.get('/registros', async (req, res) => {
  try {
    const { tema, numero } = req.query;
    let instrucaoSql = 'SELECT * FROM repositorio';
    const condicoes = [];
    const parametros = [];

    if (tema) {
      condicoes.push('tema = ?');
      parametros.push(tema);
    }

    if (numero) {
      condicoes.push('numero = ?');
      parametros.push(numero);
    }

    if (condicoes.length > 0) {
      instrucaoSql += ` WHERE ${condicoes.join(' AND ')}`;
    }

    const [linhas] = await pool.query(instrucaoSql, parametros);
    res.json(linhas);
  } catch (erro) {
    console.error('Erro ao buscar registros:', erro);
    res.status(500).json({ message: 'Erro ao buscar registros' });
  }
});

// Rota PUT /atualizar/:numero
// Rota PUT para atualizar uma questão existente identificada pelo parâmetro de rota :numero[cite: 4]
app.put('/atualizar/:numero', upload.single('imagem'), async (req, res) => {
  try {
    // Desestrutura os campos atualizados enviados no corpo da requisição[cite: 4]
    const { tema, pergunta, A, B, C, D, correta } = req.body;

    // Se uma nova imagem foi anexada na atualização, define o caminho; caso contrário, mantém null[cite: 4]
    const imagem = req.file ? path.relative(__dirname, req.file.path) : null;

    // Monta a base do comando de atualização dos dados[cite: 4]
    let instrucaoSql = `
      UPDATE repositorio
      SET tema = ?, pergunta = ?, A = ?, B = ?, C = ?, D = ?, correta = ?
    `;

    // Vetor de parâmetros na ordem dos campos atualizados[cite: 4]
    const parametros = [tema, pergunta, A, B, C, D, correta];

    // Se foi feito upload de uma nova imagem, acrescenta a coluna de imagem no comando SQL[cite: 4]
    if (imagem) {
      instrucaoSql += ', imagem = ?';
      parametros.push(imagem);
    }

    // Finaliza o comando vinculando o filtro pelo número de identificação da questão[cite: 4]
    instrucaoSql += ' WHERE numero = ?';
    parametros.push(req.params.numero);

    // Executa a query de atualização no banco[cite: 4]
    const [resultado] = await pool.query(instrucaoSql, parametros);

    // Se nenhuma linha foi afetada, significa que o número informado não existe no banco[cite: 4]
    if (resultado.affectedRows === 0) {
      // Retorna 404 informando que a questão não foi encontrada[cite: 4]
      return res.status(404).json({ message: 'Registro não encontrado para atualização.' });
    }

    // Retorna mensagem confirmando a alteração bem-sucedida[cite: 4]
    res.json({ message: 'Registro atualizado com sucesso!' });
  } catch (erro) {
    // Loga eventuais falhas durante a operação[cite: 4]
    console.error('Erro ao atualizar registro:', erro);

    // Retorna status 500 com a mensagem de erro[cite: 4]
    res.status(500).json({ message: 'Erro ao atualizar registro', error: erro.message });
  }
});

// Rota fallback SPA React
app.get('*', (req, res) => {
  const indexHtml = path.join(pastaBuildReact, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.status(404).send('Build do React não encontrado. Execute npm run build.');
  }
});

// Middleware global de tratamento de erros
app.use((erro, req, res, next) => {
  console.error('Erro capturado pelo middleware:', erro.message);

  if (erro instanceof multer.MulterError) {
    return res.status(400).json({ error: `Erro no upload: ${erro.message}` });
  }

  res.status(400).json({ error: erro.message });
});

const PORT = process.env.PORT || 3042;
app.listen(PORT, () => {
  console.log(`🚀 [Servidor] Rodando com alta performance na porta ${PORT}`);
  console.log(`📂 [Frontend] Servindo arquivos estáticos de: ${pastaBuildReact}`);
});