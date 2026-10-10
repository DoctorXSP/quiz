// Importa o arquivo de estilo CSS com as regras visuais da interface
import './interface.css';

// Importa o React e o hook useState para criação e controle de estados locais
import React, { useState } from 'react';

// Importa o Axios para realizar requisições HTTP assíncronas para o backend
import axios from 'axios';

// Importa componentes visuais reutilizáveis do React-Bootstrap
import { Form, Button, Alert } from 'react-bootstrap';

// Importa a imagem estática do logotipo 'torta'
import imagemTorta from './img/torta.webp';

// Importa a imagem em GIF de Paulo Freire
import imagemPaulo from './img/pauloFreire.gif';

// Define a URL base do backend Express utilizado nas chamadas de API
const URL_API = process.env.REACT_APP_API_URL || 'http://localhost:3042';

// Declara o componente funcional Inserir
const Inserir = () => {
  // Estado para armazenar o valor digitado no campo de usuário do login
  const [usuario, setUsuario] = useState('');

  // Estado para armazenar o valor digitado no campo de senha do login
  const [senha, setSenha] = useState('');

  // Estado booleano que define se o usuário está logado e pode ver o formulário
  const [autenticado, setAutenticado] = useState(false);

  // Estado para guardar a mensagem de erro em caso de credenciais inválidas
  const [mensagemErroLogin, setMensagemErroLogin] = useState('');

  // Estado para armazenar o tema da nova questão
  const [tema, setTema] = useState('');

  // Estado para armazenar o enunciado da pergunta
  const [pergunta, setPergunta] = useState('');

  // Estado para o texto da alternativa A
  const [opcaoA, setOpcaoA] = useState('');

  // Estado para o texto da alternativa B
  const [opcaoB, setOpcaoB] = useState('');

  // Estado para o texto da alternativa C
  const [opcaoC, setOpcaoC] = useState('');

  // Estado para o texto da alternativa D
  const [opcaoD, setOpcaoD] = useState('');

  // Estado para guardar o arquivo binário da imagem selecionada
  const [arquivoImagem, setArquivoImagem] = useState(null);

  // Estado para armazenar a letra da alternativa correta ('A', 'B', 'C' ou 'D')
  const [alternativaCorreta, setAlternativaCorreta] = useState('');

  // Estado para guardar mensagens de sucesso ou erro do cadastro
  const [mensagemFeedback, setMensagemFeedback] = useState('');

  // Estado para a URL temporária de pré-visualização da imagem no navegador
  const [urlPreviaImagem, setUrlPreviaImagem] = useState(null);

  // Estado com valor aleatório usado na prop 'key' do input file para forçar sua limpeza visual
  const [chaveArquivo, setChaveArquivo] = useState(Math.random().toString());

  // Função que lida com o envio do formulário de autenticação
  const manipularEnvioLogin = (evento) => {
    // Previne o recarregamento automático da página
    evento.preventDefault();

    // Valida se as credenciais correspondem ao login administrativo padrão
    if (usuario === 'etecembu' && senha === 'etec@241') {
      // Define status de autenticado como verdadeiro liberando a tela
      setAutenticado(true);
      // Limpa eventuais mensagens de erro anteriores
      setMensagemErroLogin('');
    } else {
      // Define a mensagem de erro caso usuário ou senha estejam incorretos
      setMensagemErroLogin('Usuário ou senha inválidos!');
    }
  };

  // Função disparada quando um arquivo é selecionado no input file
  const manipularMudancaImagem = (evento) => {
    // Pega o primeiro arquivo da seleção
    const arquivo = evento.target.files[0];

    // Se houver arquivo selecionado
    if (arquivo) {
      // Libera da memória a URL de pré-visualização anterior, caso exista
      if (urlPreviaImagem) {
        URL.revokeObjectURL(urlPreviaImagem);
      }

      // Guarda o arquivo binário no estado
      setArquivoImagem(arquivo);

      // Cria uma URL temporária de objeto para exibir a prévia visual
      setUrlPreviaImagem(URL.createObjectURL(arquivo));
    }
  };

  // Função assíncrona responsável pelo envio e gravação do formulário de cadastro
  const manipularEnvioCadastro = async (evento) => {
    // Impede o envio tradicional do formulário pelo navegador
    evento.preventDefault();

    // Valida se uma imagem foi selecionada obrigatoriamente
    if (!arquivoImagem) {
      // Alerta o usuário caso falte o anexo da imagem
      setMensagemFeedback('Selecione uma imagem antes de enviar.');
      return;
    }

    // Instancia objeto FormData para permitir empacotamento multipart (texto e arquivos)
    const dadosFormulario = new FormData();

    // Anexa a imagem binária com o campo 'imagem' esperado pelo middleware Multer no backend
    dadosFormulario.append('imagem', arquivoImagem);

    // Anexa o tema da questão
    dadosFormulario.append('tema', tema);

    // Anexa a pergunta
    dadosFormulario.append('pergunta', pergunta);

    // Anexa a alternativa A
    dadosFormulario.append('A', opcaoA);

    // Anexa a alternativa B
    dadosFormulario.append('B', opcaoB);

    // Anexa a alternativa C
    dadosFormulario.append('C', opcaoC);

    // Anexa a alternativa D
    dadosFormulario.append('D', opcaoD);

    // Anexa a indicação da resposta correta
    dadosFormulario.append('correta', alternativaCorreta);

    try {
      // Realiza requisição POST ao endpoint /insert da API.
      // NOTA: Deixamos o Axios/Navegador gerar o cabeçalho 'Content-Type' automaticamente
      // com o 'boundary' correto para evitar falhas de leitura no Multer.
      await axios.post(`${URL_API}/insert`, dadosFormulario);

      // Define a mensagem de sucesso para exibição na tela
      setMensagemFeedback('Registro inserido com sucesso!');

      // Libera a URL do objeto criada para prévia
      if (urlPreviaImagem) {
        URL.revokeObjectURL(urlPreviaImagem);
      }

      // Limpa os campos do formulário para o próximo cadastro
      setTema('');
      setPergunta('');
      setOpcaoA('');
      setOpcaoB('');
      setOpcaoC('');
      setOpcaoD('');
      setArquivoImagem(null);
      setUrlPreviaImagem(null);
      setAlternativaCorreta('');

      // Gera nova chave para desmontar e limpar o campo de arquivo (input type file) no DOM
      setChaveArquivo(Math.random().toString());

      // Configura temporizador para remover a mensagem de feedback após 15 segundos
      setTimeout(() => setMensagemFeedback(''), 15000);
    } catch (erro) {
      // Trata exceções exibindo mensagem detalhada retornada da API ou erro genérico
      setMensagemFeedback(`Erro ao inserir registro! ${erro.response?.data?.message || erro.message}`);
    }
  };

  // Renderização do layout da tela
  return (
    <div className="Interface">
      {/* Cabeçalho da aplicação */}
      <header>
        <img className="imgFoto" src={imagemTorta} alt="Torta na Cara" />
        <div className="tituloHeader">
          <h1>TORTA NA CARA</h1>
          <h2>Semana Paulo Freire</h2>
        </div>
        <img className="imgPaulo" src={imagemPaulo} alt="Paulo Freire" />
      </header>

      {/* Exibição condicional: se não autenticado exibe login, se autenticado exibe o cadastro */}
      {!autenticado ? (
        <div className="login-wrapper">
          <div className="login-card">
            <h2>Acesso ao Cadastro</h2>
            {/* Formulário de autenticação */}
            <Form onSubmit={manipularEnvioLogin} className="login-form">
              {/* Campo de usuário */}
              <Form.Group controlId="formUsuario" className="login-group">
                <Form.Label className="login-label">Usuário:</Form.Label>
                <Form.Control
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Informe seu usuário"
                  className="login-input"
                />
              </Form.Group>

              {/* Campo de senha */}
              <Form.Group controlId="formSenha" className="login-group">
                <Form.Label className="login-label">Senha:</Form.Label>
                <Form.Control
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Informe sua senha"
                  className="login-input"
                />
              </Form.Group>

              {/* Botão para submissão do login */}
              <Button type="submit" className="login-btn">
                Entrar
              </Button>

              {/* Mensagem de alerta em caso de falha de login */}
              {mensagemErroLogin && (
                <Alert variant="danger" className="login-alert">
                  {mensagemErroLogin}
                </Alert>
              )}
            </Form>
          </div>
        </div>
      ) : (
        // Painel liberado após autenticação com sucesso
        <section className="admin-section">
          {/* Formulário de cadastro de nova questão */}
          <Form onSubmit={manipularEnvioCadastro}>
            {/* Campo para preenchimento do tema da pergunta */}
            <Form.Group controlId="formTema" style={{ marginBottom: 15 }}>
              <Form.Label>Tema:</Form.Label>
              <Form.Control
                type="text"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                className="campo-tema"
                style={{ width: '50%', padding: 5, fontSize: 12, margin: 'auto' }}
              />
            </Form.Group>

            {/* Campo em textarea para redação do enunciado da pergunta */}
            <Form.Group controlId="formPergunta">
              <Form.Label>Pergunta:</Form.Label>
              <Form.Control
                as="textarea"
                value={pergunta}
                onChange={(e) => setPergunta(e.target.value)}
                className="campo-pergunta"
                style={{ width: '53%', height: 60, padding: 5, fontSize: 12, margin: 'auto' }}
              />
            </Form.Group>

            {/* Mapeamento iterativo para renderizar os campos das opções A, B, C e D */}
            {['A', 'B', 'C', 'D'].map((letra, index) => {
              // Vetor que mapeia os valores de cada estado de alternativa
              const vals = [opcaoA, opcaoB, opcaoC, opcaoD];
              // Vetor que mapeia as funções atualizadoras de cada estado
              const setters = [setOpcaoA, setOpcaoB, setOpcaoC, setOpcaoD];
              return (
                <Form.Group key={letra} controlId={`form${letra}`}>
                  <Form.Label>{letra}:</Form.Label>
                  <Form.Control
                    type="text"
                    value={vals[index]}
                    onChange={(e) => setters[index](e.target.value)}
                    className="campo-opcao"
                    style={{ width: '60%', padding: 5, fontSize: 12, margin: 'auto' }}
                  />
                </Form.Group>
              );
            })}

            {/* Campo para anexar a foto da questão */}
            <Form.Group controlId="formImagem">
              <Form.Label>Imagem:</Form.Label>
              <Form.Control
                key={chaveArquivo} // Chave dinâmica que força a limpeza do input quando atualizada
                type="file"
                onChange={manipularMudancaImagem}
                className="campo-imagem"
                style={{ width: '60%', margin: 'auto' }}
              />
            </Form.Group>

            {/* Exibe a foto selecionada em formato circular se houver arquivo carregado */}
            {urlPreviaImagem && (
              <img
                src={urlPreviaImagem}
                alt="Pré-visualização"
                style={{ height: '200px', width: '200px', borderRadius: '15px', margin: '15px auto', display: 'block', objectFit: 'cover' }}
              />
            )}

            {/* Seleção da alternativa correta */}
            <Form.Group controlId="formCorreta">
              <Form.Label>Correta:</Form.Label>
              <Form.Control
                as="select"
                value={alternativaCorreta}
                onChange={(e) => setAlternativaCorreta(e.target.value)}
                className="campo-correta"
                style={{ width: '20%', margin: 'auto' }}
              >
                <option value="">Selecione...</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </Form.Control>
            </Form.Group>

            {/* Botão de submissão do cadastro */}
            <Button
              variant="primary"
              type="submit"
              className="btn-salvar-mobile"
              style={{ fontSize: 24, padding: 5, color: 'white', backgroundColor: 'Green', border: 'none', marginTop: 15 }}
            >
              Inserir
            </Button>
          </Form>

          {/* Alerta para exibir mensagens de sucesso ou falha após a tentativa de cadastro */}
          {mensagemFeedback && (
            <Alert variant="info" style={{ marginTop: 20 }}>
              {mensagemFeedback}
            </Alert>
          )}
        </section>
      )}
    </div>
  );
};

// Exporta o componente Inserir como exportação padrão do arquivo
export default Inserir;