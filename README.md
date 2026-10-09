# 🧠 Quiz de Assuntos Gerais - Semana Paulo Freire

Aplicação web full stack desenvolvida para gincanas e atividades pedagógicas da **Semana Paulo Freire**, reunindo perguntas de conhecimentos gerais, tecnologia, cultura pop, história e ciências.

🔗 **Demonstração online:** [https://quiz.emersonsilv.win/](https://quiz.emersonsilv.win/)[cite: 2]

---

## 🚀 Funcionalidades

### 📱 Interface 100% Responsiva
* Layout adaptativo para smartphones, tablets, notebooks e projeções em telão.
* Redimensionamento automático de imagens e fontes fluídas.
* Alternativas reposicionadas para facilitar o toque em telas móveis.

### 🎮 Dinâmica do Jogo
* **Sorteio Inteligente:** perguntas aleatórias com sistema anti-repetição para evitar duplicidades na mesma rodada.
* **Embaralhamento Dinâmico:** alternativas alternadas a cada questão mantendo o gabarito sincronizado.
* **Temporizador Regressivo:** cronômetro regressivo com sinalização sonora nos segundos finais[cite: 1, 2].
* **Feedback Imediato:** alertas visuais e sonoros para acertos, erros e tempo esgotado[cite: 1, 2].

### 🛠️ Gestão e Administração
* **Otimização de Imagens:** compactação e redimensionamento automático de uploads para economia de banda e carregamento rápido.
* **Rotina de Backup:** exportação e backup de segurança do banco de dados e arquivos estáticos.
* **Gerador com IA (Google Gemini API):** criação e curadoria automatizada de questões contextualizadas prontas para inclusão na base.
* **CRUD Completo:** cadastro manual, listagem, edição e exclusão de questões.

---

## 🛠️ Tecnologias Utilizadas

### Backend (`Node.js`)
* **`@google/genai`**: Integração com a API do Google Gemini para curadoria com IA.
* **`mysql2`**: Conexão e execução de consultas assíncronas no MySQL/MariaDB.
* **`cors`**: Middleware para configuração de políticas Cross-Origin Resource Sharing.
* **`dotenv`**: Carregamento seguro de variáveis de ambiente via arquivo `.env`.
* **`path`**: Tratamento e resolução de diretórios de arquivos no servidor[cite: 2].

### Frontend (`React`)
* **`react` & `react-dom`**: Renderização reativa e gerenciamento de estado[cite: 2].
* **`react-router-dom`**: Roteamento entre a arena do quiz e o painel administrativo[cite: 2].
* **`axios`**: Comunicação assíncrona HTTP com as rotas da API[cite: 2].
* **`bootstrap` & `react-bootstrap`**: Componentes e grid responsivo[cite: 2].
* **`@fortawesome/react-fontawesome`**: Ícones visuais para controles e sinalizações[cite: 2].
* **`react-audio-player`**: Efeitos sonoros sincronizados para a dinâmica do jogo[cite: 2].

---

## 🗄️ Estrutura do Banco de Dados

Acesse seu terminal MySQL ou phpMyAdmin e execute os comandos abaixo[cite: 2]:

```sql
-- 1. Criação da base de dados
CREATE DATABASE IF NOT EXISTS bdquiz CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE bdquiz;

-- 2. Criação da tabela principal de perguntas
CREATE TABLE IF NOT EXISTS `repositorio` (
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
[cite: 2]

⚙️ Configuração do Ambiente (.env)
O backend necessita de um arquivo .env na raiz da pasta backend para se conectar ao banco de dados e à API da IA[cite: 2].

Modelo do arquivo .env
Snippet de código
# Banco de Dados MySQL
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=bdquiz
DB_PORT=3306

# Porta do Servidor Backend
PORT=3042

# CORS Whitelist (endereços autorizados a consumir a API)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,[https://quiz.emersonsilv.win](https://quiz.emersonsilv.win)

# Google Gemini API
GEMINI_API_KEY=SUA_CHAVE_AQUI
GEMINI_MODEL=gemini-3.5-flash-lite
[cite: 2]

Como criar o arquivo .env via terminal
No Windows (PowerShell / CMD / Cmder):
Bash
# Entre na pasta do backend
cd backend

# Criar o arquivo vazio
type nul > .env
No Linux / macOS:
Bash
# Entre na pasta do backend
cd backend

# Criar o arquivo vazio
touch .env
⚠️ Aviso de Segurança: Nunca envie o arquivo .env para repositórios públicos[cite: 2]. Verifique se o arquivo .gitignore contém a linha .env.

📦 Instalação e Execução
1. Clonar o Repositório
Bash
git clone [https://github.com/DoctorXSP/quiz.git](https://github.com/DoctorXSP/quiz.git)
cd quiz
[cite: 2]

2. Configurar e Iniciar o Backend
Bash
# Entrar no diretório do backend
cd backend

# Criar pasta para armazenamento de uploads (caso não exista)
mkdir uploads

# Instalar dependências
npm install

# Iniciar o servidor
npm start
[cite: 2]

O servidor backend estará ativo por padrão em http://localhost:3042[cite: 2].

3. Configurar e Iniciar o Frontend
Em uma nova janela de terminal (a partir da raiz do projeto quiz):

Bash
# Entrar no diretório do frontend
cd frontend

# Instalar dependências
npm install

# Iniciar aplicação React
npm start
[cite: 2]

Acesse a interface no navegador em http://localhost:3000[cite: 2].