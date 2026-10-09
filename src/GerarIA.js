// Importa o React e os hooks useState (gerenciamento de estados) e useEffect (efeitos colaterais)[cite: 6]
import React, { useState, useEffect } from 'react';

// Importa a biblioteca Axios para realizar requisições HTTP para a API[cite: 6]
import axios from 'axios';

// Importa os componentes visuais reutilizáveis do React-Bootstrap[cite: 6]
import { Form, Button, Alert } from 'react-bootstrap';

// Importa a folha de estilos personalizada do projeto[cite: 6]
import './interface.css';

// Importa a imagem estática da torta[cite: 6]
import imagemTorta from './img/torta.webp';

// Importa a animação GIF de Paulo Freire[cite: 6]
import imagemPaulo from './img/pauloFreire.gif';

// Obtém o endereço base da API a partir do .env do React ou recorre ao fallback local na porta 3042[cite: 6]
const URL_API = process.env.REACT_APP_API_URL || 'http://localhost:3042';

// Declara o componente funcional GerarIA[cite: 6]
const GerarIA = () => {
  // Estado para armazenar o usuário digitado no login[cite: 6]
  const [usuario, setUsuario] = useState('');

  // Estado para armazenar a senha digitada no login[cite: 6]
  const [senha, setSenha] = useState('');

  // Estado booleano que define se o usuário está autenticado no painel[cite: 6]
  const [autenticado, setAutenticado] = useState(false);

  // Estado para guardar mensagens de erro na autenticação[cite: 6]
  const [mensagemErroLogin, setMensagemErroLogin] = useState('');

  // Estado que gerencia a fase visual atual da tela ('formulario', 'revisao' ou 'concluido')[cite: 6]
  const [etapa, setEtapa] = useState('formulario');

  // Estado que lista os temas existentes buscados no banco de dados[cite: 6]
  const [listaTemasExistentes, setListaTemasExistentes] = useState([]);

  // Estado para armazenar o tema selecionado no menu dropdown[cite: 6]
  const [temaSelecionado, setTemaSelecionado] = useState('');

  // Estado para armazenar o novo tema digitado manualmente pelo usuário[cite: 6]
  const [novoTema, setNovoTema] = useState('');

  // Estado para armazenar o prompt/instruções adicionais digitadas para guiar a IA[cite: 6]
  const [promptUsuario, setPromptUsuario] = useState('');

  // Estado para guardar o número de questões a serem geradas (padrão inicial: 1)[cite: 6]
  const [quantidadeDesejada, setQuantidadeDesejada] = useState(1);

  // Estado booleano que indica se a chamada à API da IA está em andamento[cite: 6]
  const [carregandoIA, setCarregandoIA] = useState(false);

  // Estado que guarda o array de questões geradas retornadas pela IA[cite: 6]
  const [questoesSugeridas, setQuestoesSugeridas] = useState([]);

  // Estado para rastrear o índice da questão sendo revisada no momento[cite: 6]
  const [indiceAtual, setIndiceAtual] = useState(0);

  // Estado para o arquivo de imagem selecionado localmente durante a revisão da questão[cite: 6]
  const [arquivoImagem, setArquivoImagem] = useState(null);

  // Estado para guardar a URL temporária de pré-visualização da imagem enviada[cite: 6]
  const [urlPreviaImagem, setUrlPreviaImagem] = useState(null);

  // Contador de questões aprovadas e salvas com sucesso no banco[cite: 6]
  const [contadorInseridas, setContadorInseridas] = useState(0);

  // Contador de questões rejeitadas/descartadas pelo usuário[cite: 6]
  const [contadorDescartadas, setContadorDescartadas] = useState(0);

  // Contador de questões aprovadas e salvas que não possuíam imagem associada[cite: 6]
  const [contadorSemImagem, setContadorSemImagem] = useState(0);

  // Estado para exibir avisos e mensagens de feedback na interface[cite: 6]
  const [mensagemFeedback, setMensagemFeedback] = useState('');

  // Função que trata a tentativa de login do usuário[cite: 6]
  const manipularEnvioLogin = (evento) => {
    // Evita o comportamento padrão do navegador de recarregar a página[cite: 6]
    evento.preventDefault();

    // Valida as credenciais administrativas fixas[cite: 6]
    if (usuario === 'etecembu' && senha === 'etec@241') {
      // Define status de autenticado como verdadeiro[cite: 6]
      setAutenticado(true);
      // Limpa mensagem de erro caso existisse[cite: 6]
      setMensagemErroLogin('');
    } else {
      // Exibe mensagem de erro caso o login falhe[cite: 6]
      setMensagemErroLogin('Usuário ou senha inválidos!');
    }
  };

  // Efeito disparado quando o estado 'autenticado' muda[cite: 6]
  useEffect(() => {
    // Se não estiver logado, não executa a busca[cite: 6]
    if (!autenticado) return;

    // Função interna assíncrona para buscar os temas disponíveis na API[cite: 6]
    const buscarTemas = async () => {
      try {
        // Envia requisição GET para obter os temas salvos[cite: 6]
        const resposta = await axios.get(`${URL_API}/temas`);
        // Se a resposta for um array, armazena no estado da lista de temas[cite: 6]
        if (Array.isArray(resposta.data)) {
          setListaTemasExistentes(resposta.data);
        }
      } catch (erro) {
        // Loga erro no console caso a requisição falhe[cite: 6]
        console.error('Erro ao buscar temas:', erro);
      }
    };

    // Executa a busca dos temas[cite: 6]
    buscarTemas();
  }, [autenticado]);

  // Função disparada no envio do formulário de geração com IA[cite: 6]
  const manipularGeracaoQuestoes = async (evento) => {
    // Previne a submissão nativa da página[cite: 6]
    evento.preventDefault();

    // Prioriza o novo tema digitado; se estiver vazio, adota o tema do select[cite: 6]
    const temaFinal = novoTema.trim() !== '' ? novoTema.trim() : temaSelecionado;

    // Valida se algum tema foi definido[cite: 6]
    if (!temaFinal) {
      setMensagemFeedback('Por favor, selecione um tema ou digite um novo tema.');
      return;
    }

    // Valida se o prompt de instruções foi preenchido[cite: 6]
    if (!promptUsuario.trim()) {
      setMensagemFeedback('Por favor, informe as instruções/prompt para a IA.');
      return;
    }

    try {
      // Ativa o status de carregamento da IA[cite: 6]
      setCarregandoIA(true);
      // Limpa qualquer mensagem de feedback anterior[cite: 6]
      setMensagemFeedback('');

      // Envia os parâmetros em requisição POST para o endpoint do backend /gerar-questoes[cite: 6]
      const resposta = await axios.post(`${URL_API}/gerar-questoes`, {
        tema: temaFinal,
        promptUsuario,
        quantidade: quantidadeDesejada
      });

      // Valida se o retorno é uma lista com questões válidas[cite: 6]
      if (Array.isArray(resposta.data) && resposta.data.length > 0) {
        // Guarda as questões sugeridas no estado[cite: 6]
        setQuestoesSugeridas(resposta.data);
        // Reseta o índice de visualização para a primeira questão gerada[cite: 6]
        setIndiceAtual(0);
        // Limpa referências de imagem anteriores[cite: 6]
        setArquivoImagem(null);
        setUrlPreviaImagem(null);
        // Zera os contadores da rodada de revisão[cite: 6]
        setContadorInseridas(0);
        setContadorDescartadas(0);
        setContadorSemImagem(0);
        // Muda para a etapa de revisão das perguntas[cite: 6]
        setEtapa('revisao');
      } else {
        // Alerta caso a IA retorne uma lista vazia ou inválida[cite: 6]
        setMensagemFeedback('A IA não retornou nenhuma questão válida.');
      }
    } catch (erro) {
      // Imprime o erro no console e exibe mensagem amigável com a falha na tela[cite: 6]
      console.error(erro);
      setMensagemFeedback(`Erro na geração: ${erro.response?.data?.message || erro.message}`);
    } finally {
      // Desativa o indicador de processamento da IA[cite: 6]
      setCarregandoIA(false);
    }
  };

  // Trata o carregamento de uma foto local no input de arquivo[cite: 6]
  const manipularMudancaImagem = (evento) => {
    // Obtém o primeiro arquivo selecionado[cite: 6]
    const arquivo = evento.target.files[0];
    if (arquivo) {
      // Armazena o arquivo binário no estado[cite: 6]
      setArquivoImagem(arquivo);
      // Cria e atribui a URL temporária de objeto para pré-visualização[cite: 6]
      setUrlPreviaImagem(URL.createObjectURL(arquivo));
    }
  };

  // Trata alterações feitas manualmente nos campos de texto da pergunta sugerida[cite: 6]
  const manipularEdicaoTexto = (evento) => {
    // Desestrutura nome do campo alterado e o novo valor digitado[cite: 6]
    const { name, value } = evento.target;

    // Atualiza a questão do índice atual mantendo a imutabilidade do array[cite: 6]
    setQuestoesSugeridas((anterior) => {
      const copia = [...anterior];
      copia[indiceAtual] = { ...copia[indiceAtual], [name]: value };
      return copia;
    });
  };

  // Função utilitária para avançar a fila de revisão ou concluir a rodada[cite: 6]
  const prosseguirFila = (foiInserida, semFoto = false) => {
    // Se a questão foi salva, incrementa o total aprovado e o contador de imagens ausentes, se aplicável[cite: 6]
    if (foiInserida) {
      setContadorInseridas((prev) => prev + 1);
      if (semFoto) setContadorSemImagem((prev) => prev + 1);
    } else {
      // Se não, incrementa a contagem de descartes[cite: 6]
      setContadorDescartadas((prev) => prev + 1);
    }

    // Se ainda houver questões pendentes no array, avança para a próxima da lista[cite: 6]
    if (indiceAtual < questoesSugeridas.length - 1) {
      setIndiceAtual((prev) => prev + 1);
      // Reseta a seleção da imagem para a próxima questão[cite: 6]
      setArquivoImagem(null);
      setUrlPreviaImagem(null);
    } else {
      // Se era a última pergunta, encerra a fila e vai para o resumo final[cite: 6]
      setEtapa('concluido');
    }
  };

  // Função assíncrona para aprovar e gravar a questão atual no MySQL via backend[cite: 6]
  const aprovarEInserir = async () => {
    try {
      // Pega os dados atuais da questão em revisão[cite: 6]
      const questao = questoesSugeridas[indiceAtual];

      // Instancia o objeto FormData para envio de dados com suporte a upload de arquivo[cite: 6]
      const dadosFormulario = new FormData();

      // Adiciona todos os campos de texto da questão ao formulário multipart[cite: 6]
      dadosFormulario.append('tema', questao.tema);
      dadosFormulario.append('pergunta', questao.pergunta);
      dadosFormulario.append('A', questao.A);
      dadosFormulario.append('B', questao.B);
      dadosFormulario.append('C', questao.C);
      dadosFormulario.append('D', questao.D);
      dadosFormulario.append('correta', questao.correta);

      // Sinaliza se a questão foi salva sem anexar uma foto[cite: 6]
      const semFoto = !arquivoImagem;

      // Adiciona o binário do arquivo ao FormData caso tenha sido anexado[cite: 6]
      if (arquivoImagem) {
        dadosFormulario.append('imagem', arquivoImagem);
      }

      // Envia a requisição POST para persistir o novo registro na rota /insert[cite: 6]
      await axios.post(`${URL_API}/insert`, dadosFormulario, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Avança a fila informando que a questão foi aprovada[cite: 6]
      prosseguirFila(true, semFoto);
    } catch (erro) {
      // Trata possíveis falhas de inserção no banco de dados[cite: 6]
      console.error(erro);
      setMensagemFeedback(`Erro ao salvar no banco: ${erro.response?.data?.message || erro.message}`);
    }
  };

  // Renderização visual do componente[cite: 6]
  return (
    <div className="Interface">
      {/* Cabeçalho da aplicação com os logotipos e identificação do evento */}
      <header>
        <img className="imgFoto" src={imagemTorta} alt="Torta na Cara" />
        <div className="tituloHeader">
          <h1>TORTA NA CARA</h1>
          <h2>Semana Paulo Freire</h2>
        </div>
        <img className="imgPaulo" src={imagemPaulo} alt="Paulo Freire" />
      </header>

      {/* Condicional de exibição: Tela de login ou Painel de geração */}
      {!autenticado ? (
        <div className="login-wrapper">
          <div className="login-card">
            <h2>Acesso ao Gerador com IA</h2>
            {/* Formulário para inserção de credenciais de acesso[cite: 6] */}
            <Form onSubmit={manipularEnvioLogin} className="login-form">
              {/* Campo para preenchimento do usuário de login[cite: 6] */}
              <Form.Group controlId="loginUsuario" className="login-group">
                <Form.Label className="login-label">Usuário:</Form.Label>
                <Form.Control
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Informe seu usuário"
                  className="login-input"
                />
              </Form.Group>

              {/* Campo para preenchimento da senha de acesso[cite: 6] */}
              <Form.Group controlId="loginSenha" className="login-group">
                <Form.Label className="login-label">Senha:</Form.Label>
                <Form.Control
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Informe sua senha"
                  className="login-input"
                />
              </Form.Group>

              {/* Botão para submeter o formulário de login[cite: 6] */}
              <Button type="submit" className="login-btn">
                Entrar
              </Button>

              {/* Alerta de erro de autenticação caso as credenciais estejam erradas[cite: 6] */}
              {mensagemErroLogin && (
                <Alert variant="danger" className="login-alert">
                  {mensagemErroLogin}
                </Alert>
              )}
            </Form>
          </div>
        </div>
      ) : (
        // Painel administrativo liberado após o login[cite: 6]
        <section className="admin-section">
          {/* ETAPA 1: Formulário inicial de configuração para geração com IA[cite: 6] */}
          {etapa === 'formulario' && (
            <Form onSubmit={manipularGeracaoQuestoes}>
              <h2 style={{ marginBottom: 20, fontSize: '18pt' }}>Gerar Questões com IA</h2>

              {/* Dropdown com a lista de temas já existentes no banco[cite: 6] */}
              <Form.Group style={{ marginBottom: 15 }}>
                <Form.Label>Tema Existente:</Form.Label>
                <Form.Control
                  as="select"
                  value={temaSelecionado}
                  onChange={(e) => {
                    setTemaSelecionado(e.target.value);
                    // Limpa o campo de novo tema caso um existente seja escolhido[cite: 6]
                    if (e.target.value) setNovoTema('');
                  }}
                  className="campo-tema"
                  style={{ width: '50%', padding: 5, fontSize: 12, margin: 'auto' }}
                >
                  <option value="">Selecione um tema...</option>
                  {/* Mapeia os temas salvos para o elemento select[cite: 6] */}
                  {listaTemasExistentes.map((t, i) => (
                    <option key={i} value={t.tema}>
                      {t.tema}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              {/* Campo para inserção de um novo tema inédito[cite: 6] */}
              <Form.Group style={{ marginBottom: 15 }}>
                <Form.Label>Ou Novo Tema:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ex.: Redes de Computadores"
                  value={novoTema}
                  onChange={(e) => {
                    setNovoTema(e.target.value);
                    // Limpa a seleção do dropdown caso comece a digitar um tema novo[cite: 6]
                    if (e.target.value) setTemaSelecionado('');
                  }}
                  className="campo-tema"
                  style={{ width: '50%', padding: 5, fontSize: 12, margin: 'auto' }}
                />
              </Form.Group>

              {/* Área de texto para o usuário digitar instruções personalizadas para o prompt[cite: 6] */}
              <Form.Group style={{ marginBottom: 15 }}>
                <Form.Label>Instruções / Prompt:</Form.Label>
                <Form.Control
                  as="textarea"
                  value={promptUsuario}
                  onChange={(e) => setPromptUsuario(e.target.value)}
                  className="campo-pergunta"
                  style={{ width: '53%', height: 60, padding: 5, fontSize: 12, margin: 'auto' }}
                />
              </Form.Group>

              {/* Seletor dropdown para definir quantas perguntas a IA deve criar (1 a 10)[cite: 6] */}
              <Form.Group style={{ marginBottom: 20 }}>
                <Form.Label>Quantidade:</Form.Label>
                <Form.Control
                  as="select"
                  value={quantidadeDesejada}
                  onChange={(e) => setQuantidadeDesejada(Number(e.target.value))}
                  className="campo-correta"
                  style={{ width: '20%', margin: 'auto', padding: 5, fontSize: 12 }}
                >
                  {/* Gera opções numéricas de 1 até 10 dinamicamente[cite: 6] */}
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              {/* Botão para submeter a requisição e consultar a IA[cite: 6] */}
              <Button
                variant="primary"
                type="submit"
                disabled={carregandoIA} // Desabilita enquanto a requisição estiver ocorrendo[cite: 6]
                className="btn-salvar-mobile"
                style={{ fontSize: 22, padding: '5px 25px', color: 'white', backgroundColor: 'Green', border: 'none' }}
              >
                {/* Altera o rótulo do botão caso o processo esteja em andamento[cite: 6] */}
                {carregandoIA ? 'Consultando IA...' : 'Gerar com IA'}
              </Button>
            </Form>
          )}

          {/* ETAPA 2: Interface de revisão das perguntas geradas pela IA[cite: 6] */}
          {etapa === 'revisao' && questoesSugeridas.length > 0 && (
            <Form>
              {/* Título com indicador de posição da questão dentro da fila de revisão[cite: 6] */}
              <div style={{ marginBottom: 10, fontSize: '14pt', color: '#004A8D' }}>
                Revisão da Sugestão {indiceAtual + 1} de {questoesSugeridas.length}
              </div>

              {/* Campo para editar o tema gerado pela IA[cite: 6] */}
              <Form.Group controlId="formTema" style={{ marginBottom: 15 }}>
                <Form.Label>Tema:</Form.Label>
                <Form.Control
                  type="text"
                  name="tema"
                  value={questoesSugeridas[indiceAtual].tema}
                  onChange={manipularEdicaoTexto}
                  className="campo-tema"
                  style={{ width: '50%', padding: 5, fontSize: 12, margin: 'auto' }}
                />
              </Form.Group>

              {/* Área de texto para editar o enunciado da pergunta sugerida[cite: 6] */}
              <Form.Group controlId="formPergunta">
                <Form.Label>Pergunta:</Form.Label>
                <Form.Control
                  as="textarea"
                  name="pergunta"
                  value={questoesSugeridas[indiceAtual].pergunta}
                  onChange={manipularEdicaoTexto}
                  className="campo-pergunta"
                  style={{ width: '53%', height: 60, padding: 5, fontSize: 12, margin: 'auto' }}
                />
              </Form.Group>

              {/* Mapeia os inputs de edição para cada uma das alternativas (A, B, C, D)[cite: 6] */}
              {['A', 'B', 'C', 'D'].map((letra) => (
                <Form.Group key={letra} controlId={`form${letra}`}>
                  <Form.Label>{letra}:</Form.Label>
                  <Form.Control
                    type="text"
                    name={letra}
                    value={questoesSugeridas[indiceAtual][letra]}
                    onChange={manipularEdicaoTexto}
                    className="campo-opcao"
                    style={{ width: '60%', padding: 5, fontSize: 12, margin: 'auto' }}
                  />
                </Form.Group>
              ))}

              {/* Input file para associar opcionalmente uma foto à questão[cite: 6] */}
              <Form.Group controlId="formImagem">
                <Form.Label>Imagem (Opcional):</Form.Label>
                <Form.Control
                  type="file"
                  onChange={manipularMudancaImagem}
                  className="campo-imagem"
                  style={{ width: '60%', margin: 'auto' }}
                />
              </Form.Group>

              {/* Exibe a pré-visualização da imagem se houver arquivo selecionado[cite: 6] */}
              {urlPreviaImagem && (
                <img
                  src={urlPreviaImagem}
                  alt="Prévia"
                  style={{ height: '200px', width: '200px', borderRadius: 100, margin: '15px auto', display: 'block', objectFit: 'cover' }}
                />
              )}

              {/* Dropdown para alterar ou definir qual é a alternativa correta[cite: 6] */}
              <Form.Group controlId="formCorreta">
                <Form.Label>Correta:</Form.Label>
                <Form.Control
                  as="select"
                  name="correta"
                  value={questoesSugeridas[indiceAtual].correta}
                  onChange={manipularEdicaoTexto}
                  className="campo-correta"
                  style={{ width: '20%', margin: 'auto' }}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </Form.Control>
              </Form.Group>

              {/* Botões de controle da fila de revisão[cite: 6] */}
              <div className="botoes-container" style={{ marginTop: 25, marginBottom: 20 }}>
                {/* Botão para retornar à questão anterior da lista[cite: 6] */}
                <Button
                  variant="secondary"
                  onClick={() => indiceAtual > 0 && setIndiceAtual((p) => p - 1)}
                  disabled={indiceAtual === 0}
                  style={{ marginRight: 10 }}
                >
                  Anterior
                </Button>

                {/* Botão para descartar a questão sem salvar no banco[cite: 6] */}
                <Button
                  variant="danger"
                  onClick={() => prosseguirFila(false)}
                  style={{ marginRight: 10, padding: '5px 15px' }}
                >
                  Descartar ❌
                </Button>

                {/* Botão para persistir a questão no banco e avançar a fila[cite: 6] */}
                <Button
                  variant="success"
                  onClick={aprovarEInserir}
                  className="btn-salvar-mobile"
                  style={{ fontSize: 20, padding: '5px 20px', color: 'white', backgroundColor: 'Green', border: 'none' }}
                >
                  Aprovar e Inserir ✅
                </Button>
              </div>
            </Form>
          )}

          {/* ETAPA 3: Relatório de conclusão exibido ao terminar a fila[cite: 6] */}
          {etapa === 'concluido' && (
            <div style={{ marginTop: '20px', padding: '25px', backgroundColor: '#fcffab', borderRadius: 20, width: '100%', maxWidth: 700, margin: '20px auto' }}>
              <h2 style={{ color: '#004A8D', marginBottom: 20 }}>Não existem mais registros!</h2>
              <p style={{ fontSize: '16pt' }}>📊 <strong>Relatório da Sessão:</strong></p>
              {/* Exibe o total de questões salvas no banco de dados[cite: 6] */}
              <p style={{ color: 'green' }}>✅ Questões aprovadas: <strong>{contadorInseridas}</strong></p>
              {/* Exibe o total de questões rejeitadas[cite: 6] */}
              <p style={{ color: 'red' }}>❌ Questões descartadas: <strong>{contadorDescartadas}</strong></p>

              {/* Alerta indicando se houve questões aprovadas sem imagens[cite: 6] */}
              {contadorSemImagem > 0 ? (
                <Alert variant="warning" style={{ width: '85%', margin: '20px auto', fontSize: '13pt' }}>
                  ⚠️ {contadorSemImagem} questão(ões) inserida(s) sem imagem.
                </Alert>
              ) : (
                <Alert variant="success" style={{ width: '85%', margin: '20px auto', fontSize: '13pt' }}>
                  🎉 Todas as questões inseridas possuem imagem associada!
                </Alert>
              )}

              {/* Botão para resetar os estados e permitir uma nova geração[cite: 6] */}
              <Button
                variant="primary"
                onClick={() => {
                  setEtapa('formulario');
                  setQuestoesSugeridas([]);
                  setPromptUsuario('');
                  setNovoTema('');
                }}
                className="btn-salvar-mobile"
                style={{ marginTop: 20, fontSize: 18, padding: '8px 25px', backgroundColor: '#004A8D', border: 'none' }}
              >
                Criar Nova Rodada
              </Button>
            </div>
          )}

          {/* Alerta para mensagens gerais de aviso e erro na tela[cite: 6] */}
          {mensagemFeedback && (
            <Alert variant="info" style={{ marginTop: 20, fontSize: 14 }}>
              {mensagemFeedback}
            </Alert>
          )}
        </section>
      )}
    </div>
  );
};

// Exporta o componente GerarIA como padrão do módulo[cite: 6]
export default GerarIA;