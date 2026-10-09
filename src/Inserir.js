// Importa o arquivo de estilo CSS com as regras visuais da interface[cite: 9]
import './interface.css';

// Importa o React e o hook useState para criação e controle de estados locais[cite: 9]
import React, { useState } from 'react';

// Importa o Axios para realizar requisições HTTP assíncronas para o backend[cite: 9]
import axios from 'axios';

// Importa componentes visuais reutilizáveis do React-Bootstrap[cite: 9]
import { Form, Button, Alert } from 'react-bootstrap';

// Importa a imagem estática do logotipo 'torta'[cite: 9]
import imagemTorta from './img/torta.webp';

// Importa a imagem em GIF de Paulo Freire[cite: 9]
import imagemPaulo from './img/pauloFreire.gif';

// Declara o componente funcional Inserir[cite: 9]
const Inserir = () => {
  // Estado para armazenar o valor digitado no campo de usuário do login[cite: 9]
  const [usuario, setUsuario] = useState('');

  // Estado para armazenar o valor digitado no campo de senha do login[cite: 9]
  const [senha, setSenha] = useState('');

  // Estado booleano que define se o usuário está logado e pode ver o formulário[cite: 9]
  const [autenticado, setAutenticado] = useState(false);

  // Estado para guardar a mensagem de erro em caso de credenciais inválidas[cite: 9]
  const [mensagemErroLogin, setMensagemErroLogin] = useState('');

  // Estado para armazenar o tema da nova questão[cite: 9]
  const [tema, setTema] = useState('');

  // Estado para armazenar o enunciado da pergunta[cite: 9]
  const [pergunta, setPergunta] = useState('');

  // Estado para o texto da alternativa A[cite: 9]
  const [opcaoA, setOpcaoA] = useState('');

  // Estado para o texto da alternativa B[cite: 9]
  const [opcaoB, setOpcaoB] = useState('');

  // Estado para o texto da alternativa C[cite: 9]
  const [opcaoC, setOpcaoC] = useState('');

  // Estado para o texto da alternativa D[cite: 9]
  const [opcaoD, setOpcaoD] = useState('');

  // Estado para guardar o arquivo binário da imagem selecionada[cite: 9]
  const [arquivoImagem, setArquivoImagem] = useState(null);

  // Estado para armazenar a letra da alternativa correta ('A', 'B', 'C' ou 'D')[cite: 9]
  const [alternativaCorreta, setAlternativaCorreta] = useState('');

  // Estado para guardar mensagens de sucesso ou erro do cadastro[cite: 9]
  const [mensagemFeedback, setMensagemFeedback] = useState('');

  // Estado para a URL temporária de pré-visualização da imagem no navegador[cite: 9]
  const [urlPreviaImagem, setUrlPreviaImagem] = useState(null);

  // Estado com valor aleatório usado na prop 'key' do input file para forçar sua limpeza visual[cite: 9]
  const [chaveArquivo, setChaveArquivo] = useState(Math.random().toString());

  // Função que lida com o envio do formulário de autenticação[cite: 9]
  const manipularEnvioLogin = (evento) => {
    // Previne o recarregamento automático da página[cite: 9]
    evento.preventDefault();

    // Valida se as credenciais correspondem ao login administrativo padrão[cite: 9]
    if (usuario === 'etecembu' && senha === 'etec@241') {
      // Define status de autenticado como verdadeiro liberando a tela[cite: 9]
      setAutenticado(true);
      // Limpa eventuais mensagens de erro anteriores[cite: 9]
      setMensagemErroLogin('');
    } else {
      // Define a mensagem de erro caso usuário ou senha estejam incorretos[cite: 9]
      setMensagemErroLogin('Usuário ou senha inválidos!');
    }
  };

  // Função disparada quando um arquivo é selecionado no input file[cite: 9]
  const manipularMudancaImagem = (evento) => {
    // Pega o primeiro arquivo da seleção[cite: 9]
    const arquivo = evento.target.files[0];

    // Se houver arquivo selecionado[cite: 9]
    if (arquivo) {
      // Guarda o arquivo binário no estado[cite: 9]
      setArquivoImagem(arquivo);

      // Cria uma URL temporária de objeto para exibir a prévia visual[cite: 9]
      setUrlPreviaImagem(URL.createObjectURL(arquivo));
    }
  };

  // Função assíncrona responsável pelo envio e gravação do formulário de cadastro[cite: 9]
  const manipularEnvioCadastro = async (evento) => {
    // Impede o envio tradicional do formulário pelo navegador[cite: 9]
    evento.preventDefault();

    // Valida se uma imagem foi selecionada obrigatoriamente[cite: 9]
    if (!arquivoImagem) {
      // Alerta o usuário caso falte o anexo da imagem[cite: 9]
      setMensagemFeedback('Selecione uma imagem antes de enviar.');
      return;
    }

    // Instancia objeto FormData para permitir empacotamento multipart (texto e arquivos)[cite: 9]
    const dadosFormulario = new FormData();

    // Anexa a imagem binária com a chave esperada pelo Multer no backend[cite: 9]
    dadosFormulario.append('imagem', arquivoImagem);

    // Anexa o tema da questão[cite: 9]
    dadosFormulario.append('tema', tema);

    // Anexa a pergunta[cite: 9]
    dadosFormulario.append('pergunta', pergunta);

    // Anexa a alternativa A[cite: 9]
    dadosFormulario.append('A', opcaoA);

    // Anexa a alternativa B[cite: 9]
    dadosFormulario.append('B', opcaoB);

    // Anexa a alternativa C[cite: 9]
    dadosFormulario.append('C', opcaoC);

    // Anexa a alternativa D[cite: 9]
    dadosFormulario.append('D', opcaoD);

    // Anexa a indicação da resposta correta[cite: 9]
    dadosFormulario.append('correta', alternativaCorreta);

    try {
      // Realiza requisição POST ao endpoint /insert da API local[cite: 9]
      await axios.post('http://localhost:3042/insert', dadosFormulario, {
        headers: {
          'Content-Type': 'multipart/form-data', // Especifica cabeçalho de upload de formulário[cite: 9]
          Accept: 'application/json'             // Indica expectativa de resposta em formato JSON[cite: 9]
        }
      });

      // Define a mensagem de sucesso para exibição na tela[cite: 9]
      setMensagemFeedback('Registro inserido com sucesso!');

      // Limpa os campos do formulário para o próximo cadastro[cite: 9]
      setTema('');
      setPergunta('');
      setOpcaoA('');
      setOpcaoB('');
      setOpcaoC('');
      setOpcaoD('');
      setArquivoImagem(null);
      setUrlPreviaImagem(null);
      setAlternativaCorreta('');

      // Gera nova chave para desmontar e limpar o campo de arquivo (input type file) no DOM[cite: 9]
      setChaveArquivo(Math.random().toString());

      // Configura temporizador para remover a mensagem de feedback após 15 segundos[cite: 9]
      setTimeout(() => setMensagemFeedback(''), 15000);
    } catch (erro) {
      // Trata exceções exibindo mensagem detalhada retornada da API ou erro genérico[cite: 9]
      setMensagemFeedback(`Erro ao inserir registro! ${erro.response?.data?.message || erro.message}`);
    }
  };

  // Renderização do layout da tela[cite: 9]
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

      {/* Exibição condicional: se não autenticado exibe login, se autenticado exibe o cadastro[cite: 9] */}
      {!autenticado ? (
        <div className="login-wrapper">
          <div className="login-card">
            <h2>Acesso ao Cadastro</h2>
            {/* Formulário de autenticação[cite: 9] */}
            <Form onSubmit={manipularEnvioLogin} className="login-form">
              {/* Campo de usuário[cite: 9] */}
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

              {/* Campo de senha[cite: 9] */}
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

              {/* Botão para submissão do login[cite: 9] */}
              <Button type="submit" className="login-btn">
                Entrar
              </Button>

              {/* Mensagem de alerta em caso de falha de login[cite: 9] */}
              {mensagemErroLogin && (
                <Alert variant="danger" className="login-alert">
                  {mensagemErroLogin}
                </Alert>
              )}
            </Form>
          </div>
        </div>
      ) : (
        // Painel liberado após autenticação com sucesso[cite: 9]
        <section className="admin-section">
          {/* Formulário de cadastro de nova questão[cite: 9] */}
          <Form onSubmit={manipularEnvioCadastro}>
            {/* Campo para preenchimento do tema da pergunta[cite: 9] */}
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

            {/* Campo em textarea para redação do enunciado da pergunta[cite: 9] */}
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

            {/* Mapeamento iterativo para renderizar os campos das opções A, B, C e D[cite: 9] */}
            {['A', 'B', 'C', 'D'].map((letra, index) => {
              // Vetor que mapeia os valores de cada estado de alternativa[cite: 9]
              const vals = [opcaoA, opcaoB, opcaoC, opcaoD];
              // Vetor que mapeia as funções atualizadoras de cada estado[cite: 9]
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

            {/* Campo para anexar a foto da questão[cite: 9] */}
            <Form.Group controlId="formImagem">
              <Form.Label>Imagem:</Form.Label>
              <Form.Control
                key={chaveArquivo} // Chave dinâmica que força a limpeza do input quando atualizada[cite: 9]
                type="file"
                onChange={manipularMudancaImagem}
                className="campo-imagem"
                style={{ width: '60%', margin: 'auto' }}
              />
            </Form.Group>

            {/* Exibe a foto selecionada em formato circular se houver arquivo carregado[cite: 9] */}
            {urlPreviaImagem && (
              <img
                src={urlPreviaImagem}
                alt="Pré-visualização"
                style={{ height: '200px', width: '200px', borderRadius: 100, margin: '15px auto', display: 'block', objectFit: 'cover' }}
              />
            )}

            {/* Seleção da alternativa correta[cite: 9] */}
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

            {/* Botão de submissão do cadastro[cite: 9] */}
            <Button
              variant="primary"
              type="submit"
              className="btn-salvar-mobile"
              style={{ fontSize: 24, padding: 5, color: 'white', backgroundColor: 'Green', border: 'none', marginTop: 15 }}
            >
              Inserir
            </Button>
          </Form>

          {/* Alerta para exibir mensagens de sucesso ou falha após a tentativa de cadastro[cite: 9] */}
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

// Exporta o componente Inserir como exportação padrão do arquivo[cite: 9]
export default Inserir;