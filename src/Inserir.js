// Importa o arquivo de estilo CSS com as regras visuais da interface[cite: 12]
import './interface.css';

// Importa o React e o hook useState para criação e controle de estados locais[cite: 12]
import React, { useState } from 'react';

// Importa o Axios para realizar requisições HTTP assíncronas para o backend[cite: 12]
import axios from 'axios';

// Importa componentes visuais reutilizáveis do React-Bootstrap[cite: 12]
import { Form, Button, Alert } from 'react-bootstrap';

// Importa a imagem estática do logotipo 'torta'[cite: 12]
import imagemTorta from './img/torta.webp';

// Importa a imagem em GIF de Paulo Freire[cite: 12]
import imagemPaulo from './img/pauloFreire.gif';

// Define a URL base do backend Express utilizado nas chamadas de API[cite: 12]
const URL_API = process.env.REACT_APP_API_URL || 'http://localhost:3042';

// Declara o componente funcional Inserir[cite: 12]
const Inserir = () => {
  // Estado para armazenar o valor digitado no campo de usuário do login[cite: 12]
  const [usuario, setUsuario] = useState('');

  // Estado para armazenar o valor digitado no campo de senha do login[cite: 12]
  const [senha, setSenha] = useState('');

  // Estado booleano que define se o usuário está logado e pode ver o formulário[cite: 12]
  const [autenticado, setAutenticado] = useState(false);

  // Estado para guardar a mensagem de erro em caso de credenciais inválidas[cite: 12]
  const [mensagemErroLogin, setMensagemErroLogin] = useState('');

  // Estado para armazenar o tema da nova questão[cite: 12]
  const [tema, setTema] = useState('');

  // Estado para armazenar o enunciado da pergunta[cite: 12]
  const [pergunta, setPergunta] = useState('');

  // Estado para o texto da alternativa A[cite: 12]
  const [opcaoA, setOpcaoA] = useState('');

  // Estado para o texto da alternativa B[cite: 12]
  const [opcaoB, setOpcaoB] = useState('');

  // Estado para o texto da alternativa C[cite: 12]
  const [opcaoC, setOpcaoC] = useState('');

  // Estado para o texto da alternativa D[cite: 12]
  const [opcaoD, setOpcaoD] = useState('');

  // Estado para guardar o arquivo binário da imagem selecionada[cite: 12]
  const [arquivoImagem, setArquivoImagem] = useState(null);

  // Estado para armazenar a letra da alternativa correta ('A', 'B', 'C' ou 'D')[cite: 12]
  const [alternativaCorreta, setAlternativaCorreta] = useState('');

  // Estado para guardar mensagens de sucesso ou erro do cadastro[cite: 12]
  const [mensagemFeedback, setMensagemFeedback] = useState('');

  // Estado para a URL temporária de pré-visualização da imagem no navegador[cite: 12]
  const [urlPreviaImagem, setUrlPreviaImagem] = useState(null);

  // Estado com valor aleatório usado na prop 'key' do input file para forçar sua limpeza visual[cite: 12]
  const [chaveArquivo, setChaveArquivo] = useState(Math.random().toString());

  // Função que lida com o envio do formulário de autenticação[cite: 12]
  const manipularEnvioLogin = (evento) => {
    // Previne o recarregamento automático da página[cite: 12]
    evento.preventDefault();

    // Valida se as credenciais correspondem ao login administrativo padrão[cite: 12]
    if (usuario === 'etecembu' && senha === 'etec@241') {
      // Define status de autenticado como verdadeiro liberando a tela[cite: 12]
      setAutenticado(true);
      // Limpa eventuais mensagens de erro anteriores[cite: 12]
      setMensagemErroLogin('');
    } else {
      // Define a mensagem de erro caso usuário ou senha estejam incorretos[cite: 12]
      setMensagemErroLogin('Usuário ou senha inválidos!');
    }
  };

  // Função disparada quando um arquivo é selecionado no input file[cite: 12]
  const manipularMudancaImagem = (evento) => {
    // Pega o primeiro arquivo da seleção[cite: 12]
    const arquivo = evento.target.files[0];

    // Se houver arquivo selecionado[cite: 12]
    if (arquivo) {
      // Libera da memória a URL de pré-visualização anterior, caso exista
      if (urlPreviaImagem) {
        URL.revokeObjectURL(urlPreviaImagem);
      }

      // Guarda o arquivo binário no estado[cite: 12]
      setArquivoImagem(arquivo);

      // Cria uma URL temporária de objeto para exibir a prévia visual[cite: 12]
      setUrlPreviaImagem(URL.createObjectURL(arquivo));
    }
  };

  // Função assíncrona responsável pelo envio e gravação do formulário de cadastro[cite: 12]
  const manipularEnvioCadastro = async (evento) => {
    // Impede o envio tradicional do formulário pelo navegador[cite: 12]
    evento.preventDefault();

    // Valida se uma imagem foi selecionada obrigatoriamente[cite: 12]
    if (!arquivoImagem) {
      // Alerta o usuário caso falte o anexo da imagem[cite: 12]
      setMensagemFeedback('Selecione uma imagem antes de enviar.');
      return;
    }

    // Instancia objeto FormData para permitir empacotamento multipart (texto e arquivos)[cite: 12]
    const dadosFormulario = new FormData();

    // Anexa a imagem binária com o campo 'imagem' esperado pelo middleware Multer no backend[cite: 12]
    dadosFormulario.append('imagem', arquivoImagem);

    // Anexa o tema da questão[cite: 12]
    dadosFormulario.append('tema', tema);

    // Anexa a pergunta[cite: 12]
    dadosFormulario.append('pergunta', pergunta);

    // Anexa a alternativa A[cite: 12]
    dadosFormulario.append('A', opcaoA);

    // Anexa a alternativa B[cite: 12]
    dadosFormulario.append('B', opcaoB);

    // Anexa a alternativa C[cite: 12]
    dadosFormulario.append('C', opcaoC);

    // Anexa a alternativa D[cite: 12]
    dadosFormulario.append('D', opcaoD);

    // Anexa a indicação da resposta correta[cite: 12]
    dadosFormulario.append('correta', alternativaCorreta);

    try {
      // Realiza requisição POST ao endpoint /insert da API.
      // O cabeçalho multipart/form-data com boundary é montado automaticamente pelo Axios/navegador.
      await axios.post(`${URL_API}/insert`, dadosFormulario);

      // Define a mensagem de sucesso para exibição na tela[cite: 12]
      setMensagemFeedback('Registro inserido com sucesso!');

      // Libera a URL do objeto criada para prévia
      if (urlPreviaImagem) {
        URL.revokeObjectURL(urlPreviaImagem);
      }

      // Limpa os campos do formulário para o próximo cadastro[cite: 12]
      setTema('');
      setPergunta('');
      setOpcaoA('');
      setOpcaoB('');
      setOpcaoC('');
      setOpcaoD('');
      setArquivoImagem(null);
      setUrlPreviaImagem(null);
      setAlternativaCorreta('');

      // Gera nova chave para desmontar e limpar o campo de arquivo (input type file) no DOM[cite: 12]
      setChaveArquivo(Math.random().toString());

      // Configura temporizador para remover a mensagem de feedback após 15 segundos[cite: 12]
      setTimeout(() => setMensagemFeedback(''), 15000);
    } catch (erro) {
      // Trata exceções exibindo mensagem detalhada retornada da API ou erro genérico[cite: 12]
      setMensagemFeedback(`Erro ao inserir registro! ${erro.response?.data?.message || erro.message}`);
    }
  };

  // Renderização do layout da tela[cite: 12]
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

      {/* Exibição condicional: se não autenticado exibe login, se autenticado exibe o cadastro[cite: 12] */}
      {!autenticado ? (
        <div className="login-wrapper">
          <div className="login-card">
            <h2>Acesso ao Cadastro</h2>
            {/* Formulário de autenticação[cite: 12] */}
            <Form onSubmit={manipularEnvioLogin} className="login-form">
              {/* Campo de usuário[cite: 12] */}
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

              {/* Campo de senha[cite: 12] */}
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

              {/* Botão para submissão do login[cite: 12] */}
              <Button type="submit" className="login-btn">
                Entrar
              </Button>

              {/* Mensagem de alerta em caso de falha de login[cite: 12] */}
              {mensagemErroLogin && (
                <Alert variant="danger" className="login-alert">
                  {mensagemErroLogin}
                </Alert>
              )}
            </Form>
          </div>
        </div>
      ) : (
        // Painel liberado após autenticação com sucesso[cite: 12]
        <section className="admin-section">
          {/* Formulário de cadastro de nova questão[cite: 12] */}
          <Form onSubmit={manipularEnvioCadastro}>
            {/* Campo para preenchimento do tema da pergunta[cite: 12] */}
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

            {/* Campo em textarea para redação do enunciado da pergunta[cite: 12] */}
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

            {/* Mapeamento iterativo para renderizar os campos das opções A, B, C e D[cite: 12] */}
            {['A', 'B', 'C', 'D'].map((letra, index) => {
              // Vetor que mapeia os valores de cada estado de alternativa[cite: 12]
              const vals = [opcaoA, opcaoB, opcaoC, opcaoD];
              // Vetor que mapeia as funções atualizadoras de cada estado[cite: 12]
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

            {/* Campo para anexar a foto da questão[cite: 12] */}
            <Form.Group controlId="formImagem">
              <Form.Label>Imagem:</Form.Label>
              <Form.Control
                key={chaveArquivo} // Chave dinâmica que força a limpeza do input quando atualizada[cite: 12]
                type="file"
                onChange={manipularMudancaImagem}
                className="campo-imagem"
                style={{ width: '60%', margin: 'auto' }}
              />
            </Form.Group>

            {/* Exibe a foto selecionada em formato circular se houver arquivo carregado[cite: 12] */}
            {urlPreviaImagem && (
              <img
                src={urlPreviaImagem}
                alt="Pré-visualização"
                style={{ height: '200px', width: '200px', borderRadius: '15px', margin: '15px auto', display: 'block', objectFit: 'cover' }}
              />
            )}

            {/* Seleção da alternativa correta com largura ajustada para o texto e alinhado ao centro */}
            <Form.Group 
              controlId="formCorreta" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '15px auto'
              }}
            >
              <Form.Label style={{ marginBottom: 5 }}>Correta:</Form.Label>
              <Form.Control
                as="select"
                value={alternativaCorreta}
                onChange={(e) => setAlternativaCorreta(e.target.value)}
                className="campo-correta"
                style={{ 
                  width: 'auto', 
                  minWidth: '150px', 
                  maxWidth: '180px',
                  padding: '5px 12px',
                  fontSize: 14,
                  textAlign: 'center',
                  textAlignLast: 'center',
                  margin: '0 auto',
                  display: 'block'
                }}
              >
                <option value="">Selecione...</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </Form.Control>
            </Form.Group>

            {/* Botão de submissão do cadastro[cite: 12] */}
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <Button
                variant="primary"
                type="submit"
                className="btn-salvar-mobile"
                style={{ fontSize: 24, padding: '8px 40px', color: 'white', backgroundColor: 'Green', border: 'none', marginTop: 15 }}
              >
                Inserir
              </Button>
            </div>
          </Form>

          {/* Alerta para exibir mensagens de sucesso ou falha após a tentativa de cadastro[cite: 12] */}
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

// Exporta o componente Inserir como exportação padrão do arquivo[cite: 12]
export default Inserir;