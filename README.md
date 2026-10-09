🧠 Quiz de Assuntos Gerais - Semana Paulo FreireAplicação web full stack desenvolvida especialmente para dinâmicas e gincanas da Semana Paulo Freire, reunindo perguntas de conhecimentos gerais, tecnologia, cultura pop, ciências e muito mais.   🔗 Demonstração online: https://quiz.emersonsilv.win/   🚀 FuncionalidadesInterface 100% Responsiva:Layout adaptável para smartphones, tablets, notebooks e projeções em telões de eventos.Reorganização dinâmica do fluxo de tela (ajuste inteligente de imagens, fontes escaláveis e botões otimizados para toque no mobile).Tela Principal Interativa:Exibição de perguntas aleatórias com sistema anti-repetição para evitar duplicações na mesma rodada.   Embaralhamento dinâmico de alternativas a cada questão.   Temporizador regressivo para dinamizar as respostas.   Efeitos visuais animados e feedback imediato de acertos e erros com efeitos sonoros.   Painel Administrativo & Gestão de Dados:Inclusão manual, edição, revisão e exclusão de questões cadastradas.   Otimização de Imagens: processamento e compressão automática no upload para carregamento instantâneo e menor consumo de banda.Sistema de Backup Integrado: exportação e recuperação segura da base de dados e dos uploads para garantir a integridade das perguntas da gincana.Gerador de Questões com IA (Google Gemini API): sugestão automática de perguntas contextualizadas e prontas para inserção no banco de dados.   🛠️ Tecnologias e BibliotecasBackend (Node.js)@google/genai: Integração com a API do Google Gemini para curadoria e geração automatizada de perguntas via IA.   mysql2: Conexão e execução de queries assíncronas no banco MySQL/MariaDB.   cors: Configuração e controle de requisições Cross-Origin Resource Sharing.   dotenv: Gerenciamento de variáveis de ambiente via arquivo .env.   path: Resolução e manipulação segura de diretórios do sistema.   Frontend (React)react & react-dom: Construção da interface com componentes reativos.   react-router-dom: Gerenciamento de rotas e navegação entre o jogo e a administração.   axios: Consumo das rotas HTTP do backend.   bootstrap & react-bootstrap: Componentes e grid responsivo com suporte multi-dispositivo.   @fortawesome/react-fontawesome: Ícones visuais em botões e alertas.   react-audio-player: Disparo dos efeitos sonoros de acerto, erro e contagem.   🗄️ Estrutura do Banco de DadosCrie a base de dados bdquiz no seu servidor MySQL/MariaDB:   SQLCREATE DATABASE IF NOT EXISTS bdquiz CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE bdquiz;
   Execute a criação da tabela repositorio:   SQLCREATE TABLE `repositorio` (
  `numero` int(11) NOT NULL AUTO_INCREMENT,
  `tema` varchar(255) NOT NULL,
  `pergunta` varchar(600) NOT NULL,
  `A` varchar(255) NOT NULL,
  `B` varchar(255) NOT NULL,
  `C` varchar(255) NOT NULL,
  `D` varchar(255) NOT NULL,
  `correta` enum('A','B','C','D') NOT NULL,
  `imagem` varchar(255) DEFAULT NULL,
  `dataCadastro` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`numero`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
   ⚙️ Configuração do Ambiente (.env)No diretório raiz da pasta do backend, crie um arquivo .env baseado no modelo:   Snippet de código# Configurações do Banco de Dados
DB_HOST=127.0.0.1
DB_USER=seu_usuario_aqui
DB_PASSWORD=sua_senha_aqui
DB_NAME=bdquiz
DB_PORT=3306

# Configurações do Servidor
PORT=3042

# Whitelist CORS (portas do React ou domínio em produção)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://quiz.emersonsilv.win

# Chave de API do Google Gemini
GEMINI_API_KEY=SUA_CHAVE_AQUI
GEMINI_MODEL=gemini-3.5-flash-lite
   Nota: Mantenha o arquivo .env devidamente listado no seu .gitignore para segurança das chaves e senhas.   📦 Instalação e Execução1. Clonar o repositórioBashgit clone https://github.com/DoctorXSP/quiz.git
cd quiz
   2. Configurar o BackendEntre na pasta do backend, instale os pacotes e inicie o serviço:   Bashcd backend
npm install
npm start
   O servidor subirá por padrão na porta definida nas variáveis de ambiente (ex.: http://localhost:3042).   3. Configurar o FrontendEm um novo terminal, acerte as dependências do client React e execute:   Bashcd frontend
npm install
npm start
   Abra http://localhost:3000 no navegador para iniciar o jogo.   📄 LicençaDistribuído sob a licença ISC. 
