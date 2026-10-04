// Importa o arquivo de folhas de estilo CSS da aplicação
import estilos from './interface.css';

// Importa os hooks useState e React da biblioteca React para manipulação de estado
import React, { useState } from 'react';

// Importa a biblioteca Axios para realizar chamadas HTTP ao servidor
import axios from 'axios';

// Importa os componentes Form, Button e Alert da biblioteca React-Bootstrap
import { Form, Button, Alert } from 'react-bootstrap';

// Importa a imagem estática da torta usada no cabeçalho
import imagemTorta from './img/torta.webp';

// Importa a imagem GIF de Paulo Freire usada no cabeçalho
import imagemPaulo from './img/pauloFreire.gif';

// Componente principal Inserir
const Inserir = () => {
  // Estado para armazenar o valor digitado no campo de usuário do formulário de login
  const [usuario, setUsuario] = useState('');

  // Estado para armazenar a senha digitada no formulário de login
  const [senha, setSenha] = useState('');

  // Estado booleano que indica se o usuário autenticou com sucesso (inicialmente falso)
  const [autenticado, setAutenticado] = useState(false);

  // Estado para exibir mensagem de erro na tela de login
  const [mensagemErroLogin, setMensagemErroLogin] = useState('');

  // Estado para armazenar o tema da questão no cadastro
  const [tema, setTema] = useState('');

  // Estado para armazenar o texto da pergunta
  const [pergunta, setPergunta] = useState('');

  // Estado para armazenar o texto da opção A
  const [opcaoA, setOpcaoA] = useState('');

  // Estado para armazenar o texto da opção B
  const [opcaoB, setOpcaoB] = useState('');

  // Estado para armazenar o texto da opção C
  const [opcaoC, setOpcaoC] = useState('');

  // Estado para armazenar o texto da opção D
  const [opcaoD, setOpcaoD] = useState('');

  // Estado para armazenar o arquivo binário da imagem selecionada
  const [arquivoImagem, setArquivoImagem] = useState(null);

  // Estado para armazenar qual alternativa é a correta (A, B, C ou D)
  const [alternativaCorreta, setAlternativaCorreta] = useState('');

  // Estado para armazenar mensagem de feedback para o usuário (sucesso ou erro no cadastro)
  const [mensagemFeedback, setMensagemFeedback] = useState('');

  // Estado para armazenar a URL de pré-visualização da imagem enviada
  const [urlPreviaImagem, setUrlPreviaImagem] = useState(null);

  // Estado para forçar a limpeza do campo de arquivo gerando uma chave aleatória
  const [chaveArquivo, setChaveArquivo] = useState(Math.random().toString());

  // Função responsável por validar as credenciais fornecidas no formulário de login
  const manipularEnvioLogin = (evento) => {
    // Impede o recarregamento automático da página ao submeter o formulário
    evento.preventDefault();

    // Compara o usuário e senha informados com as credenciais autorizadas
    if (usuario === 'etecembu' && senha === 'etec@241') {
      // Autoriza o acesso mudando o estado para verdadeiro
      setAutenticado(true);
      // Limpa qualquer mensagem de erro que estivesse ativa
      setMensagemErroLogin('');
    } else {
      // Exibe mensagem de credenciais inválidas caso estejam incorretas
      setMensagemErroLogin('Usuário ou senha inválidos!');
    }
  };

  // Função executada quando o usuário seleciona um arquivo de imagem no input file
  const manipularMudancaImagem = (evento) => {
    // Captura o primeiro arquivo selecionado pelo usuário
    const arquivo = evento.target.files[0];

    // Verifica se o arquivo foi realmente selecionado
    if (arquivo) {
      // Salva o arquivo no estado
      setArquivoImagem(arquivo);
      // Gera e salva a URL temporária para pré-visualização da imagem na tela
      setUrlPreviaImagem(URL.createObjectURL(arquivo));
    }
  };

  // Função responsável por enviar os dados do formulário de cadastro para a API
  const manipularEnvioCadastro = async (evento) => {
    // Evita o recarregamento padrão da página ao enviar o formulário
    evento.preventDefault();

    // Valida se o usuário anexou a imagem necessária
    if (!arquivoImagem) {
      // Define a mensagem avisando sobre a necessidade da imagem
      setMensagemFeedback('Selecione uma imagem antes de enviar.');
      // Interrompe a execução da função
      return;
    }

    // Cria um objeto FormData para enviar texto e arquivo na mesma requisição HTTP
    const dadosFormulario = new FormData();

    // Anexa o arquivo de imagem aos dados do formulário
    dadosFormulario.append('imagem', arquivoImagem);

    // Anexa o tema da questão
    dadosFormulario.append('tema', tema);

    // Anexa o texto da pergunta
    dadosFormulario.append('pergunta', pergunta);

    // Anexa as opções A, B, C e D
    dadosFormulario.append('A', opcaoA);
    dadosFormulario.append('B', opcaoB);
    dadosFormulario.append('C', opcaoC);
    dadosFormulario.append('D', opcaoD);

    // Anexa qual alternativa é a correta
    dadosFormulario.append('correta', alternativaCorreta);

    try {
      // Envia os dados via POST para a rota de inserção da API na porta 3042
      await axios.post('http://localhost:3042/insert', dadosFormulario, {
        headers: {
          // Define o tipo de conteúdo como multipart/form-data para envio de arquivos
          'Content-Type': 'multipart/form-data',
          // Informa que aceita resposta em formato JSON
          Accept: 'application/json'
        }
      });

      // Define a mensagem informando sucesso no cadastro
      setMensagemFeedback('Registro inserido com sucesso!');

      // Limpa os campos do formulário após a inserção bem-sucedida
      setTema('');
      setPergunta('');
      setOpcaoA('');
      setOpcaoB('');
      setOpcaoC('');
      setOpcaoD('');
      setArquivoImagem(null);
      setUrlPreviaImagem(null);
      setAlternativaCorreta('');
      setChaveArquivo(Math.random().toString());

      // Agenda a limpeza automática da mensagem de feedback após 15 segundos
      setTimeout(() => setMensagemFeedback(''), 15000);
    } catch (erro) {
      // Captura erros da requisição e exibe a mensagem retornada pelo servidor ou padrão
      setMensagemFeedback(`Erro ao inserir registro! ${erro.response?.data?.message || erro.message}`);
    }
  };

  // Renderização da interface
  return (
    // Elemento que engloba toda a página preservando a classe CSS original
    <div className="Interface">
      {/* Cabeçalho padrão com o tema do evento e as imagens originais */}
      <header>
        {/* Imagem da torta posicionada à esquerda */}
        <img className="imgFoto" style={estilos.imgFoto} src={imagemTorta} alt="Torta na Cara" />
        {/* Bloco de títulos da gincana */}
        <div>
          <h1>TORTA NA CARA</h1>
          <h2>Semana Paulo Freire</h2>
        </div>
        {/* Imagem do patrono Paulo Freire à direita */}
        <img className="imgPaulo" src={imagemPaulo} alt="Paulo Freire" />
      </header>

      {/* Seção principal mantendo os estilos exatos de layout e alinhamento da tela */}
      <section
        style={{
          width: '80%',
          margin: 'auto',
          marginTop: '45px',
          textAlign: 'center',
          fontSize: '16pt',
          fontWeight: 'bold'
        }}
      >
        {/* Renderização condicional: se NÃO estiver autenticado, exibe o formulário de login */}
        {!autenticado ? (
          // Formulário de Login
          <Form onSubmit={manipularEnvioLogin}>
            {/* Título de identificação do painel de login */}
            <h2 style={{ marginBottom: 25 }}>Acesso ao Cadastro</h2>

            {/* Grupo de entrada para o nome de usuário */}
            <Form.Group controlId="formUsuario" style={{ marginBottom: 15 }}>
              <Form.Label>Usuário:</Form.Label>
              <Form.Control
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Informe seu usuário"
                style={{ width: '50%', margin: 'auto', padding: 5, fontSize: 14 }}
              />
            </Form.Group>

            {/* Grupo de entrada para a senha */}
            <Form.Group controlId="formSenha" style={{ marginBottom: 20 }}>
              <Form.Label>Senha:</Form.Label>
              <Form.Control
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Informe sua senha"
                style={{ width: '50%', margin: 'auto', padding: 5, fontSize: 14 }}
              />
            </Form.Group>

            {/* Botão para submeter os dados de acesso */}
            <Button
              variant="primary"
              type="submit"
              style={{ fontSize: 22, padding: '5px 25px', color: 'white', backgroundColor: 'Green', border: 'none' }}
            >
              Entrar
            </Button>

            {/* Alerta de erro caso o login ou senha estejam incorretos */}
            {mensagemErroLogin && (
              <Alert variant="danger" style={{ width: '50%', margin: '20px auto 0', fontSize: 14 }}>
                {mensagemErroLogin}
              </Alert>
            )}
          </Form>
        ) : (
          // Formulário de Cadastro (exibido somente após o login com sucesso)
          <Form onSubmit={manipularEnvioCadastro}>
            {/* Grupo de entrada do Tema */}
            <Form.Group controlId="formTema" style={{ marginBottom: 15 }}>
              <Form.Label>Tema:</Form.Label>
              <Form.Control
                type="text"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                style={{ width: '50%', padding: 5, fontSize: 12, margin: 'auto' }}
              />
            </Form.Group>

            {/* Grupo de entrada da Pergunta */}
            <Form.Group controlId="formPergunta">
              <Form.Label>Pergunta:</Form.Label>
              <Form.Control
                as="textarea"
                value={pergunta}
                onChange={(e) => setPergunta(e.target.value)}
                style={{ width: '53%', height: 60, padding: 5, fontSize: 12, margin: 'auto' }}
              />
            </Form.Group>

            {/* Grupo de entrada da Alternativa A */}
            <Form.Group controlId="formA">
              <Form.Label>A:</Form.Label>
              <Form.Control
                type="text"
                value={opcaoA}
                onChange={(e) => setOpcaoA(e.target.value)}
                style={{ width: '60%', padding: 5, fontSize: 12, margin: 'auto' }}
              />
            </Form.Group>

            {/* Grupo de entrada da Alternativa B */}
            <Form.Group controlId="formB">
              <Form.Label>B:</Form.Label>
              <Form.Control
                type="text"
                value={opcaoB}
                onChange={(e) => setOpcaoB(e.target.value)}
                style={{ width: '60%', padding: 5, fontSize: 12, margin: 'auto' }}
              />
            </Form.Group>

            {/* Grupo de entrada da Alternativa C */}
            <Form.Group controlId="formC">
              <Form.Label>C:</Form.Label>
              <Form.Control
                type="text"
                value={opcaoC}
                onChange={(e) => setOpcaoC(e.target.value)}
                style={{ width: '60%', padding: 5, fontSize: 12, margin: 'auto' }}
              />
            </Form.Group>

            {/* Grupo de entrada da Alternativa D */}
            <Form.Group controlId="formD">
              <Form.Label>D:</Form.Label>
              <Form.Control
                type="text"
                value={opcaoD}
                onChange={(e) => setOpcaoD(e.target.value)}
                style={{ width: '60%', padding: 5, fontSize: 12, margin: 'auto' }}
              />
            </Form.Group>

            {/* Grupo de upload do arquivo de imagem */}
            <Form.Group controlId="formImagem">
              <Form.Label>Imagem:</Form.Label>
              <Form.Control
                key={chaveArquivo}
                type="file"
                onChange={manipularMudancaImagem}
                style={{ width: '60%', margin: 'auto' }}
              />
            </Form.Group>

            {/* Exibe a pré-visualização da imagem se houver arquivo selecionado */}
            {urlPreviaImagem && (
              <img
                src={urlPreviaImagem}
                alt="Pré-visualização"
                style={{ height: '200px', width: '200px', borderRadius: 100, margin: '15px auto', display: 'block' }}
              />
            )}

            {/* Menu suspenso para escolha da alternativa correta */}
            <Form.Group controlId="formCorreta">
              <Form.Label>Correta:</Form.Label>
              <Form.Control
                as="select"
                value={alternativaCorreta}
                onChange={(e) => setAlternativaCorreta(e.target.value)}
                style={{ width: '20%', margin: 'auto' }}
              >
                <option value="">Selecione...</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </Form.Control>
            </Form.Group>

            {/* Botão de envio para cadastrar a questão no banco */}
            <Button
              variant="primary"
              type="submit"
              style={{ fontSize: 24, padding: 5, color: 'white', backgroundColor: 'Green', border: 'none', marginTop: 15 }}
            >
              Inserir
            </Button>
          </Form>
        )}

        {/* Mensagem de alerta para informar o resultado da operação de inserção */}
        {mensagemFeedback && (
          <Alert variant="info" style={{ marginTop: 20 }}>
            {mensagemFeedback}
          </Alert>
        )}
      </section>
    </div>
  );
};

// Exporta o componente Inserir como padrão do módulo
export default Inserir;