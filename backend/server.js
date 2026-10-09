// Carrega as variáveis de ambiente declaradas no arquivo .env para o objeto global process.env[cite: 2]
require('dotenv').config();

// Importa o framework Express para gerenciar rotas, middlewares e requisições HTTP[cite: 2]
const express = require('express');

// Importa o cliente MySQL com suporte nativo a Promises (permitindo o uso de async/await)[cite: 2]
const mysql = require('mysql2/promise');

// Importa o middleware Multer para processamento de formulários multipart/form-data (uploads de arquivos)[cite: 2]
const multer = require('multer');

// Importa o middleware CORS para controle de permissões de origens e cabeçalhos entre domínios[cite: 2]
const cors = require('cors');

// Importa o módulo nativo do Node.js para normalização e concatenação de caminhos de arquivos[cite: 2]
const path = require('path');

// Importa o módulo nativo do Node.js para manipulação de pastas e arquivos no sistema operacional[cite: 2]
const fs = require('fs');

// Importa a biblioteca Archiver para empacotamento e compactação em formato ZIP[cite: 2]
const archiver = require('archiver');

// Importa a biblioteca Unzipper para leitura e descompactação de arquivos ZIP[cite: 2]
const unzipper = require('unzipper');

// Importa a biblioteca Sharp para manipulação e compressão em alta velocidade de imagens[cite: 2]
const sharp = require('sharp');

// Importa a classe GoogleGenAI do SDK oficial do Google GenAI[cite: 2]
const { GoogleGenAI } = require('@google/genai');

// Cria a instância principal da aplicação Express[cite: 2]
const app = express();

// Instancia o cliente da IA passando a chave de API cadastrada nas variáveis de ambiente[cite: 2]
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Função autoexecutável (IIFE) para validar e logar a disponibilidade da chave da IA no início[cite: 2]
(() => {
  // Lê a variável de ambiente que define o modelo padrão do Gemini[cite: 2]
  const modeloIa = process.env.GEMINI_MODEL;

  // Obtém o valor da chave de API configurada no .env[cite: 2]
  const chaveApi = process.env.GEMINI_API_KEY;

  // Verifica se a chave existe e não está em branco[cite: 2]
  if (chaveApi && chaveApi.trim() !== '') {
    // Cria uma versão ofuscada da chave mostrando apenas os 4 primeiros e 4 últimos dígitos por segurança[cite: 2]
    const chaveMascarada = `${chaveApi.substring(0, 4)}...${chaveApi.slice(-4)}`;

    // Exibe no terminal a confirmação de inicialização do SDK com modelo e chave identificados[cite: 2]
    console.log(`🤖 [Google GenAI] Modelo encontrado: '${modeloIa}' | Chave de API reconhecida com sucesso! (${chaveMascarada})`);
  } else {
    // Avisa no console caso a chave não esteja presente nas configurações[cite: 2]
    console.warn(`⚠️ [Google GenAI] ATENÇÃO: A variável GEMINI_API_KEY não foi encontrada ou está vazia no arquivo .env!`);
  }
})();

// Carrega a lista de origens autorizadas do .env dividindo por vírgula ou aplica lista padrão de portas locais e domínios[cite: 2]
const origensPermitidas = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origem) => origem.trim()) // Se configurado, separa por vírgula e remove espaços[cite: 2]
  : [
      'http://localhost:3000',     // Porta padrão de aplicações React[cite: 2]
      'http://localhost:5173',     // Porta padrão do Vite[cite: 2]
      'http://localhost:3042',     // Porta local da própria aplicação[cite: 2]
      'http://192.168.0.16:3042',  // Acesso via rede local[cite: 2]
      'https://quiz.emersonsilv.win' // Domínio de produção[cite: 2]
    ];

// Objeto de configuração para o middleware CORS[cite: 2]
const opcoesCors = {
  // Função validadora de origem da requisição[cite: 2]
  origin: (origem, callback) => {
    // Permite requisições sem origem (como ferramentas CLI, Postman ou rotas internas do servidor)[cite: 2]
    if (!origem) return callback(null, true);

    // Permite a requisição se o cabeçalho 'Origin' constar na lista autorizada[cite: 2]
    if (origensPermitidas.includes(origem)) return callback(null, true);

    // Rejeita a requisição retornando um erro de bloqueio CORS[cite: 2]
    return callback(new Error(`Origem não permitida pelo CORS: ${origem}`));
  },
  // Métodos HTTP permitidos para consumo das rotas[cite: 2]
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // Cabeçalhos HTTP aceitos enviados pelo cliente[cite: 2]
  allowedHeaders: ['Content-Type', 'Authorization'],
  // Permite envio de cookies e headers de autorização em chamadas cross-origin[cite: 2]
  credentials: true,
  // Retorna status 200 para requisições prévias do tipo OPTIONS (preflight)[cite: 2]
  optionsSuccessStatus: 200
};

// Define o caminho absoluto para o diretório de imagens ('src/img') e temporários[cite: 2]
const diretorioUpload = path.join(__dirname, 'src/img');
const diretorioTmp = path.join(__dirname, 'tmp');

// Cria o diretório de uploads recursivamente se ele ainda não existir no disco[cite: 2]
if (!fs.existsSync(diretorioUpload)) fs.mkdirSync(diretorioUpload, { recursive: true });

// Cria o diretório temporário recursivamente se ele ainda não existir no disco[cite: 2]
if (!fs.existsSync(diretorioTmp)) fs.mkdirSync(diretorioTmp, { recursive: true });

// Função que redimensiona para 400x400 e compacta JPG/JPEG em 50%[cite: 2]
async function otimizarImagemSalva(caminhoArquivo) {
  // Aborta o processamento se o caminho for nulo ou se o arquivo físico não for encontrado[cite: 2]
  if (!caminhoArquivo || !fs.existsSync(caminhoArquivo)) return;

  try {
    // Extrai e normaliza a extensão do arquivo para minúsculas[cite: 2]
    const extensao = path.extname(caminhoArquivo).toLowerCase();

    // Lê os bytes brutos do arquivo da imagem salvando em memória temporária (Buffer)[cite: 2]
    const bufferOriginal = await fs.promises.readFile(caminhoArquivo);

    // Cria o pipeline do Sharp definindo o redimensionamento exato para 400x400 cortando o excesso pelo centro[cite: 2]
    let pipeline = sharp(bufferOriginal).resize(400, 400, {
      fit: 'cover',
      position: 'center'
    });

    // Se o arquivo for JPEG/JPG, aplica compactação com 50% de qualidade e algoritmo mozjpeg[cite: 2]
    if (extensao === '.jpg' || extensao === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: 50, mozjpeg: true });
    // Se for WebP, aplica qualidade de 65%[cite: 2]
    } else if (extensao === '.webp') {
      pipeline = pipeline.webp({ quality: 65 });
    // Se for PNG, aplica o nível 8 de compressão[cite: 2]
    } else if (extensao === '.png') {
      pipeline = pipeline.png({ compressionLevel: 8 });
    }

    // Executa as operações e gera o novo buffer com a imagem processada[cite: 2]
    const bufferFinal = await pipeline.toBuffer();

    // Sobrescreve o arquivo no disco com a nova versão otimizada[cite: 2]
    await fs.promises.writeFile(caminhoArquivo, bufferFinal);

    // Registra no console a conclusão da compressão da imagem[cite: 2]
    console.log(`🖼️ [Sharp] Imagem otimizada: 400x400 px (${path.basename(caminhoArquivo)})`);
  } catch (erro) {
    // Notifica em caso de erro sem interromper a execução do fluxo principal[cite: 2]
    console.warn(`⚠️ [Sharp] Não foi possível otimizar ${caminhoArquivo}:`, erro.message);
  }
}

// Configura o mecanismo de armazenamento em disco do Multer para as imagens[cite: 2]
const armazenamentoDisco = multer.diskStorage({
  // Define o diretório destino onde as fotos enviadas serão armazenadas[cite: 2]
  destination: (req, file, cb) => cb(null, diretorioUpload),
  // Define o padrão do nome do arquivo salvo: [nome_do_campo]-[timestamp].[extensao][cite: 2]
  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${extensao}`);
  }
});

// Inicializa a instância principal do Multer para upload de imagens[cite: 2]
const upload = multer({
  // Utiliza a estratégia de armazenamento em disco configurada[cite: 2]
  storage: armazenamentoDisco,
  // Limita o tamanho máximo permitido por arquivo a 10MB[cite: 2]
  limits: { fileSize: 10 * 1024 * 1024 },
  // Filtro para validar os formatos de arquivo permitidos[cite: 2]
  fileFilter: (req, file, cb) => {
    const tipos = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/webp', 'image/gif'];
    // Se o MIME type for aceito, autoriza o upload[cite: 2]
    if (tipos.includes(file.mimetype)) cb(null, true);
    // Caso contrário, bloqueia disparando uma exceção amigável[cite: 2]
    else cb(new Error('Formato de imagem inválido. Use JPG, PNG, GIF ou WEBP.'));
  }
});

// Configura o Multer exclusivo para receber o arquivo .ZIP do backup[cite: 2]
const uploadZip = multer({
  // Salva diretamente na pasta temporária[cite: 2]
  dest: diretorioTmp,
  // Permite arquivos zip de até 100MB[cite: 2]
  limits: { fileSize: 100 * 1024 * 1024 }
});

// Cria o pool de conexões com o MySQL com suporte a múltiplos comandos SQL[cite: 2]
const pool = mysql.createPool({
  host: process.env.DB_HOST,                         // Endereço do servidor MySQL[cite: 2]
  user: process.env.DB_USER,                         // Usuário do banco[cite: 2]
  password: process.env.DB_PASSWORD,                 // Senha de autenticação[cite: 2]
  database: process.env.DB_NAME,                     // Nome do banco de dados[cite: 2]
  port: Number(process.env.DB_PORT) || 3306,         // Porta de conexão (padrão 3306)[cite: 2]
  waitForConnections: true,                          // Aguarda conexão disponível caso o limite seja atingido[cite: 2]
  connectionLimit: 10,                               // Número máximo de conexões simultâneas abertas[cite: 2]
  queueLimit: 0,                                     // Fila sem limite para requisições de conexão pendentes[cite: 2]
  multipleStatements: true                           // Habilita execução de múltiplos comandos em uma só query (usado no restore)[cite: 2]
});

// Middleware que faz o parse de payloads JSON nas requisições recebidas[cite: 2]
app.use(express.json());

// Habilita as políticas de CORS na aplicação com base nas configurações criadas[cite: 2]
app.use(cors(opcoesCors));

// Disponibiliza as imagens publicamente através do prefixo '/imagens'[cite: 2]
app.use('/imagens', express.static(diretorioUpload));

// Disponibiliza as imagens também pela rota legada '/src/img'[cite: 2]
app.use('/src/img', express.static(diretorioUpload));

// Verifica se a pasta gerada pelo build do React se chama 'dist' ou 'build'[cite: 2]
const pastaBuildReact = fs.existsSync(path.join(__dirname, 'dist'))
  ? path.join(__dirname, 'dist')
  : path.join(__dirname, 'build');

// Serve os arquivos estáticos compilados do frontend (HTML, JS, CSS)[cite: 2]
app.use(express.static(pastaBuildReact));

// Função assíncrona autoexecutável para testar a conexão com o banco de dados na inicialização[cite: 2]
(async () => {
  try {
    // Tenta obter uma conexão válida do pool[cite: 2]
    const conexao = await pool.getConnection();
    console.log('📦 [MySQL] Conexão ao MySQL estabelecida com sucesso!');
    // Libera a conexão de volta para o pool[cite: 2]
    conexao.release();
  } catch (erro) {
    // Registra falha de conexão inicial no console[cite: 2]
    console.error('❌ [MySQL] Falha ao conectar no banco:', erro.message);
  }
})();

// Rota GET /consultaAleatoria[cite: 2]
app.get('/consultaAleatoria', async (req, res) => {
  try {
    // Executa a busca de 1 registro aleatório no banco[cite: 2]
    const [linhas] = await pool.query('SELECT * FROM repositorio ORDER BY RAND() LIMIT 1');

    // Se a tabela estiver vazia, retorna HTTP 404[cite: 2]
    if (linhas.length === 0) return res.status(404).json({ message: 'Nenhum registro encontrado.' });

    // Retorna os dados da pergunta sorteada[cite: 2]
    res.json(linhas[0]);
  } catch (erro) {
    // Retorna erro 500 caso a query falhe[cite: 2]
    res.status(500).json({ message: 'Erro interno ao consultar registro.' });
  }
});

// Rota POST /gerar-questoes com IA[cite: 2]
app.post('/gerar-questoes', async (req, res) => {
  try {
    // Desestrutura os parâmetros fornecidos no corpo da requisição[cite: 2]
    const { tema, promptUsuario, quantidade } = req.body;

    // Define o modelo da IA com fallback para o 'gemini-2.5-flash-lite'[cite: 2]
    const modeloEscolhido = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

    // Monta o prompt solicitando um formato JSON estrito para o retorno[cite: 2]
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

    // Envia o prompt para a API do Google GenAI solicitando resposta nativa em JSON[cite: 2]
    const respostaIa = await ai.models.generateContent({
      model: modeloEscolhido,
      contents: promptInstrucao,
      config: { responseMimeType: 'application/json' }
    });

    // Faz o parse do texto retornado pela IA e responde para o cliente como JSON[cite: 2]
    res.json(JSON.parse(respostaIa.text.trim()));
  } catch (erro) {
    // Trata e retorna eventuais falhas durante a chamada à IA[cite: 2]
    res.status(500).json({ message: 'Erro ao gerar questões com IA', error: erro.message });
  }
});

// Rota POST /insert (Redimensiona e compacta a imagem recebida)[cite: 2]
app.post('/insert', upload.single('imagem'), async (req, res) => {
  try {
    // Extrai os campos do formulário enviados na requisição[cite: 2]
    const { tema, pergunta, A, B, C, D, correta } = req.body;

    // Pega o nome do arquivo gerado pelo Multer caso tenha havido upload[cite: 2]
    const nomeArquivo = req.file ? req.file.filename : null;

    // Se houve envio de imagem, processa imediatamente para 400x400 / 50%[cite: 2]
    if (req.file) {
      await otimizarImagemSalva(req.file.path);
    }

    // Declara o comando SQL parametrizado para inserção segura (evitando SQL Injection)[cite: 2]
    const instrucaoSql = `
      INSERT INTO repositorio (tema, pergunta, A, B, C, D, imagem, correta) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Mapeia os valores a serem substituídos nos placeholders '?' da query[cite: 2]
    const valoresParametros = [tema, pergunta, A, B, C, D, nomeArquivo, correta];

    // Executa a instrução de inserção no banco de dados[cite: 2]
    const [resultadoInsercao] = await pool.query(instrucaoSql, valoresParametros);

    // Consulta os dados completos do registro recém-criado utilizando seu ID auto-incrementado[cite: 2]
    const [novoRegistro] = await pool.query(
      'SELECT * FROM repositorio WHERE numero = ?',
      [resultadoInsercao.insertId]
    );

    // Retorna HTTP 201 Created junto com o registro inserido[cite: 2]
    res.status(201).json({
      message: 'Registro inserido com sucesso!',
      data: novoRegistro[0] || { id: resultadoInsercao.insertId }
    });
  } catch (erro) {
    // Retorna HTTP 500 caso ocorra falha de inserção[cite: 2]
    res.status(500).json({ message: 'Erro ao inserir dados no banco de dados', error: erro.message });
  }
});

// Rota GET /temas[cite: 2]
app.get('/temas', async (req, res) => {
  try {
    // Busca todos os temas distintos cadastrados no repositório[cite: 2]
    const [linhas] = await pool.query('SELECT DISTINCT tema FROM repositorio');

    // Retorna o array de temas para o cliente[cite: 2]
    res.json(linhas);
  } catch (erro) {
    // Trata e reporta erros de consulta[cite: 2]
    res.status(500).json({ message: 'Erro ao buscar temas' });
  }
});

// Rota GET /registros[cite: 2]
app.get('/registros', async (req, res) => {
  try {
    // Extrai os filtros opcionais passados na query string (?tema=...&numero=...)[cite: 2]
    const { tema, numero } = req.query;

    // Declara a consulta base padrão[cite: 2]
    let instrucaoSql = 'SELECT * FROM repositorio';
    const condicoes = [];
    const parametros = [];

    // Adiciona o filtro de tema, se fornecido[cite: 2]
    if (tema) { condicoes.push('tema = ?'); parametros.push(tema); }

    // Adiciona o filtro por ID/número, se fornecido[cite: 2]
    if (numero) { condicoes.push('numero = ?'); parametros.push(numero); }

    // Concatena a cláusula WHERE unindo as condições com AND, se houver filtros[cite: 2]
    if (condicoes.length > 0) instrucaoSql += ` WHERE ${condicoes.join(' AND ')}`;

    // Executa a busca parametrizada no banco[cite: 2]
    const [linhas] = await pool.query(instrucaoSql, parametros);

    // Retorna os registros encontrados[cite: 2]
    res.json(linhas);
  } catch (erro) {
    // Trata e reporta erros durante a listagem[cite: 2]
    res.status(500).json({ message: 'Erro ao buscar registros' });
  }
});

// Rota PUT /atualizar/:numero (Redimensiona e compacta caso uma nova imagem seja enviada)[cite: 2]
app.put('/atualizar/:numero', upload.single('imagem'), async (req, res) => {
  try {
    // Obtém os dados de campos de texto enviados pelo formulário[cite: 2]
    const { tema, pergunta, A, B, C, D, correta } = req.body;

    // Define o caminho relativo da nova imagem caso um novo arquivo tenha sido enviado[cite: 2]
    const imagem = req.file ? path.relative(__dirname, req.file.path) : null;

    // Se uma nova imagem foi enviada na edição, otimiza para 400x400 / 50%[cite: 2]
    if (req.file) {
      await otimizarImagemSalva(req.file.path);
    }

    // Inicia a construção da query de atualização[cite: 2]
    let instrucaoSql = `
      UPDATE repositorio
      SET tema = ?, pergunta = ?, A = ?, B = ?, C = ?, D = ?, correta = ?
    `;
    const parametros = [tema, pergunta, A, B, C, D, correta];

    // Se uma nova imagem foi recebida, adiciona o campo 'imagem' à atualização[cite: 2]
    if (imagem) {
      instrucaoSql += ', imagem = ?';
      parametros.push(imagem);
    }

    // Restringe o UPDATE exclusivamente ao número recebido nos parâmetros de rota[cite: 2]
    instrucaoSql += ' WHERE numero = ?';
    parametros.push(req.params.numero);

    // Executa a atualização no banco de dados[cite: 2]
    const [resultado] = await pool.query(instrucaoSql, parametros);

    // Se nenhuma linha foi afetada, indica que o registro alvo não existe[cite: 2]
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ message: 'Registro não encontrado para atualização.' });
    }

    // Responde com sucesso[cite: 2]
    res.json({ message: 'Registro atualizado com sucesso!' });
  } catch (erro) {
    // Trata e reporta falhas durante a alteração[cite: 2]
    res.status(500).json({ message: 'Erro ao atualizar registro', error: erro.message });
  }
});

// Rota GET /backup[cite: 2]
app.get('/backup', async (req, res) => {
  try {
    // Obtém o DDL original de criação da tabela 'repositorio' no banco[cite: 2]
    const [createTableResult] = await pool.query('SHOW CREATE TABLE repositorio');
    const ddl = createTableResult[0]['Create Table'];

    // Recupera todos os registros atualmente presentes na tabela[cite: 2]
    const [registros] = await pool.query('SELECT * FROM repositorio');

    // Constrói o cabeçalho do arquivo de script SQL de backup[cite: 2]
    let sqlDump = `-- Backup Torta na Cara\n-- Data: ${new Date().toISOString()}\n\n`;
    sqlDump += `DROP TABLE IF EXISTS \`repositorio\`;\n`;
    sqlDump += `${ddl};\n\n`;

    // Constrói os comandos INSERT caso existam dados[cite: 2]
    if (registros.length > 0) {
      sqlDump += `INSERT INTO \`repositorio\` (\`numero\`, \`tema\`, \`pergunta\`, \`A\`, \`B\`, \`C\`, \`D\`, \`imagem\`, \`correta\`) VALUES\n`;
      // Mapeia e escapa caracteres especiais e aspas simples para evitar falha de sintaxe SQL[cite: 2]
      const linhasSql = registros.map((r) => {
        const esc = (v) => (v === null ? 'NULL' : `'${String(v).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`);
        return `(${r.numero}, ${esc(r.tema)}, ${esc(r.pergunta)}, ${esc(r.A)}, ${esc(r.B)}, ${esc(r.C)}, ${esc(r.D)}, ${esc(r.imagem)}, ${esc(r.correta)})`;
      });
      // Une todas as linhas de registros em formato SQL[cite: 2]
      sqlDump += linhasSql.join(',\n') + ';\n';
    }

    // Define o nome dinâmico para o download do arquivo ZIP gerado[cite: 2]
    const nomeArquivoZip = `backup-torta-na-cara-${Date.now()}.zip`;

    // Configura os cabeçalhos HTTP para indicar envio de anexo ZIP para download no navegador[cite: 2]
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivoZip}"`);

    // Cria a instância do empacotador ZIP com nível 9 (máxima compressão)[cite: 2]
    const arquivoZip = archiver('zip', { zlib: { level: 9 } });

    // Escuta erros que possam ocorrer durante o processo de compressão[cite: 2]
    arquivoZip.on('error', (err) => {
      console.error('Erro no archiver:', err);
      if (!res.headersSent) res.status(500).json({ error: 'Erro ao gerar zip.' });
    });

    // Conecta a saída do arquivo ZIP diretamente no stream de resposta HTTP do cliente[cite: 2]
    arquivoZip.pipe(res);

    // Insere o arquivo SQL gerado dentro do arquivo ZIP[cite: 2]
    arquivoZip.append(sqlDump, { name: 'banco_dados_repositorio.sql' });

    // Se o diretório de imagens existir, empacota todas as fotos na subpasta 'img' dentro do ZIP[cite: 2]
    if (fs.existsSync(diretorioUpload)) {
      arquivoZip.directory(diretorioUpload, 'img');
    }

    // Finaliza o empacotamento e fecha o stream de envio[cite: 2]
    await arquivoZip.finalize();
  } catch (erro) {
    // Trata eventuais erros no fluxo do backup[cite: 2]
    console.error('Erro na rota de backup:', erro);
    if (!res.headersSent) res.status(500).json({ error: 'Falha no backup: ' + erro.message });
  }
});

// Rota POST /restaurar[cite: 2]
app.post('/restaurar', uploadZip.single('backupZip'), async (req, res) => {
  // Valida se o arquivo zip foi anexado na requisição[cite: 2]
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo zip enviado.' });
  }

  // Caminho do arquivo zip recebido temporariamente[cite: 2]
  const caminhoZipEnviado = req.file.path;

  // Caminho da pasta transitória onde o arquivo será descompactado[cite: 2]
  const pastaExtracao = path.join(diretorioTmp, `restore-${Date.now()}`);

  try {
    // Abre a leitura do arquivo compactado[cite: 2]
    const zipAberto = await unzipper.Open.file(caminhoZipEnviado);

    // Extrai todo o conteúdo do zip para o diretório de extração[cite: 2]
    await zipAberto.extract({ path: pastaExtracao });

    // Monta o caminho esperado para o script SQL extraído[cite: 2]
    const caminhoSql = path.join(pastaExtracao, 'banco_dados_repositorio.sql');

    // Se o arquivo SQL existir, executa o script no MySQL[cite: 2]
    if (fs.existsSync(caminhoSql)) {
      const conteudoSql = await fs.promises.readFile(caminhoSql, 'utf-8');
      if (conteudoSql.trim()) {
        await pool.query(conteudoSql);
      }
    } else {
      // Dispara erro caso o dump SQL não esteja presente no pacote[cite: 2]
      throw new Error('Arquivo banco_dados_repositorio.sql não encontrado no zip.');
    }

    // Monta o caminho da subpasta 'img' contendo as fotos restauradas[cite: 2]
    const pastaImgExtraida = path.join(pastaExtracao, 'img');

    // Se a pasta de imagens existir no backup, move os arquivos de volta para o diretório oficial[cite: 2]
    if (fs.existsSync(pastaImgExtraida)) {
      const arquivosFotos = await fs.promises.readdir(pastaImgExtraida);
      // Itera por cada imagem copiada copiando-a para a pasta definitiva de uploads[cite: 2]
      for (const foto of arquivosFotos) {
        const origem = path.join(pastaImgExtraida, foto);
        const destino = path.join(diretorioUpload, foto);
        await fs.promises.copyFile(origem, destino);
      }
    }

    // Retorna mensagem de confirmação de restauração completa[cite: 2]
    res.json({ message: 'Backup restaurado com sucesso! Dados e imagens recuperados.' });
  } catch (erro) {
    // Registra falhas ocorridas durante a descompactação ou restauração[cite: 2]
    console.error('Erro na restauração:', erro);
    res.status(500).json({ message: 'Falha ao restaurar backup: ' + erro.message });
  } finally {
    // Bloco de limpeza: remove com segurança o arquivo zip enviado e a pasta temporária de extração[cite: 2]
    try {
      if (fs.existsSync(caminhoZipEnviado)) await fs.promises.unlink(caminhoZipEnviado);
      if (fs.existsSync(pastaExtracao)) await fs.promises.rm(pastaExtracao, { recursive: true, force: true });
    } catch (e) {
      console.warn('Erro ao limpar pasta temporária:', e.message);
    }
  }
});

// Fallback SPA React: redireciona qualquer rota não tratada pela API para o 'index.html' do client[cite: 2]
app.get('*', (req, res) => {
  const indexHtml = path.join(pastaBuildReact, 'index.html');
  if (fs.existsSync(indexHtml)) res.sendFile(indexHtml);
  else res.status(404).send('Build do React não encontrado.');
});

// Middleware global para captura e padronização de erros das requisições Express[cite: 2]
app.use((erro, req, res, next) => {
  res.status(400).json({ error: erro.message });
});

// Define a porta do servidor a partir do ambiente ou recorre ao fallback 3042[cite: 2]
const PORT = process.env.PORT || 3042;

// Inicia o listener HTTP do servidor na porta definida[cite: 2]
app.listen(PORT, () => {
  console.log(`🚀 [Servidor] Rodando na porta ${PORT}`);
});