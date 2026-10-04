// Carrega as variáveis de ambiente declaradas no arquivo .env para o objeto global process.env[cite: 4]
require('dotenv').config();

// Importa o framework Express para gerenciar rotas, middlewares e requisições HTTP[cite: 4]
const express = require('express');

// Importa o cliente MySQL com suporte nativo a Promises (permitindo o uso de async/await)[cite: 4]
const mysql = require('mysql2/promise');

// Importa o middleware Multer para processamento de formulários multipart/form-data (upload de imagens)[cite: 4]
const multer = require('multer');

// Importa o middleware CORS para controle de permissões de origens e cabeçalhos entre domínios[cite: 4]
const cors = require('cors');

// Importa o módulo nativo do Node.js para normalização e concatenação de caminhos de arquivos[cite: 4]
const path = require('path');

// Importa o módulo nativo do Node.js para manipulação de pastas e arquivos no sistema operacional[cite: 4]
const fs = require('fs');

// Importa a classe GoogleGenAI do SDK oficial do Google GenAI
const { GoogleGenAI } = require('@google/genai');

// Cria a instância principal da aplicação Express[cite: 4]
const app = express();

// Instancia o cliente da IA passando a chave de API cadastrada nas variáveis de ambiente
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Bloco de validação e log no console para reconhecimento da chave de API e do modelo da IA
(() => {
  // Obtém o modelo definido nas variáveis ou usa o padrão
  const modeloIa = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
  // Obtém a chave de API registrada no .env
  const chaveApi = process.env.GEMINI_API_KEY;

  // Verifica se a chave de API existe e tem conteúdo válido
  if (chaveApi && chaveApi.trim() !== '') {
    // Mascara a chave de API para exibição segura no console (exibe apenas os 4 primeiros caracteres)
    const chaveMascarada = `${chaveApi.substring(0, 4)}...${chaveApi.slice(-4)}`;
    // Exibe a mensagem de sucesso indicando modelo e chave reconhecida
    console.log(`🤖 [Google GenAI] Modelo encontrado: '${modeloIa}' | Chave de API reconhecida com sucesso! (${chaveMascarada})`);
  } else {
    // Emite alerta caso a variável GEMINI_API_KEY não tenha sido preenchida no arquivo .env
    console.warn(`⚠️ [Google GenAI] ATENÇÃO: A variável GEMINI_API_KEY não foi encontrada ou está vazia no arquivo .env!`);
  }
})();

// Carrega a lista de origens autorizadas do .env ou define a lista padrão (local e produção)[cite: 4]
const origensPermitidas = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origem) => origem.trim())
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://quiz.emersonsilv.win'
    ];

// Configura o comportamento dinâmico do CORS validando se a origem está na lista permitida[cite: 4]
const opcoesCors = {
  // Função que inspeciona a origem da requisição recebida[cite: 4]
  origin: (origem, callback) => {
    // Permite chamadas sem header origin (como ferramentas de teste, mobile nativo ou scripts locais)[cite: 4]
    if (!origem) {
      return callback(null, true);
    }

    // Autoriza se o domínio de origem estiver presente no array de domínios permitidos[cite: 4]
    if (origensPermitidas.includes(origem)) {
      return callback(null, true);
    }

    // Rejeita a requisição retornando um erro caso o domínio não conste na lista[cite: 4]
    return callback(new Error(`Origem não permitida pelo CORS: ${origem}`));
  },
  // Métodos HTTP explicitamente autorizados na aplicação[cite: 4]
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // Cabeçalhos HTTP aceitos nas requisições[cite: 4]
  allowedHeaders: ['Content-Type', 'Authorization'],
  // Autoriza envio de credenciais e cookies entre domínios caso necessário[cite: 4]
  credentials: true,
  // Define o código 200 para resposta a requisições preflight OPTIONS (compatibilidade com browsers legados)[cite: 4]
  optionsSuccessStatus: 200
};

// Define o caminho absoluto para o diretório de imagens ('src/img')[cite: 4]
const diretorioUpload = path.join(__dirname, 'src/img');

// Verifica de forma síncrona se o diretório de destino das imagens já existe no disco[cite: 4]
if (!fs.existsSync(diretorioUpload)) {
  // Cria o diretório recursivamente caso ainda não exista para evitar falhas no upload[cite: 4]
  fs.mkdirSync(diretorioUpload, { recursive: true });
}

// Configura o destino e o esquema de nomenclatura de arquivos gerenciados pelo Multer[cite: 4]
const armazenamentoDisco = multer.diskStorage({
  // Define o diretório físico onde a imagem salva será gravada[cite: 4]
  destination: (req, file, cb) => cb(null, diretorioUpload),

  // Gera o nome do arquivo gravado no servidor[cite: 4]
  filename: (req, file, cb) => {
    // Extrai a extensão original do arquivo recebido (ex.: '.jpg', '.png')[cite: 4]
    const extensao = path.extname(file.originalname);
    // Cria um nome único usando o nome do campo, a data/hora em milissegundos e a extensão[cite: 4]
    cb(null, `${file.fieldname}-${Date.now()}${extensao}`);
  }
});

// Inicializa a instância do middleware Multer aplicando as regras de limite e filtro[cite: 4]
const upload = multer({
  // Define o armazenamento em disco configurado anteriormente[cite: 4]
  storage: armazenamentoDisco,

  // Aplica limites de segurança para a requisição de upload[cite: 4]
  limits: {
    // Limita o tamanho do arquivo a 5 Megabytes (calculado em bytes)[cite: 4]
    fileSize: 5 * 1024 * 1024
  },

  // Filtra as extensões recebidas inspecionando o tipo MIME do arquivo[cite: 4]
  fileFilter: (req, file, cb) => {
    // Vetor com os tipos MIME de imagens aceitos[cite: 4]
    const tiposPermitidos = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/webp'];

    // Checa se o tipo MIME do arquivo está entre os autorizados[cite: 4]
    if (tiposPermitidos.includes(file.mimetype)) {
      // Aceita e autoriza a gravação do arquivo[cite: 4]
      cb(null, true);
    } else {
      // Rejeita a operação enviando uma mensagem descritiva de erro[cite: 4]
      cb(new Error('Formato de imagem inválido. Use JPG, PNG ou WEBP.'));
    }
  }
});

// Cria o pool de conexões com o banco de dados MySQL para alta concorrência[cite: 4]
const pool = mysql.createPool({
  // Host do MySQL lido do .env[cite: 4]
  host: process.env.DB_HOST,

  // Usuário do MySQL lido do .env[cite: 4]
  user: process.env.DB_USER,

  // Senha do usuário do MySQL lida do .env[cite: 4]
  password: process.env.DB_PASSWORD,

  // Nome do banco de dados lido do .env[cite: 4]
  database: process.env.DB_NAME,

  // Porta do banco convertida para número (ou fallback para a porta padrão 3306)[cite: 4]
  port: Number(process.env.DB_PORT) || 3306,

  // Define que novas consultas aguardem na fila caso todas as conexões estejam ocupadas[cite: 4]
  waitForConnections: true,

  // Quantidade máxima de conexões simultâneas mantidas no pool[cite: 4]
  connectionLimit: 10,

  // Limite zero significa fila de espera ilimitada[cite: 4]
  queueLimit: 0
});

// Middleware nativo do Express para analisar e transformar o corpo das requisições em objetos JSON[cite: 4]
app.use(express.json());

// Middleware para aplicar as regras de CORS configuradas com a lista de origens autorizadas[cite: 4]
app.use(cors(opcoesCors));

// Expõe publicamente a pasta 'src/img' para permitir o download direto das imagens via navegador[cite: 4]
app.use('/src/img', express.static(diretorioUpload));

// Função autoexecutável assíncrona (IIFE) para testar a comunicação com o banco no boot[cite: 4]
(async () => {
  try {
    // Pede uma conexão emprestada do pool para testar a autenticação[cite: 4]
    const conexao = await pool.getConnection();

    // Notifica no console que o pool conseguiu se conectar ao MySQL com sucesso[cite: 4]
    console.log('📦 [MySQL] Conexão ao MySQL via Pool estabelecida com sucesso!');

    // Devolve a conexão de volta ao pool para reutilização por outras rotas[cite: 4]
    conexao.release();
  } catch (erro) {
    // Exibe falha caso o serviço MySQL esteja fora do ar ou com credenciais incorretas[cite: 4]
    console.error('❌ [MySQL] Falha ao conectar no banco de dados:', erro.message);
  }
})();

// Rota GET para consultar e sortear uma questão aleatória do banco de dados[cite: 4]
app.get('/consultaAleatoria', async (req, res) => {
  try {
    // Executa a ordenação aleatória e extrai apenas 1 linha diretamente do banco[cite: 4]
    const [linhas] = await pool.query('SELECT * FROM repositorio ORDER BY RAND() LIMIT 1');

    // Checa se a tabela não possui nenhum registro cadastrado[cite: 4]
    if (linhas.length === 0) {
      // Retorna código 404 informando que a tabela está vazia[cite: 4]
      return res.status(404).json({ message: 'Nenhum registro encontrado.' });
    }

    // Retorna o primeiro registro sorteado em formato JSON[cite: 4]
    res.json(linhas[0]);
  } catch (erro) {
    // Loga o erro interno de consulta no terminal[cite: 4]
    console.error('Erro ao buscar registro aleatório:', erro);

    // Retorna status 500 com mensagem de erro interno[cite: 4]
    res.status(500).json({ message: 'Erro interno ao consultar registro.' });
  }
});

// Rota POST para geração de questões de quiz utilizando o modelo de IA do Google Gemini
app.post('/gerar-questoes', async (req, res) => {
  try {
    // Desestrutura os parâmetros enviados pelo frontend no corpo da requisição
    const { tema, promptUsuario, quantidade } = req.body;

    // Obtém o nome do modelo configurado no .env ou adota o gemini-2.5-flash-lite como padrão
    const modeloEscolhido = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

    // Monta o prompt com instruções estritas para a IA responder exclusivamente em JSON estruturado
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

    // Chama o endpoint de geração de conteúdo do Google GenAI
    const respostaIa = await ai.models.generateContent({
      model: modeloEscolhido,
      contents: promptInstrucao,
      config: {
        // Força a resposta da IA no tipo MIME JSON para garantir parse confiável
        responseMimeType: 'application/json'
      }
    });

    // Converte a string JSON retornada pelo modelo em um array de objetos Javascript
    const questoesProcessadas = JSON.parse(respostaIa.text.trim());

    // Retorna o array de questões geradas para o cliente frontend
    res.json(questoesProcessadas);
  } catch (erro) {
    // Loga eventuais falhas da chamada da IA ou de parse JSON
    console.error('Erro ao gerar questões com IA:', erro);

    // Retorna status HTTP 500 avisando o cliente sobre o erro na IA
    res.status(500).json({
      message: 'Erro ao gerar questões com IA',
      error: erro.message
    });
  }
});

// Rota POST para inserir uma nova questão no banco com suporte a upload de imagem[cite: 4]
app.post('/insert', upload.single('imagem'), async (req, res) => {
  try {
    // Desestrutura os campos textuais enviados no formulário[cite: 4]
    const { tema, pergunta, A, B, C, D, correta } = req.body;

    // Se houver arquivo anexado, normaliza o caminho relativo ao projeto; senão, define como null[cite: 4]
    const imagem = req.file ? path.relative(__dirname, req.file.path) : null;

    // Declara a instrução SQL parametrizada com placeholders (?) para proteção contra SQL Injection[cite: 4]
    const instrucaoSql = `
      INSERT INTO repositorio (tema, pergunta, A, B, C, D, imagem, correta) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Array com os valores na mesma ordem dos placeholders do comando SQL[cite: 4]
    const valoresParametros = [tema, pergunta, A, B, C, D, imagem, correta];

    // Executa a inserção no banco de dados através do pool[cite: 4]
    const [resultadoInsercao] = await pool.query(instrucaoSql, valoresParametros);

    // Busca o registro recém-criado usando o identificador gerado (insertId)[cite: 4]
    const [novoRegistro] = await pool.query(
      'SELECT * FROM repositorio WHERE numero = ?',
      [resultadoInsercao.insertId]
    );

    // Retorna status 201 (Created) com os dados completos do registro salvo[cite: 4]
    res.status(201).json({
      message: 'Registro inserido com sucesso!',
      data: novoRegistro[0] || { id: resultadoInsercao.insertId }
    });
  } catch (erro) {
    // Loga falhas ocorridas durante a gravação no banco[cite: 4]
    console.error('Erro ao inserir:', erro);

    // Retorna código 500 com o detalhe do erro[cite: 4]
    res.status(500).json({
      message: 'Erro ao inserir dados no banco de dados',
      error: erro.message
    });
  }
});

// Rota GET para listar os temas distintos já cadastrados no banco[cite: 4]
app.get('/temas', async (req, res) => {
  try {
    // Consulta apenas os valores únicos da coluna tema[cite: 4]
    const [linhas] = await pool.query('SELECT DISTINCT tema FROM repositorio');

    // Envia a lista de temas encontrados[cite: 4]
    res.json(linhas);
  } catch (erro) {
    // Loga erro de busca no console[cite: 4]
    console.error('Erro ao buscar temas:', erro);

    // Retorna código 500 informando o problema[cite: 4]
    res.status(500).json({ message: 'Erro ao buscar temas' });
  }
});

// Rota GET para recuperar questões cadastradas permitindo filtragem por tema ou por número[cite: 4]
app.get('/registros', async (req, res) => {
  try {
    // Desestrutura os parâmetros opcionais da query string (?tema=...&numero=...)[cite: 4]
    const { tema, numero } = req.query;

    // Declara o início do comando SQL base[cite: 4]
    let instrucaoSql = 'SELECT * FROM repositorio';

    // Vetor que guardará as cláusulas de condição dinâmicas[cite: 4]
    const condicoes = [];

    // Vetor que guardará os valores a serem substituídos nos placeholders[cite: 4]
    const parametros = [];

    // Se o filtro de tema foi fornecido, adiciona a cláusula correspondente[cite: 4]
    if (tema) {
      condicoes.push('tema = ?');
      parametros.push(tema);
    }

    // Se o filtro de número foi fornecido, adiciona a cláusula correspondente[cite: 4]
    if (numero) {
      condicoes.push('numero = ?');
      parametros.push(numero);
    }

    // Se houver ao menos um filtro, concatena as condições com o operador AND[cite: 4]
    if (condicoes.length > 0) {
      instrucaoSql += ` WHERE ${condicoes.join(' AND ')}`;
    }

    // Executa a busca parametrizada no MySQL[cite: 4]
    const [linhas] = await pool.query(instrucaoSql, parametros);

    // Retorna o conjunto de registros filtrados[cite: 4]
    res.json(linhas);
  } catch (erro) {
    // Loga erro no terminal[cite: 4]
    console.error('Erro ao buscar registros:', erro);

    // Retorna resposta de erro ao cliente[cite: 4]
    res.status(500).json({ message: 'Erro ao buscar registros' });
  }
});

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

// Middleware global para tratamento de erros síncronos e exceções de middlewares (ex.: CORS ou Multer)[cite: 4]
app.use((erro, req, res, next) => {
  // Imprime o erro interceptado no console[cite: 4]
  console.error('Erro capturado pelo middleware:', erro.message);

  // Retorna HTTP 400 informando o motivo da rejeição da requisição[cite: 4]
  res.status(400).json({ error: erro.message });
});

// Define a porta onde a aplicação vai escutar, priorizando a variável PORT ou adotando 3042[cite: 4]
const PORT = process.env.PORT || 3042;

// Coloca o servidor Express no ar escutando na porta configurada[cite: 4]
app.listen(PORT, () => {
  // Exibe a mensagem de sucesso no terminal indicando a porta ativa[cite: 4]
  console.log(`🚀 [Servidor] Rodando com alta performance na porta ${PORT}`);
});