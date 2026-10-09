// Importa o núcleo do React e os hooks para controle de estado, efeitos colaterais e referências DOM[cite: 3]
import React, { useState, useEffect, useRef } from 'react';

// Importa a biblioteca Axios para realizar requisições HTTP para a API[cite: 3]
import axios from 'axios';

// Importa componentes visuais reutilizáveis do React-Bootstrap[cite: 3]
import { Form, Button, Alert } from 'react-bootstrap';

// Importa a folha de estilos CSS personalizada da interface[cite: 3]
import './interface.css';

// Importa a imagem estática do logotipo 'torta'[cite: 3]
import imagemTorta from './img/torta.webp';

// Importa a animação GIF com o retrato de Paulo Freire[cite: 3]
import imagemPaulo from './img/pauloFreire.gif';

// Define a URL base do backend Express utilizado nas chamadas de API[cite: 3]
const URL_API = 'http://localhost:3042';

// Declara o componente funcional principal 'Alterar'[cite: 3]
const Alterar = () => {
  // Estado para armazenar o valor digitado no campo de usuário do login[cite: 3]
  const [usuario, setUsuario] = useState('');

  // Estado para armazenar o valor digitado no campo de senha do login[cite: 3]
  const [senha, setSenha] = useState('');

  // Estado booleano que controla se o usuário está autenticado para liberar a tela[cite: 3]
  const [autenticado, setAutenticado] = useState(false);

  // Estado para guardar a mensagem de erro caso o login falhe[cite: 3]
  const [mensagemErroLogin, setMensagemErroLogin] = useState('');

  // Estado que armazena a lista de perguntas/registros retornados do banco[cite: 3]
  const [registros, setRegistros] = useState([]);

  // Estado que armazena a lista de temas distintos cadastrados no sistema[cite: 3]
  const [temas, setTemas] = useState([]);

  // Estado que rastreia a posição/índice do registro atualmente visualizado e editado[cite: 3]
  const [indiceAtual, setIndiceAtual] = useState(0);

  // Estado para guardar o tema selecionado na barra de filtros de busca[cite: 3]
  const [temaSelecionado, setTemaSelecionado] = useState('');

  // Estado para guardar o ID/número da questão digitado no campo de busca[cite: 3]
  const [numeroPergunta, setNumeroPergunta] = useState('');

  // Estado com tipo e mensagem de alerta (sucesso ou erro) para o usuário[cite: 3]
  const [mensagemFeedback, setMensagemFeedback] = useState({ tipo: '', texto: '' });

  // Estado que armazena o arquivo de imagem selecionado localmente via input file[cite: 3]
  const [arquivoImagem, setArquivoImagem] = useState(null);

  // Estado que armazena a URL da pré-visualização da imagem (seja local ou do servidor)[cite: 3]
  const [urlPreviaImagem, setUrlPreviaImagem] = useState(null);

  // Estado de timestamp utilizado para quebrar o cache de imagem do navegador após salvar[cite: 3]
  const [versaoImagem, setVersaoImagem] = useState(Date.now());

  // Estado que sinaliza visualmente com borda verde quando uma imagem foi salva com êxito[cite: 3]
  const [imagemSalvaSucesso, setImagemSalvaSucesso] = useState(false);

  // Cria uma referência direta ao elemento de input file no DOM para manipulação manual[cite: 3]
  const inputArquivoRef = useRef(null);

  // Função que trata o evento de submissão do formulário de login administrativo[cite: 3]
  const manipularEnvioLogin = (evento) => {
    // Evita o recarregamento automático da página ao submeter o formulário[cite: 3]
    evento.preventDefault();

    // Valida credenciais locais pré-definidas[cite: 3]
    if (usuario === 'etecembu' && senha === 'etec@241') {
      // Define o usuário como logado[cite: 3]
      setAutenticado(true);
      // Limpa eventuais mensagens de falha anteriores[cite: 3]
      setMensagemErroLogin('');
    } else {
      // Define a mensagem de erro em caso de credenciais incorretas[cite: 3]
      setMensagemErroLogin('Usuário ou senha inválidos!');
    }
  };

  // Efeito disparado sempre que o estado 'autenticado' sofrer alterações[cite: 3]
  useEffect(() => {
    // Aborta a busca caso o usuário ainda não tenha feito login com sucesso[cite: 3]
    if (!autenticado) return;

    // Carrega a listagem de temas do banco[cite: 3]
    buscarTemas();

    // Carrega a listagem de registros/perguntas disponíveis[cite: 3]
    buscarRegistros();
  }, [autenticado]);

  // Efeito que atualiza dinamicamente a URL da pré-visualização da imagem[cite: 3]
  useEffect(() => {
    // Se não houver registros ou a posição atual for inválida, anula a prévia da foto[cite: 3]
    if (!registros.length || !registros[indiceAtual]) {
      setUrlPreviaImagem(null);
      return;
    }

    // Se o usuário selecionou um arquivo local novo do computador[cite: 3]
    if (arquivoImagem) {
      // Gera uma URL temporária de objeto para exibir o arquivo selecionado localmente[cite: 3]
      const urlBlob = URL.createObjectURL(arquivoImagem);
      setUrlPreviaImagem(urlBlob);

      // Função de limpeza: revoga a URL de memória quando o componente desmonta ou o arquivo muda[cite: 3]
      return () => URL.revokeObjectURL(urlBlob);
    }

    // Obtém o nome ou caminho da imagem salva no registro atual[cite: 3]
    const imagemRegistro = registros[indiceAtual]?.imagem;

    // Se houver uma imagem salva no banco para essa pergunta[cite: 3]
    if (imagemRegistro) {
      // Remove a barra inicial caso exista para garantir concatenação correta de caminho[cite: 3]
      const caminhoLimpo = imagemRegistro.startsWith('/') ? imagemRegistro.slice(1) : imagemRegistro;

      // Monta a URL completa para o endpoint da imagem adicionando versão para forçar revalidação de cache[cite: 3]
      const urlFinal = `${URL_API}/${caminhoLimpo}?v=${versaoImagem}`;
      setUrlPreviaImagem(urlFinal);
    } else {
      // Caso o registro não possua imagem, zera a URL de exibição[cite: 3]
      setUrlPreviaImagem(null);
    }
  }, [indiceAtual, registros, arquivoImagem, versaoImagem]);

  // Efeito que esconde a mensagem de feedback automaticamente após 5 segundos[cite: 3]
  useEffect(() => {
    // Aborta se não houver texto de mensagem ativo[cite: 3]
    if (!mensagemFeedback.texto) return;

    // Configura temporizador de 5000 milissegundos para apagar o feedback[cite: 3]
    const temporizador = setTimeout(() => {
      setMensagemFeedback({ tipo: '', texto: '' });
    }, 5000);

    // Limpa o timer se a mensagem for substituída antes de concluir o tempo[cite: 3]
    return () => clearTimeout(temporizador);
  }, [mensagemFeedback]);

  // Função assíncrona para consultar a lista de temas na API[cite: 3]
  const buscarTemas = async () => {
    try {
      // Faz requisição GET para o endpoint '/temas'[cite: 3]
      const resposta = await axios.get(`${URL_API}/temas`);
      // Guarda os temas recebidos no estado[cite: 3]
      setTemas(resposta.data);
    } catch (erro) {
      // Registra erro no console em caso de problema na rede ou servidor[cite: 3]
      console.error('❌ Erro ao buscar temas:', erro);
      // Apresenta mensagem de alerta de erro para o usuário[cite: 3]
      setMensagemFeedback({ tipo: 'danger', texto: 'Erro ao buscar temas' });
    }
  };

  // Função assíncrona para consultar registros aplicando filtros opcionais[cite: 3]
  const buscarRegistros = async (filtroTema = '', filtroNumero = '', manterIndice = null) => {
    try {
      // Faz a requisição GET passando filtros por query string[cite: 3]
      const resposta = await axios.get(
        `${URL_API}/registros?tema=${filtroTema}&numero=${filtroNumero}`
      );

      // Atualiza a lista de perguntas no estado com a resposta da API[cite: 3]
      setRegistros(resposta.data);

      // Mantém o índice atual após salvar caso solicitado e dentro do tamanho da lista[cite: 3]
      if (manterIndice !== null && manterIndice < resposta.data.length) {
        setIndiceAtual(manterIndice);
      } else {
        // Reinicia para a primeira pergunta caso contrário[cite: 3]
        setIndiceAtual(0);
      }

      // Descarta o arquivo temporário selecionado no input[cite: 3]
      limparSelecaoArquivo();

      // Atualiza a versão do timestamp para recarregar a visualização da imagem[cite: 3]
      setVersaoImagem(Date.now());
    } catch (erro) {
      // Registra erro no console caso a busca falhe[cite: 3]
      console.error('❌ Erro ao buscar registros:', erro);
      // Notifica o usuário sobre a falha[cite: 3]
      setMensagemFeedback({ tipo: 'danger', texto: 'Erro ao buscar registros' });
    }
  };

  // Função utilitária para resetar o arquivo selecionado e esvaziar o input file no DOM[cite: 3]
  const limparSelecaoArquivo = () => {
    setArquivoImagem(null);
    if (inputArquivoRef.current) {
      inputArquivoRef.current.value = '';
    }
  };

  // Navega para o próximo registro da lista[cite: 3]
  const proximoRegistro = () => {
    if (indiceAtual < registros.length - 1) {
      setIndiceAtual((anterior) => anterior + 1);
      limparSelecaoArquivo();
      setImagemSalvaSucesso(false);
    }
  };

  // Navega para o registro anterior da lista[cite: 3]
  const registroAnterior = () => {
    if (indiceAtual > 0) {
      setIndiceAtual((anterior) => anterior - 1);
      limparSelecaoArquivo();
      setImagemSalvaSucesso(false);
    }
  };

  // Salta diretamente para o último registro cadastrado da lista[cite: 3]
  const ultimoRegistro = () => {
    if (registros.length > 0) {
      setIndiceAtual(registros.length - 1);
      limparSelecaoArquivo();
      setImagemSalvaSucesso(false);
    }
  };

  // Função assíncrona responsável por enviar as alterações do registro para o backend[cite: 3]
  const alterarRegistro = async () => {
    try {
      // Obtém o registro sob edição com base no índice atual[cite: 3]
      const registro = registros[indiceAtual];

      // Instancia FormData para envio em multipart/form-data (suportando arquivos e textos)[cite: 3]
      const dadosFormulario = new FormData();

      // Anexa os campos de texto do registro no FormData[cite: 3]
      dadosFormulario.append('tema', registro.tema);
      dadosFormulario.append('pergunta', registro.pergunta);
      dadosFormulario.append('A', registro.A);
      dadosFormulario.append('B', registro.B);
      dadosFormulario.append('C', registro.C);
      dadosFormulario.append('D', registro.D);
      dadosFormulario.append('correta', registro.correta);

      // Anexa o novo arquivo de imagem ao formulário caso tenha sido escolhido[cite: 3]
      if (arquivoImagem) {
        dadosFormulario.append('imagem', arquivoImagem);
      }

      // Envia a requisição PUT contendo o ID/número do registro para atualização[cite: 3]
      const resposta = await axios.put(
        `${URL_API}/atualizar/${registro.numero}`,
        dadosFormulario
      );

      // Localiza o caminho da imagem atualizado conforme a estrutura de resposta da API[cite: 3]
      const imagemRetornada =
        resposta.data?.imagem ||
        resposta.data?.registro?.imagem ||
        resposta.data?.dados?.imagem ||
        registro.imagem;

      // Guarda a referência do índice atual para persistência[cite: 3]
      const indiceSalvo = indiceAtual;

      // Atualiza o estado local de registros com o novo nome da imagem recebido[cite: 3]
      setRegistros((anterior) => {
        const copia = [...anterior];
        copia[indiceSalvo] = { ...copia[indiceSalvo], imagem: imagemRetornada };
        return copia;
      });

      // Atualiza a chave de versão para contornar o cache do navegador[cite: 3]
      setVersaoImagem(Date.now());

      // Esvazia a seleção do arquivo do input[cite: 3]
      limparSelecaoArquivo();

      // Ativa o destaque visual de sucesso da imagem[cite: 3]
      setImagemSalvaSucesso(true);

      // Remove a indicação visual de sucesso após 5 segundos[cite: 3]
      setTimeout(() => setImagemSalvaSucesso(false), 5000);

      // Recarrega os registros da API mantendo o foco no índice atual editado[cite: 3]
      await buscarRegistros(temaSelecionado, numeroPergunta, indiceSalvo);

      // Exibe alerta informando a conclusão com sucesso da atualização[cite: 3]
      setMensagemFeedback({
        tipo: 'success',
        texto: 'Registro e imagem atualizados com sucesso!'
      });
    } catch (erro) {
      // Registra a resposta de erro detalhada no console[cite: 3]
      console.error('❌ Erro na requisição:', erro.response?.data || erro.message);

      // Reseta a indicação visual de sucesso[cite: 3]
      setImagemSalvaSucesso(false);

      // Exibe alerta notificando a falha ocorrida[cite: 3]
      setMensagemFeedback({
        tipo: 'danger',
        texto: 'Erro ao atualizar o registro.'
      });
    }
  };

  // Manipulador genérico para sincronizar alterações de campos de texto com o estado do registro[cite: 3]
  const manipularMudancaTexto = (evento) => {
    // Extrai o nome do campo editado e seu novo conteúdo[cite: 3]
    const { name, value } = evento.target;

    // Atualiza a posição correspondente do array de registros[cite: 3]
    setRegistros((anterior) => {
      const copia = [...anterior];
      copia[indiceAtual] = { ...copia[indiceAtual], [name]: value };
      return copia;
    });
  };

  // Manipulador disparado ao selecionar um arquivo no input de imagem[cite: 3]
  const manipularMudancaImagem = (evento) => {
    // Pega o primeiro arquivo selecionado pelo usuário[cite: 3]
    const arquivo = evento.target.files[0];

    // Se houver arquivo selecionado, armazena no estado e zera a indicação de sucesso[cite: 3]
    if (arquivo) {
      setArquivoImagem(arquivo);
      setImagemSalvaSucesso(false);
    }
  };

  // Renderização JSX da interface[cite: 3]
  return (
    <div className="Interface">
      {/* Cabeçalho da aplicação com logos e títulos institucionais */}
      <header>
        <img className="imgFoto" src={imagemTorta} alt="Torta na Cara" />
        <div className="tituloHeader">
          <h1>TORTA NA CARA</h1>
          <h2>Semana Paulo Freire</h2>
        </div>
        <img className="imgPaulo" src={imagemPaulo} alt="Paulo Freire" />
      </header>

      {/* Renderização condicional: Exibe tela de login se não autenticado, senão exibe o painel */}
      {!autenticado ? (
        <div className="login-wrapper">
          <div className="login-card">
            <h2>Acesso às Alterações</h2>
            {/* Formulário de autenticação administrativa */}
            <Form onSubmit={manipularEnvioLogin} className="login-form">
              <Form.Group controlId="formUsuarioLogin" className="login-group">
                <Form.Label className="login-label">Usuário:</Form.Label>
                <Form.Control
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Informe seu usuário"
                  className="login-input"
                />
              </Form.Group>

              <Form.Group controlId="formSenhaLogin" className="login-group">
                <Form.Label className="login-label">Senha:</Form.Label>
                <Form.Control
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Informe sua senha"
                  className="login-input"
                />
              </Form.Group>

              {/* Botão de envio de credenciais */}
              <Button type="submit" className="login-btn">
                Entrar
              </Button>

              {/* Exibe card de alerta vermelho caso haja erro de login */}
              {mensagemErroLogin && (
                <Alert variant="danger" className="login-alert">
                  {mensagemErroLogin}
                </Alert>
              )}
            </Form>
          </div>
        </div>
      ) : (
        <section className="admin-section">
          {/* Seção com filtros de busca por tema e número da pergunta */}
          <div className="filtro-container">
            {/* Bloco de filtro por categoria/tema */}
            <div className="filtro-bloco">
              <span style={{ fontSize: '13pt' }}>Tema:</span>
              <Form.Control
                as="select"
                value={temaSelecionado}
                onChange={(e) => setTemaSelecionado(e.target.value)}
                style={{ width: '250px', padding: 5, fontSize: 13 }}
              >
                <option value="">Todos os temas</option>
                {/* Renderiza dinamicamente as opções de temas obtidas da API */}
                {temas.map((itemTema, i) => (
                  <option key={i} value={itemTema.tema}>
                    {itemTema.tema}
                  </option>
                ))}
              </Form.Control>
              {/* Botão para disparar busca aplicando o tema selecionado */}
              <Button
                variant="primary"
                style={{ padding: '4px 18px', fontSize: 13 }}
                onClick={() => buscarRegistros(temaSelecionado, '')}
              >
                Filtrar
              </Button>
            </div>

            {/* Bloco de filtro direto por número/ID da pergunta */}
            <div className="filtro-bloco">
              <span style={{ fontSize: '13pt' }}>Nº / ID:</span>
              <Form.Control
                type="text"
                placeholder="Ex.: 10"
                value={numeroPergunta}
                onChange={(e) => setNumeroPergunta(e.target.value)}
                style={{ width: '100px', padding: 5, fontSize: 13 }}
              />
              {/* Botão para buscar questão diretamente por ID */}
              <Button
                variant="primary"
                style={{ padding: '4px 18px', fontSize: 13 }}
                onClick={() => buscarRegistros('', numeroPergunta)}
              >
                Buscar
              </Button>
            </div>
          </div>

          {/* Renderiza o formulário de edição caso existam perguntas carregadas */}
          {registros.length > 0 && registros[indiceAtual] ? (
            <Form>
              {/* Indicador do número/ID da questão em tela */}
              <div style={{ marginBottom: 12, fontSize: '14pt', color: '#004A8D' }}>
                Questão Nº. {registros[indiceAtual].numero}
              </div>

              {/* Campo para alteração do tema do registro */}
              <Form.Group controlId="formTema" style={{ marginBottom: 15 }}>
                <Form.Label>Tema:</Form.Label>
                <Form.Control
                  as="select"
                  name="tema"
                  value={registros[indiceAtual].tema || ''}
                  onChange={manipularMudancaTexto}
                  className="campo-tema"
                  style={{ width: '50%', padding: 5, fontSize: 12, margin: 'auto' }}
                >
                  {temas.map((itemTema, i) => (
                    <option key={i} value={itemTema.tema}>
                      {itemTema.tema}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              {/* Área de texto para edição do enunciado da pergunta */}
              <Form.Group controlId="formPergunta">
                <Form.Label>Pergunta:</Form.Label>
                <Form.Control
                  as="textarea"
                  name="pergunta"
                  value={registros[indiceAtual].pergunta || ''}
                  onChange={manipularMudancaTexto}
                  className="campo-pergunta"
                  style={{ width: '53%', height: 60, padding: 5, fontSize: 12, margin: 'auto' }}
                />
              </Form.Group>

              {/* Gera dinamicamente os inputs de texto das alternativas A, B, C e D */}
              {['A', 'B', 'C', 'D'].map((opcao) => (
                <Form.Group key={opcao} controlId={`form${opcao}`}>
                  <Form.Label>{opcao}:</Form.Label>
                  <Form.Control
                    type="text"
                    name={opcao}
                    value={registros[indiceAtual][opcao] || ''}
                    onChange={manipularMudancaTexto}
                    className="campo-opcao"
                    style={{ width: '60%', padding: 5, fontSize: 12, margin: 'auto' }}
                  />
                </Form.Group>
              ))}

              {/* Campo de upload de novo arquivo de imagem */}
              <Form.Group controlId="formImagem">
                <Form.Label>Imagem:</Form.Label>
                <Form.Control
                  type="file"
                  ref={inputArquivoRef}
                  onChange={manipularMudancaImagem}
                  className="campo-imagem"
                  style={{ width: '60%', margin: 'auto' }}
                />
              </Form.Group>

              {/* Card visual de pré-visualização da imagem atual ou recém-carregada */}
              {urlPreviaImagem && (
                <div style={{ margin: '15px auto', display: 'inline-block' }}>
                  <img
                    src={urlPreviaImagem}
                    alt="Pré-visualização"
                    style={{
                      height: '200px',
                      width: '200px',
                      borderRadius: 100,
                      objectFit: 'cover',
                      display: 'block',
                      margin: '0 auto',
                      border: imagemSalvaSucesso ? '5px solid #28a745' : '3px solid #ccc',
                      boxShadow: imagemSalvaSucesso ? '0 0 15px rgba(40, 167, 69, 0.7)' : 'none',
                      transition: 'all 0.3s ease-in-out'
                    }}
                  />
                  {/* Mensagem de sucesso ao salvar a foto */}
                  {imagemSalvaSucesso && (
                    <div style={{ marginTop: 8, color: '#28a745', fontSize: '13pt', fontWeight: 'bold' }}>
                      ✓ Imagem salva com sucesso!
                    </div>
                  )}
                </div>
              )}

              {/* Seletor dropdown para definir a letra da alternativa correta */}
              <Form.Group controlId="formCorreta">
                <Form.Label>Correta:</Form.Label>
                <Form.Control
                  as="select"
                  name="correta"
                  value={registros[indiceAtual].correta || 'A'}
                  onChange={manipularMudancaTexto}
                  className="campo-correta"
                  style={{ width: '20%', margin: 'auto' }}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </Form.Control>
              </Form.Group>

              {/* Barra de botões de navegação e salvamento */}
              <div className="botoes-container" style={{ marginTop: 25, marginBottom: 20 }}>
                {/* Botão para voltar à questão anterior */}
                <Button
                  variant="secondary"
                  onClick={registroAnterior}
                  disabled={indiceAtual === 0}
                  style={{ marginRight: 10 }}
                >
                  Anterior
                </Button>

                {/* Botão para avançar para a próxima questão */}
                <Button
                  variant="secondary"
                  onClick={proximoRegistro}
                  disabled={indiceAtual === registros.length - 1}
                  style={{ marginRight: 10 }}
                >
                  Próximo
                </Button>

                {/* Botão para saltar diretamente para a última questão */}
                <Button
                  variant="dark"
                  onClick={ultimoRegistro}
                  disabled={indiceAtual === registros.length - 1}
                  style={{ marginRight: 10 }}
                >
                  Último
                </Button>

                {/* Botão de envio para gravar as alterações no servidor */}
                <Button
                  onClick={alterarRegistro}
                  className="btn-salvar-mobile"
                  style={{ fontSize: 20, padding: '5px 25px', color: 'white', backgroundColor: 'Green', border: 'none' }}
                >
                  Salvar Alterações
                </Button>
              </div>

              {/* Indicador textual de paginação/posição do registro atual */}
              <div style={{ fontSize: '12pt', marginTop: 15, color: '#666' }}>
                {indiceAtual + 1} de {registros.length} registros
              </div>
            </Form>
          ) : (
            // Mensagem apresentada quando a busca não retorna nenhum resultado
            <p style={{ marginTop: 30 }}>Nenhum registro encontrado.</p>
          )}

          {/* Componente de alerta dinâmico para feedbacks de sucesso ou erro das operações */}
          {mensagemFeedback.texto && (
            <Alert
              variant={mensagemFeedback.tipo || 'info'}
              style={{ width: '60%', margin: '20px auto', fontSize: 16 }}
            >
              {mensagemFeedback.texto}
            </Alert>
          )}
        </section>
      )}
    </div>
  );
};

// Exporta o componente Alterar como export padrão do módulo
export default Alterar;