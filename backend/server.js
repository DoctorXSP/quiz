// Carrega as variáveis de ambiente declaradas no arquivo .env para o objeto global process.env
require('dotenv').config();

// Importa o framework Express para gerenciar rotas, middlewares e requisições HTTP
const express = require('express');

// Importa o cliente MySQL com suporte nativo a Promises (permitindo o uso de async/await)
const mysql = require('mysql2/promise');

// Importa o middleware Multer para processamento de formulários multipart/form-data (uploads de arquivos)
const multer = require('multer');

// Importa o middleware CORS para controle de permissões de origens e cabeçalhos entre domínios
const cors = require('cors');

// Importa o módulo nativo do Node.js para normalização e concatenação de caminhos de arquivos
const path = require('path');

// Importa o módulo nativo do Node.js para manipulação de pastas e arquivos no sistema operacional
const fs = require('fs');

// Importa a biblioteca Archiver para empacotamento e compactação em formato ZIP
const archiver = require('archiver');

// Importa a biblioteca Unzipper para leitura e descompactação de arquivos ZIP
const unzipper = require('unzipper');

// Importa a biblioteca Sharp para manipulação e compressão em alta velocidade de imagens
const sharp = require('sharp');

// Importa a classe GoogleGenAI do SDK oficial do Google GenAI
const { GoogleGenAI } = require('@google/genai');

// Cria a instância principal da aplicação Express
const app = express();

// Instancia o cliente da IA passando a chave de API cadastrada nas variáveis de ambiente
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Função autoexecutável (IIFE) para validar e logar a disponibilidade da chave da IA no início
(() => {
  // Lê a variável de ambiente que define o modelo padrão do Gemini
  const modeloIa = process.env.GEMINI_MODEL;

  // Obtém o valor da chave de API configurada no .env
  const chaveApi = process.env.GEMINI_API_KEY;

  // Verifica se a chave existe e não está em branco
  if (chaveApi && chaveApi.trim() !== '') {
    // Cria uma versão ofuscada da chave mostrando apenas os 4 primeiros e 4 últimos dígitos por segurança
    const chaveMascarada = `${chaveApi.substring(0, 4)}...${chaveApi.slice(-4)}`;

    // Exibe no terminal a confirmação de inicialização do SDK com modelo e chave identificados
    console.log(`🤖 [Google GenAI] Modelo encontrado: '${modeloIa}' | Chave de API reconhecida com sucesso! (${chaveMascarada})`);
  } else {
    // Avisa no console caso a chave não esteja presente nas configurações
    console.warn(`⚠️ [Google GenAI] ATENÇÃO: A variável GEMINI_API_KEY não foi encontrada ou está vazia no arquivo .env!`);
  }
})();

// Carrega a lista de origens autorizadas do .env dividindo por vírgula ou aplica lista padrão de portas locais e domínios
const origensPermitidas = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origem) => origem.trim()) // Se configurado, separa por vírgula e remove espaços
  : [
      'http://localhost:3000',     // Porta padrão de aplicações React
      'http://localhost:5173',     // Porta padrão do Vite
      'http://localhost:3042',     // Porta local da própria aplicação
      'http://192.168.0.16:3042',  // Acesso via rede local
      'https://quiz.emersonsilv.win' // Domínio de produção
    ];

// Objeto de configuração para o middleware CORS
const opcoesCors = {
  // Função validadora de origem da requisição
  origin: (origem, callback) => {
    // Permite requisições sem origem (como ferramentas CLI, Postman ou rotas internas do servidor)
    if (!origem) return callback(null, true);

    // Permite a requisição se o cabeçalho 'Origin' constar na lista autorizada
    if (origensPermitidas.includes(origem)) return callback(null, true);

    // Rejeita a requisição retornando um erro de bloqueio CORS
    return callback(new Error(`Origem não permitida pelo CORS: ${origem}`));
  },
  // Métodos HTTP permitidos para consumo das rotas
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // Cabeçalhos HTTP aceitos enviados pelo cliente
  allowedHeaders: ['Content-Type', 'Authorization'],
  // Permite envio de cookies e headers de autorização em chamadas cross-origin
  credentials: true,
  // Retorna status 200 para requisições prévias do tipo OPTIONS (preflight)
  optionsSuccessStatus: 200
};

// Define o caminho absoluto para o diretório de imagens ('src/img') e temporários
const diretorioUpload = path.join(__dirname, 'src/img');
const diretorioTmp = path.join(__dirname, 'tmp');

// Cria o diretório de uploads recursivamente se ele ainda não existir no disco
if (!fs.existsSync(diretorioUpload)) fs.mkdirSync(diretorioUpload, { recursive: true });

// Cria o diretório temporário recursivamente se ele ainda não existir no disco
if (!fs.existsSync(diretorioTmp)) fs.mkdirSync(diretorioTmp, { recursive: true });

// Função que redimensiona para 400x400 e compacta JPG/JPEG em 50%
async function otimizarImagemSalva(caminhoArquivo) {
  // Aborta o processamento se o caminho for nulo ou se o arquivo físico não for encontrado
  if (!caminhoArquivo || !fs.existsSync(caminhoArquivo)) return;

  try {
    // Extrai e normaliza a extensão do arquivo para minúsculas
    const extensao = path.extname(caminhoArquivo).toLowerCase();

    // Lê os bytes brutos do arquivo da imagem salvando em memória temporária (Buffer)
    const bufferOriginal = await fs.promises.readFile(caminhoArquivo);

    // Cria o pipeline do Sharp definindo o redimensionamento exato para 400x400 cortando o excesso pelo centro
    let pipeline = sharp(bufferOriginal).resize(400, 400, {
      fit: 'cover',
      position: 'center'
    });

    // Se o arquivo for JPEG/JPG, aplica compactação com 50% de qualidade e algoritmo mozjpeg
    if (extensao === '.jpg' || extensao === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: 50, mozjpeg: true });
    // Se for WebP, aplica qualidade de 65%
    } else if (extensao === '.webp') {
      pipeline = pipeline.webp({ quality: 65 });
    // Se for PNG, aplica o nível 8 de compressão
    } else if (extensao === '.png') {
      pipeline = pipeline.png({ compressionLevel: 8 });
    }

    // Executa as operações e gera o novo buffer com a imagem processada
    const bufferFinal = await pipeline.toBuffer();

    // Sobrescreve o arquivo no disco com a nova versão otimizada
    await fs.promises.writeFile(caminhoArquivo, bufferFinal);

    // Registra no console a conclusão da compressão da imagem
    console.log(`🖼️ [Sharp] Imagem otimizada: 400x400 px (${path.basename(caminhoArquivo)})`);
  } catch (erro) {
    // Notifica em caso de erro sem interromper a execução do fluxo principal
    console.warn(`⚠️ [Sharp] Não foi possível otimizar ${caminhoArquivo}:`, erro.message);
  }
}

// Configura o mecanismo de armazenamento em disco do Multer para as imagens
const armazenamentoDisco = multer.diskStorage({
  // Define o diretório destino onde as fotos enviadas serão armazenadas
  destination: (req, file, cb) => cb(null, diretorioUpload),
  // Define o padrão do nome do arquivo salvo: [nome_do_campo]-[timestamp].[extensao]
  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${extensao}`);
  }
});

// Inicializa a instância principal do Multer para upload de imagens
const upload = multer({
  // Utiliza a estratégia de armazenamento em disco configurada
  storage: armazenamentoDisco,
  // Limita o tamanho máximo permitido por arquivo a 10MB
  limits: { fileSize: 10 * 1024 * 1024 },
  // Filtro para validar os formatos de arquivo permitidos
  fileFilter: (req, file, cb) => {
    const tipos = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/webp', 'image/gif'];
    // Se o MIME type for aceito, autoriza o upload
    if (tipos.includes(file.mimetype)) cb(null, true);
    // Caso contrário, bloqueia disparando uma exceção amigável
    else cb(new Error('Formato de imagem inválido. Use JPG, PNG, GIF ou WEBP.'));
  }
});

// Configura o Multer exclusivo para receber o arquivo .ZIP do backup
const uploadZip = multer({
  // Salva diretamente na pasta temporária
  dest: diretorioTmp,
  // Permite arquivos zip de até 100MB
  limits: { fileSize: 100 * 1024 * 1024 }
});

// Cria o pool de conexões com o MySQL com suporte a múltiplos comandos SQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,                         // Endereço do servidor MySQL
  user: process.env.DB_USER,                         // Usuário do banco
  password: process.env.DB_PASSWORD,                 // Senha de autenticação
  database: process.env.DB_NAME,                     // Nome do banco de dados
  port: Number(process.env.DB_PORT) || 3306,         // Porta de conexão (padrão 3306)
  waitForConnections: true,                          // Aguarda conexão disponível caso o limite seja atingido
  connectionLimit: 10,                               // Número máximo de conexões simultâneas abertas
  queueLimit: 0,                                     // Fila sem limite para requisições de conexão pendentes
  multipleStatements: true                           // Habilita execução de múltiplos comandos em uma só query (usado no restore)
});

// Middleware que faz o parse de payloads JSON nas requisições recebidas
app.use(express.json());

// Habilita as políticas de CORS na aplicação com base nas configurações criadas
app.use(cors(opcoesCors));

// Disponibiliza as imagens publicamente através do prefixo '/imagens'
app.use('/imagens', express.static(diretorioUpload));

// Disponibiliza as imagens também pela rota legada '/src/img'
app.use('/src/img', express.static(diretorioUpload));

// Verifica se a pasta gerada pelo build do React se chama 'dist' ou 'build'
const pastaBuildReact = fs.existsSync(path.join(__dirname, 'dist'))
  ? path.join(__dirname, 'dist')
  : path.join(__dirname, 'build');

// Serve os arquivos estáticos compilados do frontend (HTML, JS, CSS)
app.use(express.static(pastaBuildReact));

// Função assíncrona autoexecutável para testar a conexão com o banco de dados na inicialização
(async () => {
  try {
    // Tenta obter uma conexão válida do pool
    const conexao = await pool.getConnection();
    console.log('📦 [MySQL] Conexão ao MySQL estabelecida com sucesso!');
    // Libera a conexão de volta para o pool
    conexao.release();
  } catch (erro) {
    // Registra falha de conexão inicial no console
    console.error('❌ [MySQL] Falha ao conectar no banco:', erro.message);
  }
})();

// Rota GET /consultaAleatoria
app.get('/consultaAleatoria', async (req, res) => {
  try {
    // Extrai o parâmetro com os IDs que devem ser excluídos do sorteio
    const { excluir } = req.query;

    let instrucaoSql = 'SELECT * FROM repositorio';
    const parametros = [];

    // Se houver IDs a excluir no formato "1,2,3"
    if (excluir && excluir.trim() !== '') {
      const idsExcluir = excluir
        .split(',')
        .map((id) => Number(id.trim()))
        .filter((id) => !isNaN(id) && id > 0);

      if (idsExcluir.length > 0) {
        // Cria placeholders '?' para o NOT IN de forma segura contra SQL injection
        const placeholders = idsExcluir.map(() => '?').join(',');
        instrucaoSql += ` WHERE numero NOT IN (${placeholders})`;
        parametros.push(...idsExcluir);
      }
    }

    instrucaoSql += ' ORDER BY RAND() LIMIT 1';

    // Executa a busca de 1 registro aleatório no banco com os filtros aplicados
    const [linhas] = await pool.query(instrucaoSql, parametros);

    // Se todas já foram sorteadas ou a tabela estiver vazia, retorna HTTP 404
    if (linhas.length === 0) return res.status(404).json({ message: 'Nenhum registro encontrado.' });

    // Retorna os dados da pergunta sorteada
    res.json(linhas[0]);
  } catch (erro) {
    // Retorna erro 500 caso a query falhe
    res.status(500).json({ message: 'Erro interno ao consultar registro.' });
  }
});

// Rota POST /gerar-questoes com IA
app.post('/gerar-questoes', async (req, res) => {
  try {
    // Desestrutura os parâmetros fornecidos no corpo da requisição
    const { tema, promptUsuario, quantidade } = req.body;

    // Define o modelo da IA com fallback para o 'gemini-2.5-flash-lite'
    const modeloEscolhido = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

    // Monta o prompt solicitando um formato JSON estrito para o retorno
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

    // Envia o prompt para a API do Google GenAI solicitando resposta nativa em JSON
    const respostaIa = await ai.models.generateContent({
      model: modeloEscolhido,
      contents: promptInstrucao,
      config: { responseMimeType: 'application/json' }
    });

    // Faz o parse do texto retornado pela IA e responde para o cliente como JSON
    res.json(JSON.parse(respostaIa.text.trim()));
  } catch (erro) {
    // Trata e retorna eventuais falhas durante a chamada à IA
    res.status(500).json({ message: 'Erro ao gerar questões com IA', error: erro.message });
  }
});

// Rota POST /insert (Redimensiona, compacta e salva a imagem e a nova pergunta)
app.post('/insert', upload.single('imagem'), async (req, res) => {
  try {
    // Extrai os campos do formulário enviados na requisição
    const { tema, pergunta, A, B, C, D, correta } = req.body;

    // Define o caminho relativo da imagem (ex: 'src/img/imagem-123456.jpg'),
    // exatamente no mesmo formato padronizado que o endpoint /atualizar utiliza.
    const imagem = req.file ? path.relative(__dirname, req.file.path).replace(/\\/g, '/') : null;

    // Se houve envio de imagem, processa imediatamente para 400x400 / 50%
    if (req.file) {
      await otimizarImagemSalva(req.file.path);
    }

    // Declara o comando SQL parametrizado para inserção segura (evitando SQL Injection)
    const instrucaoSql = `
      INSERT INTO repositorio (tema, pergunta, A, B, C, D, imagem, correta) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Mapeia os valores a serem substituídos nos placeholders '?' da query
    const valoresParametros = [tema, pergunta, A, B, C, D, imagem, correta];

    // Executa a instrução de inserção no banco de dados
    const [resultadoInsercao] = await pool.query(instrucaoSql, valoresParametros);

    // Consulta os dados completos do registro recém-criado utilizando seu ID auto-incrementado
    const [novoRegistro] = await pool.query(
      'SELECT * FROM repositorio WHERE numero = ?',
      [resultadoInsercao.insertId]
    );

    // Retorna HTTP 201 Created junto com o registro inserido
    res.status(201).json({
      message: 'Registro inserido com sucesso!',
      data: novoRegistro[0] || { id: resultadoInsercao.insertId }
    });
  } catch (erro) {
    // Retorna HTTP 500 caso ocorra falha de inserção
    res.status(500).json({ message: 'Erro ao inserir dados no banco de dados', error: erro.message });
  }
});

// Rota GET /temas
app.get('/temas', async (req, res) => {
  try {
    // Busca todos os temas distintos cadastrados no repositório
    const [linhas] = await pool.query('SELECT DISTINCT tema FROM repositorio');

    // Retorna o array de temas para o cliente
    res.json(linhas);
  } catch (erro) {
    // Trata e reporta erros de consulta
    res.status(500).json({ message: 'Erro ao buscar temas' });
  }
});

// Rota GET /registros
app.get('/registros', async (req, res) => {
  try {
    // Extrai os filtros opcionais passados na query string (?tema=...&numero=...)
    const { tema, numero } = req.query;

    // Declara a consulta base padrão
    let instrucaoSql = 'SELECT * FROM repositorio';
    const condicoes = [];
    const parametros = [];

    // Adiciona o filtro de tema, se fornecido
    if (tema) { condicoes.push('tema = ?'); parametros.push(tema); }

    // Adiciona o filtro por ID/número, se fornecido
    if (numero) { condicoes.push('numero = ?'); parametros.push(numero); }

    // Concatena a cláusula WHERE unindo as condições com AND, se houver filtros
    if (condicoes.length > 0) instrucaoSql += ` WHERE ${condicoes.join(' AND ')}`;

    // Executa a busca parametrizada no banco
    const [linhas] = await pool.query(instrucaoSql, parametros);

    // Retorna os registros encontrados
    res.json(linhas);
  } catch (erro) {
    // Trata e reporta erros durante a listagem
    res.status(500).json({ message: 'Erro ao buscar registros' });
  }
});

// Rota PUT /atualizar/:numero (Redimensiona e compacta caso uma nova imagem seja enviada)
app.put('/atualizar/:numero', upload.single('imagem'), async (req, res) => {
  try {
    // Obtém os dados de campos de texto enviados pelo formulário
    const { tema, pergunta, A, B, C, D, correta } = req.body;

    // Define o caminho relativo da nova imagem caso um novo arquivo tenha sido enviado
    const imagem = req.file ? path.relative(__dirname, req.file.path).replace(/\\/g, '/') : null;

    // Se uma nova imagem foi enviada na edição, otimiza para 400x400 / 50%
    if (req.file) {
      await otimizarImagemSalva(req.file.path);
    }

    // Inicia a construção da query de atualização
    let instrucaoSql = `
      UPDATE repositorio
      SET tema = ?, pergunta = ?, A = ?, B = ?, C = ?, D = ?, correta = ?
    `;
    const parametros = [tema, pergunta, A, B, C, D, correta];

    // Se uma nova imagem foi recebida, adiciona o campo 'imagem' à atualização
    if (imagem) {
      instrucaoSql += ', imagem = ?';
      parametros.push(imagem);
    }

    // Restringe o UPDATE exclusivamente ao número recebido nos parâmetros de rota
    instrucaoSql += ' WHERE numero = ?';
    parametros.push(req.params.numero);

    // Executa a atualização no banco de dados
    const [resultado] = await pool.query(instrucaoSql, parametros);

    // Se nenhuma linha foi afetada, indica que o registro alvo não existe
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ message: 'Registro não encontrado para atualização.' });
    }

    // Responde com sucesso
    res.json({ message: 'Registro atualizado com sucesso!' });
  } catch (erro) {
    // Trata e reporta falhas durante a alteração
    res.status(500).json({ message: 'Erro ao atualizar registro', error: erro.message });
  }
});

// Rota GET /backup
app.get('/backup', async (req, res) => {
  try {
    // Obtém o DDL original de criação da tabela 'repositorio' no banco
    const [createTableResult] = await pool.query('SHOW CREATE TABLE repositorio');
    const ddl = createTableResult[0]['Create Table'];

    // Recupera todos os registros atualmente presentes na tabela
    const [registros] = await pool.query('SELECT * FROM repositorio');

    // Constrói o cabeçalho do arquivo de script SQL de backup
    let sqlDump = `-- Backup Torta na Cara\n-- Data: ${new Date().toISOString()}\n\n`;
    sqlDump += `DROP TABLE IF EXISTS \`repositorio\`;\n`;
    sqlDump += `${ddl};\n\n`;

    // Constrói os comandos INSERT caso existam dados
    if (registros.length > 0) {
      sqlDump += `INSERT INTO \`repositorio\` (\`numero\`, \`tema\`, \`pergunta\`, \`A\`, \`B\`, \`C\`, \`D\`, \`imagem\`, \`correta\`) VALUES\n`;
      // Mapeia e escapa caracteres especiais e aspas simples para evitar falha de sintaxe SQL
      const linhasSql = registros.map((r) => {
        const esc = (v) => (v === null ? 'NULL' : `'${String(v).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`);
        return `(${r.numero}, ${esc(r.tema)}, ${esc(r.pergunta)}, ${esc(r.A)}, ${esc(r.B)}, ${esc(r.C)}, ${esc(r.D)}, ${esc(r.imagem)}, ${esc(r.correta)})`;
      });
      // Une todas as linhas de registros em formato SQL
      sqlDump += linhasSql.join(',\n') + ';\n';
    }

    // Define o nome dinâmico para o download do arquivo ZIP gerado
    const nomeArquivoZip = `backup-torta-na-cara-${Date.now()}.zip`;

    // Configura os cabeçalhos HTTP para indicar envio de anexo ZIP para download no navegador
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivoZip}"`);

    // Cria a instância do empacotador ZIP com nível 9 (máxima compressão)
    const arquivoZip = archiver('zip', { zlib: { level: 9 } });

    // Escuta erros que possam ocorrer durante o processo de compressão
    arquivoZip.on('error', (err) => {
      console.error('Erro no archiver:', err);
      if (!res.headersSent) res.status(500).json({ error: 'Erro ao gerar zip.' });
    });

    // Conecta a saída do arquivo ZIP diretamente no stream de resposta HTTP do cliente
    arquivoZip.pipe(res);

    // Insere o arquivo SQL gerado dentro do arquivo ZIP
    arquivoZip.append(sqlDump, { name: 'banco_dados_repositorio.sql' });

    // Se o diretório de imagens existir, empacota todas as fotos na subpasta 'img' dentro do ZIP
    if (fs.existsSync(diretorioUpload)) {
      arquivoZip.directory(diretorioUpload, 'img');
    }

    // Finaliza o empacotamento e fecha o stream de envio
    await arquivoZip.finalize();
  } catch (erro) {
    // Trata eventuais erros no fluxo do backup
    console.error('Erro na rota de backup:', erro);
    if (!res.headersSent) res.status(500).json({ error: 'Falha no backup: ' + erro.message });
  }
});

// Rota POST /restaurar
app.post('/restaurar', uploadZip.single('backupZip'), async (req, res) => {
  // Valida se o arquivo zip foi anexado na requisição
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo zip enviado.' });
  }

  // Caminho do arquivo zip recebido temporariamente
  const caminhoZipEnviado = req.file.path;

  // Caminho da pasta transitória onde o arquivo será descompactado
  const pastaExtracao = path.join(diretorioTmp, `restore-${Date.now()}`);

  try {
    // Abre a leitura do arquivo compactado
    const zipAberto = await unzipper.Open.file(caminhoZipEnviado);

    // Extrai todo o conteúdo do zip para o diretório de extração
    await zipAberto.extract({ path: pastaExtracao });

    // Monta o caminho esperado para o script SQL extraído
    const caminhoSql = path.join(pastaExtracao, 'banco_dados_repositorio.sql');

    // Se o arquivo SQL existir, executa o script no MySQL
    if (fs.existsSync(caminhoSql)) {
      const conteudoSql = await fs.promises.readFile(caminhoSql, 'utf-8');
      if (conteudoSql.trim()) {
        await pool.query(conteudoSql);
      }
    } else {
      // Dispara erro caso o dump SQL não esteja presente no pacote
      throw new Error('Arquivo banco_dados_repositorio.sql não encontrado no zip.');
    }

    // Monta o caminho da subpasta 'img' contendo as fotos restauradas
    const pastaImgExtraida = path.join(pastaExtracao, 'img');

    // Se a pasta de imagens existir no backup, move os arquivos de volta para o diretório oficial
    if (fs.existsSync(pastaImgExtraida)) {
      const arquivosFotos = await fs.promises.readdir(pastaImgExtraida);
      // Itera por cada imagem copiada copiando-a para a pasta definitiva de uploads
      for (const foto of arquivosFotos) {
        const origem = path.join(pastaImgExtraida, foto);
        const destino = path.join(diretorioUpload, foto);
        await fs.promises.copyFile(origem, destino);
      }
    }

    // Retorna mensagem de confirmação de restauração completa
    res.json({ message: 'Backup restaurado com sucesso! Dados e imagens recuperados.' });
  } catch (erro) {
    // Registra falhas ocorridas durante a descompactação ou restauração
    console.error('Erro na restauração:', erro);
    res.status(500).json({ message: 'Falha ao restaurar backup: ' + erro.message });
  } finally {
    // Bloco de limpeza: remove com segurança o arquivo zip enviado e a pasta temporária de extração
    try {
      if (fs.existsSync(caminhoZipEnviado)) await fs.promises.unlink(caminhoZipEnviado);
      if (fs.existsSync(pastaExtracao)) await fs.promises.rm(pastaExtracao, { recursive: true, force: true });
    } catch (e) {
      console.warn('Erro ao limpar pasta temporária:', e.message);
    }
  }
});

// ========================================================
// ROTAS DE AJUSTES E GESTÃO DA BASE DE DADOS
// ========================================================

// Lista de temas protegidos/oficiais que NÃO devem ser alterados ou removidos
const TEMAS_FIXOS_PADRAO = [
  'Paulo Freire', 'Paula Souza', 'ETEC', 'Administração', 'Automação',
  'Informática', 'Desenvolvimento de Sistemas', 'Redes de Computadores',
  'Logística', 'Eletroeletrônica', 'Contabilidade', 'Comércio Exterior',
  'Turismo e Hotelaria', 'Recursos Humanos', 'Cibersegurança', 'Geografia',
  'História', 'Língua Portuguesa', 'Língua Estrangeira', 'Artes',
  'Educação Física', 'Matemática', 'Geometria', 'Astronomia', 'Curiosidades',
  'Animes', 'Cinemas', 'Música', 'Lógica', 'Cultura Pop', 'Animação',
  'Química', 'Biologia', 'Física', 'Literatura'
];

// Rota POST /ajustes/analisar-temas: A IA analisa os temas fora do padrão e sugere fusões/padronizações
app.post('/ajustes/analisar-temas', async (req, res) => {
  try {
    // Busca a contagem real de ocorrências de cada tema cadastrado
    const [temasBanco] = await pool.query(`
      SELECT tema, COUNT(*) AS total 
      FROM repositorio 
      GROUP BY tema 
      ORDER BY total DESC
    `);

    const modeloEscolhido = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

    const promptAnalise = `
Você é um especialista em curadoria de conteúdo pedagógico e banco de dados para quiz escolar.
Analise a lista de temas atualmente cadastrados no banco e sua respectiva quantidade de questões:
${JSON.stringify(temasBanco, null, 2)}

LISTA DE TEMAS OFICIAIS QUE NÃO DEVEM MUDAR:
${JSON.stringify(TEMAS_FIXOS_PADRAO, null, 2)}

DIRETRIZES:
1. Temas que já estão idênticos aos oficiais NÃO devem sofrer alteração (ou devem ser mapeados para eles mesmos).
2. Temas com pequenas variações, erros de digitação, sinônimos ou muito específicos devem ser remapeados para o tema oficial mais adequado (Exemplo: "Cinema" -> "Cinemas", "Português" -> "Língua Portuguesa", "TI" -> "Informática").
3. O objetivo é consolidar a base, reduzir o excesso de temas dispersos e aumentar a densidade das perguntas nos temas oficiais.

Retorne EXCLUSIVAMENTE um array em formato JSON puro (sem markdown, sem aspas triplas de código), contendo apenas os temas que DEVEM ser alterados/padronizados, no seguinte formato:
[
  {
    "temaAntigo": "Nome Atual no Banco",
    "temaProposto": "Nome Oficial Padronizado",
    "justificativa": "Motivo da sugestão"
  }
]
`;

    const respostaIa = await ai.models.generateContent({
      model: modeloEscolhido,
      contents: promptAnalise,
      config: { responseMimeType: 'application/json' }
    });

    const sugestoes = JSON.parse(respostaIa.text.trim());

    // Cruza as sugestões com a quantidade real de registros afetados
    const mapaContagem = new Map(temasBanco.map(t => [t.tema, t.total]));
    const analiseComTotais = sugestoes.map(item => ({
      ...item,
      totalRegistros: mapaContagem.get(item.temaAntigo) || 0
    }));

    res.json({
      temasCadastrados: temasBanco,
      temasOficiais: TEMAS_FIXOS_PADRAO,
      sugestoes: analiseComTotais
    });
  } catch (erro) {
    console.error('Erro ao analisar temas com IA:', erro);
    res.status(500).json({ message: 'Erro ao analisar temas.', error: erro.message });
  }
});

// Rota POST /ajustes/aplicar-temas: Atualiza em lote ou questão por questão no MySQL
app.post('/ajustes/aplicar-temas', async (req, res) => {
  try {
    const { alteracoes } = req.body; // Array de { temaAntigo, temaProposto }
    if (!Array.isArray(alteracoes) || alteracoes.length === 0) {
      return res.status(400).json({ message: 'Nenhuma alteração informada.' });
    }

    let totalLinhasAfetadas = 0;
    for (const item of alteracoes) {
      const [resultado] = await pool.query(
        'UPDATE repositorio SET tema = ? WHERE tema = ?',
        [item.temaProposto, item.temaAntigo]
      );
      totalLinhasAfetadas += resultado.affectedRows;
    }

    // Retorna a contagem atualizada de temas distintos restantes
    const [temasAtualizados] = await pool.query('SELECT DISTINCT tema FROM repositorio');

    res.json({
      message: 'Temas atualizados com sucesso!',
      linhasAfetadas: totalLinhasAfetadas,
      totalTemasRestantes: temasAtualizados.length
    });
  } catch (erro) {
    console.error('Erro ao aplicar novos temas:', erro);
    res.status(500).json({ message: 'Erro ao atualizar temas.', error: erro.message });
  }
});

// Rota POST /ajustes/otimizar-imagens: Executa a varredura e compressão Sharp 400x400 diretamente pelo painel
app.post('/ajustes/otimizar-imagens', async (req, res) => {
  try {
    if (!fs.existsSync(diretorioUpload)) {
      return res.status(404).json({ message: 'Pasta de imagens não encontrada.' });
    }

    const arquivos = await fs.promises.readdir(diretorioUpload);
    let processadas = 0;
    let falhas = 0;

    for (const arquivo of arquivos) {
      const caminhoCompleto = path.join(diretorioUpload, arquivo);
      const extensao = path.extname(arquivo).toLowerCase();

      if (!['.jpg', '.jpeg', '.png', '.webp'].includes(extensao)) continue;

      try {
        const bufferOriginal = await fs.promises.readFile(caminhoCompleto);
        let pipeline = sharp(bufferOriginal).resize(400, 400, {
          fit: 'cover',
          position: 'center'
        });

        if (extensao === '.jpg' || extensao === '.jpeg') {
          pipeline = pipeline.jpeg({ quality: 50, mozjpeg: true });
        } else if (extensao === '.webp') {
          pipeline = pipeline.webp({ quality: 65 });
        } else if (extensao === '.png') {
          pipeline = pipeline.png({ compressionLevel: 8 });
        }

        const bufferFinal = await pipeline.toBuffer();
        await fs.promises.writeFile(caminhoCompleto, bufferFinal);
        processadas++;
      } catch (err) {
        falhas++;
      }
    }

    res.json({
      message: 'Otimização concluída!',
      totalProcessadas: processadas,
      totalFalhas: falhas
    });
  } catch (erro) {
    console.error('Erro ao otimizar imagens:', erro);
    res.status(500).json({ message: 'Falha ao otimizar imagens.', error: erro.message });
  }
});

// ========================================================
// ROTA: AUDITORIA E REVISÃO DE QUESTÕES COM IA
// ========================================================

// Rota POST /ajustes/auditar-questoes: Analisa coerência, ortografia, gabarito, falta de contexto/origem e falta de imagem
app.post('/ajustes/auditar-questoes', async (req, res) => {
  try {
    // Busca todas as questões cadastradas na base
    const [questoes] = await pool.query('SELECT * FROM repositorio ORDER BY numero ASC');

    if (questoes.length === 0) {
      return res.status(404).json({ message: 'Nenhuma questão cadastrada para analisar.' });
    }

    // Identifica previamente as questões sem imagem ou com valor nulo/vazio
    const questoesSemImagem = questoes
      .filter((q) => !q.imagem || q.imagem.trim() === '')
      .map((q) => ({
        numero: q.numero,
        tema: q.tema,
        pergunta: q.pergunta
      }));

    const modeloEscolhido = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

    // Monta o prompt pedagógico solicitando análise crítica e sugestão de correção
    const promptAuditoria = `
Você é um revisor pedagógico e especialista em bancas de quiz/concursos.
Analise a lista de questões abaixo e avalie:
1. Coerência lógica e clareza do enunciado.
2. Correção gramatical e ortográfica.
3. Precisão da alternativa indicada como correta ("correta"). Se a alternativa indicada estiver errada ou ambígua, aponte.
4. Falta de contextualização ou declaração de origem: perguntas sobre obras, filmes, livros, animes, personalidades ou fatos históricos onde falta citar a qual universo/origem pertencem (Ex.: uma pergunta sobre um personagem de anime que não cita de qual anime ele é).

LISTA DE QUESTÕES:
${JSON.stringify(
  questoes.map((q) => ({
    numero: q.numero,
    tema: q.tema,
    pergunta: q.pergunta,
    A: q.A,
    B: q.B,
    C: q.C,
    D: q.D,
    correta: q.correta
  })),
  null,
  2
)}

Retorne EXCLUSIVAMENTE um array em formato JSON puro (sem markdown, sem aspas triplas de código), listando APENAS as questões que apresentarem algum problema, no seguinte formato:
[
  {
    "numero": 12,
    "problemas": [
      "Falta declarar a origem da obra/anime citada no enunciado",
      "Gabarito incorreto: a alternativa correta real é a C e não a B"
    ],
    "possivelCorrigirAutomaticamente": true,
    "sugestao": {
      "tema": "Tema sugerido ou mantido",
      "pergunta": "Enunciado reescrito com clareza, ortografia corrigida e origem informada",
      "A": "Alternativa A revisada",
      "B": "Alternativa B revisada",
      "C": "Alternativa C revisada",
      "D": "Alternativa D revisada",
      "correta": "A"
    },
    "alertaManual": null
  },
  {
    "numero": 34,
    "problemas": ["Enunciado ininteligível ou sem dados suficientes para formular resposta"],
    "possivelCorrigirAutomaticamente": false,
    "sugestao": null,
    "alertaManual": "Necessita revisão manual urgente pelo professor (dados insuficientes)."
  }
]
`;

    const respostaIa = await ai.models.generateContent({
      model: modeloEscolhido,
      contents: promptAuditoria,
      config: { responseMimeType: 'application/json' }
    });

    const questoesComProblemas = JSON.parse(respostaIa.text.trim());

    res.json({
      totalQuestoes: questoes.length,
      questoesSemImagem,
      questoesComProblemas
    });
  } catch (erro) {
    console.error('Erro na auditoria de questões:', erro);
    res.status(500).json({ message: 'Erro ao auditar questões com IA.', error: erro.message });
  }
});

// Rota POST /ajustes/aplicar-correcao-questao: Atualiza diretamente os campos da questão corrigida pela IA
app.post('/ajustes/aplicar-correcao-questao', async (req, res) => {
  try {
    const { numero, tema, pergunta, A, B, C, D, correta } = req.body;

    if (!numero || !pergunta) {
      return res.status(400).json({ message: 'Dados incompletos para atualização da questão.' });
    }

    const [resultado] = await pool.query(
      `UPDATE repositorio 
       SET tema = ?, pergunta = ?, A = ?, B = ?, C = ?, D = ?, correta = ? 
       WHERE numero = ?`,
      [tema, pergunta, A, B, C, D, correta, numero]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ message: `Questão Nº ${numero} não encontrada.` });
    }

    res.json({ message: `Questão Nº ${numero} corrigida com sucesso!` });
  } catch (erro) {
    console.error('Erro ao salvar correção da questão:', erro);
    res.status(500).json({ message: 'Erro ao atualizar questão.', error: erro.message });
  }
});

// ========================================================
// ROTAS EXCLUSIVAS PARA GESTÃO DE QUESTÕES SEM FOTO
// ========================================================

// Rota GET /ajustes/questoes-sem-foto: Retorna apenas perguntas onde o campo imagem é nulo, vazio ou sem arquivo
app.get('/ajustes/questoes-sem-foto', async (req, res) => {
  try {
    // Busca registros onde a imagem é nula ou string vazia
    const [linhas] = await pool.query(`
      SELECT numero, tema, pergunta, A, B, C, D, correta, imagem 
      FROM repositorio 
      WHERE imagem IS NULL OR TRIM(imagem) = ''
      ORDER BY numero ASC
    `);

    // Retorna a lista de questões pendentes
    res.json(linhas);
  } catch (erro) {
    console.error('Erro ao buscar questões sem foto:', erro);
    res.status(500).json({ message: 'Erro ao consultar questões sem foto.' });
  }
});

// Rota POST /ajustes/vincular-foto/:numero: Recebe e otimiza a imagem para a questão específica
app.post('/ajustes/vincular-foto/:numero', upload.single('imagem'), async (req, res) => {
  try {
    const { numero } = req.params;

    // Valida se o arquivo de foto foi anexado
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma foto foi selecionada.' });
    }

    // Otimiza e redimensiona para 400x400 / 50%
    await otimizarImagemSalva(req.file.path);

    // Formata o caminho relativo padronizado para o banco (src/img/...)
    const caminhoImagem = path.relative(__dirname, req.file.path).replace(/\\/g, '/');

    // Atualiza o registro no banco de dados MySQL
    const [resultado] = await pool.query(
      'UPDATE repositorio SET imagem = ? WHERE numero = ?',
      [caminhoImagem, numero]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ message: `Questão Nº ${numero} não foi encontrada.` });
    }

    res.json({
      message: `Foto vinculada com sucesso à Questão Nº ${numero}!`,
      imagem: caminhoImagem
    });
  } catch (erro) {
    console.error('Erro ao vincular foto à questão:', erro);
    res.status(500).json({ message: 'Erro ao salvar foto da questão.', error: erro.message });
  }
});

// Fallback SPA React: redireciona qualquer rota não tratada pela API para o 'index.html' do client
app.get('*', (req, res) => {
  const indexHtml = path.join(pastaBuildReact, 'index.html');
  if (fs.existsSync(indexHtml)) res.sendFile(indexHtml);
  else res.status(404).send('Build do React não encontrado.');
});

// Middleware global para captura e padronização de erros das requisições Express
app.use((erro, req, res, next) => {
  res.status(400).json({ error: erro.message });
});

// Define a porta do servidor a partir do ambiente ou recorre ao fallback 3042
const PORT = process.env.PORT || 3042;

// Inicia o listener HTTP do servidor na porta definida
app.listen(PORT, () => {
  console.log(`🚀 [Servidor] Rodando na porta ${PORT}`);
});