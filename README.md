Aqui está uma proposta completa e estruturada de **`README.md`** para o seu repositório:

---

# 🧠 Quiz de Assuntos Gerais - Semana Paulo Freire

Aplicação web full stack desenvolvida especialmente para dinâmicas e gincanas da **Semana Paulo Freire**, reunindo perguntas de conhecimentos gerais, tecnologia, cultura pop, ciências e muito mais.

🔗 **Demonstração online:** [https://quiz.emersonsilv.win/](https://quiz.emersonsilv.win/)

---

## 🚀 Funcionalidades

* **Tela Principal Interativa:**
* Exibição de perguntas aleatórias com **sistema anti-repetição** para evitar duplicações na mesma rodada.
* **Embaralhamento dinâmico de alternativas** a cada questão.
* **Temporizador regressivo** para dinamizar as respostas.
* Efeitos visuais animados e feedback imediato de acertos e erros.


* **Painel Administrativo:**
* Inclusão manual de novas questões com suporte a temas, alternativas e envio de imagens.
* Área para edição, revisão e exclusão de questões cadastradas.
* **Gerador de Questões com Inteligência Artificial (Google Gemini API):** permite sugerir automaticamente perguntas contextualizadas e formatadas para o banco de dados.





---

## 🛠️ Tecnologias e Bibliotecas

### Backend (`Node.js`)

* **`@google/genai`**: Integração com a API do Google Gemini para geração e curadoria automática de perguntas com IA.


* **`mysql2`**: Driver cliente para conexão e execução de queries assíncronas no banco de dados MySQL/MariaDB.
* **`cors`**: Middleware para configuração e controle de requisições Cross-Origin Resource Sharing.


* **`dotenv`**: Carregamento e gerenciamento de variáveis de ambiente a partir de arquivos `.env`.


* **`path`**: Módulo utilitário para resolução e manipulação de diretórios do sistema de arquivos.

### Frontend (`React`)

* **`react` & `react-dom**`: Construção da interface com componentes reativos.


* **`react-router-dom`**: Gerenciamento de rotas e navegação entre a tela do jogo e o painel de administração.


* **`axios`**: Cliente HTTP para comunicação e consumo das rotas do backend.


* **`bootstrap` & `react-bootstrap**`: Componentes e grid responsivo para estilização rápida.


* **`@fortawesome/react-fontawesome`**: Ícones visuais em botões e avisos de status.


* **`react-audio-player`**: Efeitos sonoros para respostas e contagem do cronômetro.



---

## 🗄️ Estrutura do Banco de Dados

Crie o banco de dados `bdquiz` no seu servidor MySQL/MariaDB:

```sql
CREATE DATABASE IF NOT EXISTS bdquiz CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE bdquiz;

```

Execute o script de criação da tabela `repositorio`:

```sql
CREATE TABLE `repositorio` (
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

```

---

## ⚙️️ Configuração do Ambiente (.env)

No diretório raiz da pasta do **backend**, crie um arquivo `.env` preenchendo conforme o modelo:

```env
# Configurações do Banco de Dados
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

```

> *Nota: Lembre-se de adicionar o arquivo `.env` ao seu `.gitignore` para não expor suas credenciais.*

---

## 📦 Instalação e Execução

### 1. Clonar o repositório

```bash
git clone https://github.com/DoctorXSP/quiz.git
cd quiz

```

---

### 2. Configurar o Backend

Acesse a pasta do backend, instale as dependências e inicie o serviço:

```bash
cd backend
npm install

```

> **Dependências instaladas pelo comando:**
> ```bash
> npm install @google/genai cors dotenv mysql2 path
> 
> ```
> 
> 

Inicie o servidor backend:

```bash
npm start

```

*O servidor iniciará por padrão na porta definida no `.env` (ex.: `http://localhost:3042`).*

---

### 3. Configurar o Frontend

Em um novo terminal, entre na pasta do frontend:

```bash
cd frontend
npm install

```

> **Dependências instaladas pelo comando:**
> ```bash
> npm install @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome axios bootstrap react-bootstrap react-audio-player react-router-dom
> 
> ```
> 
> 

Inicie a aplicação React:

```bash
npm start

```

*Acesse `http://localhost:3000` no seu navegador para utilizar o quiz.*

---

## 📄 Licença

Distribuído sob a licença **ISC**.