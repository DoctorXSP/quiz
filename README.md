# 🧠 Quiz de Assuntos Gerais - Semana Paulo Freire

Aplicação web full stack desenvolvida especialmente para dinâmicas e gincanas da **Semana Paulo Freire**, reunindo perguntas de conhecimentos gerais, tecnologia, cultura pop, ciências e muito mais.

🔗 **Demonstração online:** [https://quiz.emersonsilv.win/](https://quiz.emersonsilv.win/)[cite: 2]

---

## 🚀 Funcionalidades

### 📱 Experiência Responsiva
* Layout adaptável com suporte completo a smartphones, tablets, notebooks e projeções em telão.
* Redimensionamento automático de imagens e tipografia fluida para telas menores.
* Alternativas reposicionadas e ampliadas para facilitar o toque em dispositivos móveis.

### 🎮 Dinâmica do Jogo
* **Sorteio Inteligente:** perguntas aleatórias com sistema anti-repetição para evitar duplicidades na mesma rodada.
* **Embaralhamento Dinâmico:** alternativas alternadas a cada questão mantendo o gabarito sincronizado.
* **Temporizador Regressivo:** cronômetro regressivo com sinalização sonora nos segundos finais[cite: 1, 2].
* **Feedback Imediato:** alertas visuais e sonoros para acertos, erros e estouro de tempo limite[cite: 1, 2].

### 🛠️ Painel Administrativo e Gestão
* **Otimização de Imagens:** compactação e redimensionamento no upload para ganho de desempenho e economia de largura de banda.
* **Rotina de Backup:** recursos para exportação, backup de segurança e restauração do banco de dados e arquivos.
* **Gerador com IA (Google Gemini API):** criação e curadoria automatizada de questões contextualizadas prontas para inclusão na base.
* **CRUD Completo:** cadastro manual, listagem, edição e exclusão de questões.

---

## 🛠️ Tecnologias Utilizadas

### Backend (`Node.js`)
* **`@google/genai`**: Integração com a API do Google Gemini para curadoria com IA.
* **`mysql2`**: Conexão e execução de consultas assíncronas no MySQL/MariaDB.
* **`cors`**: Middleware para configuração de políticas Cross-Origin Resource Sharing.
* **`dotenv`**: Carregamento seguro de configurações via arquivos `.env`.
* **`path`**: Tratamento e resolução de diretórios de arquivos no servidor.

### Frontend (`React`)
* **`react` & `react-dom`**: Renderização reativa e gerenciamento de estado.
* **`react-router-dom`**: Roteamento entre a arena do quiz e o painel administrativo.
* **`axios`**: Comunicação assíncrona HTTP com as rotas da API[cite: 2].
* **`bootstrap` & `react-bootstrap`**: Componentes e grid responsivo[cite: 2].
* **`@fortawesome/react-fontawesome`**: Ícones visuais para controles e sinalizações[cite: 2].
* **`react-audio-player`**: Efeitos sonoros sincronizados para a dinâmica do jogo[cite: 2].

---

## 🗄️ Estrutura do Banco de Dados

Crie a base de dados no MySQL/MariaDB[cite: 2]:

```sql
CREATE DATABASE IF NOT EXISTS bdquiz CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE bdquiz;
