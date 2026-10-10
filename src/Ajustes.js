// Importa o arquivo de estilos CSS específico para os elementos visuais deste componente
import './interface.css';

// Importa o React e os hooks necessários para controle de estados, memorização e ciclo de vida
import React, { useState, useEffect, useRef, useCallback } from 'react';

// Importa a biblioteca Axios para realizar chamadas HTTP à API do backend
import axios from 'axios';

// Importa componentes reutilizáveis do React-Bootstrap
import { Form, Button, Alert, Table, Spinner, Badge, Card } from 'react-bootstrap';

// Importa a imagem estática da torta usada no cabeçalho
import imagemTorta from './img/torta.webp';

// Importa a imagem em GIF de Paulo Freire para o cabeçalho
import imagemPaulo from './img/pauloFreire.gif';

// Define a URL base da API (lendo do .env ou usando localhost:3042 como padrão)
const URL_API = process.env.REACT_APP_API_URL || 'http://localhost:3042';

// Declaração do componente funcional principal da interface de ajustes
const Ajustes = () => {
  // Estado para armazenar o valor digitado no campo de usuário do login
  const [usuario, setUsuario] = useState('');

  // Estado para armazenar o valor digitado no campo de senha do login
  const [senha, setSenha] = useState('');

  // Estado booleano que define se o usuário está logado e pode ver os ajustes
  const [autenticado, setAutenticado] = useState(false);

  // Estado para guardar a mensagem de erro em caso de credenciais inválidas
  const [mensagemErroLogin, setMensagemErroLogin] = useState('');

  // Controla qual aba está visível: 'temas', 'auditoria', 'semFoto' ou 'imagens'
  const [abaAtiva, setAbaAtiva] = useState('semFoto');

  // =========================================================================
  // ESTADOS DA ABA 1: REDUÇÃO DE TEMAS COM IA
  // =========================================================================
  const [temasCadastrados, setTemasCadastrados] = useState([]);
  const [sugestoesIa, setSugestoesIa] = useState([]);
  const [itensSelecionados, setItensSelecionados] = useState({});
  const [carregandoIa, setCarregandoIa] = useState(false);
  const [executandoAlteracao, setExecutandoAlteracao] = useState(false);

  // =========================================================================
  // ESTADOS DA ABA 2: AUDITORIA PEDAGÓGICA DE QUESTÕES
  // =========================================================================
  const [auditoriaQuestoes, setAuditoriaQuestoes] = useState([]);
  const [carregandoAuditoria, setCarregandoAuditoria] = useState(false);
  const [questoesCorrigidas, setQuestoesCorrigidas] = useState({});
  const [salvandoQuestaoId, setSalvandoQuestaoId] = useState(null);

  // =========================================================================
  // ESTADOS DA ABA 3: PERCORRER E ADICIONAR FOTOS PENDENTES
  // =========================================================================
  const [questoesSemFoto, setQuestoesSemFoto] = useState([]);
  const [indiceSemFoto, setIndiceSemFoto] = useState(0);
  const [arquivoFoto, setArquivoFoto] = useState(null);
  const [previaFoto, setPreviaFoto] = useState(null);
  const [salvandoFoto, setSalvandoFoto] = useState(false);
  const inputArquivoRef = useRef(null);

  // =========================================================================
  // ESTADOS GERAIS E OTIMIZAÇÃO EM LOTE
  // =========================================================================
  const [otimizandoImagens, setOtimizandoImagens] = useState(false);
  const [feedback, setFeedback] = useState({ tipo: '', texto: '' });

  // Função que trata a autenticação administrativa padrão
  const manipularEnvioLogin = (evento) => {
    evento.preventDefault();
    if (usuario === 'etecembu' && senha === 'etec@241') {
      setAutenticado(true);
      setMensagemErroLogin('');
    } else {
      setMensagemErroLogin('Usuário ou senha inválidos!');
    }
  };

  // Carrega temas do banco memorizado com useCallback
  const carregarTemas = useCallback(async () => {
    try {
      const resposta = await axios.get(`${URL_API}/temas`);
      setTemasCadastrados(resposta.data);
    } catch (erro) {
      console.error('Erro ao buscar temas:', erro);
    }
  }, []);

  // Limpa o arquivo selecionado e revoga URL temporária
  const limparPreviaArquivo = useCallback(() => {
    if (previaFoto) URL.revokeObjectURL(previaFoto);
    setArquivoFoto(null);
    setPreviaFoto(null);
    if (inputArquivoRef.current) inputArquivoRef.current.value = '';
  }, [previaFoto]);

  // Carrega lista exclusiva de perguntas sem imagem memorizado com useCallback
  const carregarQuestoesSemFoto = useCallback(async () => {
    try {
      const resposta = await axios.get(`${URL_API}/ajustes/questoes-sem-foto`);
      setQuestoesSemFoto(resposta.data);
      setIndiceSemFoto(0);
      limparPreviaArquivo();
    } catch (erro) {
      console.error('Erro ao carregar questões sem foto:', erro);
    }
  }, [limparPreviaArquivo]);

  // Dispara carregamentos iniciais após o login com dependências declaradas corretamente
  useEffect(() => {
    if (autenticado) {
      carregarTemas();
      carregarQuestoesSemFoto();
    }
  }, [autenticado, carregarTemas, carregarQuestoesSemFoto]);

  // Trata a seleção de arquivo no input file da questão
  const manipularMudancaFoto = (evento) => {
    const arquivo = evento.target.files[0];
    if (arquivo) {
      if (previaFoto) URL.revokeObjectURL(previaFoto);
      setArquivoFoto(arquivo);
      setPreviaFoto(URL.createObjectURL(arquivo));
    }
  };

  // Envia a foto da questão atual para o backend e avança para a próxima
  const salvarFotoQuestaoAtual = async () => {
    if (!arquivoFoto) {
      setFeedback({ tipo: 'warning', texto: 'Selecione uma imagem antes de salvar.' });
      return;
    }

    const questaoAtual = questoesSemFoto[indiceSemFoto];
    if (!questaoAtual) return;

    setSalvandoFoto(true);
    setFeedback({ tipo: '', texto: '' });

    const formData = new FormData();
    formData.append('imagem', arquivoFoto);

    try {
      await axios.post(`${URL_API}/ajustes/vincular-foto/${questaoAtual.numero}`, formData);

      setFeedback({
        tipo: 'success',
        texto: `Foto vinculada e otimizada com sucesso para a Questão Nº ${questaoAtual.numero}!`
      });

      // Remove a questão salva da lista pendente local
      const listaAtualizada = questoesSemFoto.filter((_, idx) => idx !== indiceSemFoto);
      setQuestoesSemFoto(listaAtualizada);

      // Ajusta o ponteiro de índice para não estourar a lista
      if (indiceSemFoto >= listaAtualizada.length && listaAtualizada.length > 0) {
        setIndiceSemFoto(listaAtualizada.length - 1);
      }

      limparPreviaArquivo();
    } catch (erro) {
      console.error(erro);
      setFeedback({
        tipo: 'danger',
        texto: `Falha ao salvar foto da Questão Nº ${questaoAtual.numero}: ${erro.response?.data?.message || erro.message}`
      });
    } finally {
      setSalvandoFoto(false);
    }
  };

  // =========================================================================
  // FUNÇÕES DE TEMAS E AUDITORIA
  // =========================================================================
  const dispararAnaliseIa = async () => {
    setCarregandoIa(true);
    setFeedback({ tipo: '', texto: '' });
    try {
      const resposta = await axios.post(`${URL_API}/ajustes/analisar-temas`);
      const { temasCadastrados: temasBanco, sugestoes } = resposta.data;
      setTemasCadastrados(temasBanco);
      setSugestoesIa(sugestoes);

      const selecaoInicial = {};
      sugestoes.forEach((_, index) => { selecaoInicial[index] = true; });
      setItensSelecionados(selecaoInicial);

      setFeedback({
        tipo: 'success',
        texto: `Análise concluída! ${sugestoes.length} sugestão(ões) de temas encontradas.`
      });
    } catch (erro) {
      setFeedback({ tipo: 'danger', texto: `Erro na análise: ${erro.message}` });
    } finally {
      setCarregandoIa(false);
    }
  };

  const alternarSelecao = (indice) => {
    setItensSelecionados((ant) => ({ ...ant, [indice]: !ant[indice] }));
  };

  const aplicarAlteracoesTemas = async () => {
    const alteracoesParaAplicar = sugestoesIa
      .filter((_, index) => itensSelecionados[index])
      .map((item) => ({ temaAntigo: item.temaAntigo, temaProposto: item.temaProposto }));

    if (alteracoesParaAplicar.length === 0) return;

    setExecutandoAlteracao(true);
    try {
      const res = await axios.post(`${URL_API}/ajustes/aplicar-temas`, { alteracoes: alteracoesParaAplicar });
      setFeedback({ tipo: 'success', texto: `${res.data.message} ${res.data.linhasAfetadas} questões ajustadas!` });
      setSugestoesIa([]);
      setItensSelecionados({});
      await carregarTemas();
    } catch (erro) {
      setFeedback({ tipo: 'danger', texto: `Erro ao aplicar: ${erro.message}` });
    } finally {
      setExecutandoAlteracao(false);
    }
  };

  const dispararAuditoriaQuestoes = async () => {
    setCarregandoAuditoria(true);
    setFeedback({ tipo: '', texto: '' });
    try {
      const resposta = await axios.post(`${URL_API}/ajustes/auditar-questoes`);
      setAuditoriaQuestoes(resposta.data.questoesComProblemas);
      setFeedback({
        tipo: 'info',
        texto: `Auditoria concluída! ${resposta.data.questoesComProblemas.length} questão(ões) com observações.`
      });
    } catch (erro) {
      setFeedback({ tipo: 'danger', texto: `Erro na auditoria: ${erro.message}` });
    } finally {
      setCarregandoAuditoria(false);
    }
  };

  const aplicarCorrecaoQuestao = async (itemAuditoria) => {
    const { numero, sugestao } = itemAuditoria;
    if (!sugestao) return;

    setSalvandoQuestaoId(numero);
    try {
      await axios.post(`${URL_API}/ajustes/aplicar-correcao-questao`, {
        numero,
        tema: sugestao.tema,
        pergunta: sugestao.pergunta,
        A: sugestao.A,
        B: sugestao.B,
        C: sugestao.C,
        D: sugestao.D,
        correta: sugestao.correta
      });

      setQuestoesCorrigidas((ant) => ({ ...ant, [numero]: true }));
      setFeedback({ tipo: 'success', texto: `Questão Nº ${numero} corrigida na base!` });
    } catch (erro) {
      setFeedback({ tipo: 'danger', texto: `Erro ao salvar: ${erro.message}` });
    } finally {
      setSalvandoQuestaoId(null);
    }
  };

  const dispararOtimizacaoImagens = async () => {
    setOtimizandoImagens(true);
    setFeedback({ tipo: '', texto: '' });
    try {
      const resposta = await axios.post(`${URL_API}/ajustes/otimizar-imagens`);
      setFeedback({ tipo: 'success', texto: `${resposta.data.message} ${resposta.data.totalProcessadas} imagens otimizadas!` });
    } catch (erro) {
      setFeedback({ tipo: 'danger', texto: `Erro: ${erro.message}` });
    } finally {
      setOtimizandoImagens(false);
    }
  };

  const questaoSemFotoAtual = questoesSemFoto[indiceSemFoto];

  return (
    <div className="Interface">
      <header>
        <img className="imgFoto" src={imagemTorta} alt="Torta na Cara" />
        <div className="tituloHeader">
          <h1>TORTA NA CARA</h1>
          <h2>Ajustes, Fotos e Otimização</h2>
        </div>
        <img className="imgPaulo" src={imagemPaulo} alt="Paulo Freire" />
      </header>

      {!autenticado ? (
        <div className="login-wrapper">
          <div className="login-card">
            <h2>Acesso aos Ajustes</h2>
            <Form onSubmit={manipularEnvioLogin} className="login-form">
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

              <Button type="submit" className="login-btn">Entrar</Button>

              {mensagemErroLogin && (
                <Alert variant="danger" className="login-alert">{mensagemErroLogin}</Alert>
              )}
            </Form>
          </div>
        </div>
      ) : (
        <section className="admin-section" style={{ minHeight: '80vh', paddingBottom: 50 }}>
          {/* Navegação entre as 4 Abas */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant={abaAtiva === 'semFoto' ? 'primary' : 'secondary'}
              onClick={() => { setAbaAtiva('semFoto'); carregarQuestoesSemFoto(); }}
              style={{ fontSize: 16, fontWeight: 'bold' }}
            >
              📸 Adicionar Fotos Faltantes ({questoesSemFoto.length})
            </Button>
            <Button
              variant={abaAtiva === 'temas' ? 'primary' : 'secondary'}
              onClick={() => setAbaAtiva('temas')}
              style={{ fontSize: 16, fontWeight: 'bold' }}
            >
              🏷️ Redução de Temas
            </Button>
            <Button
              variant={abaAtiva === 'auditoria' ? 'primary' : 'secondary'}
              onClick={() => setAbaAtiva('auditoria')}
              style={{ fontSize: 16, fontWeight: 'bold' }}
            >
              🔍 Auditoria & Revisão
            </Button>
            <Button
              variant={abaAtiva === 'imagens' ? 'primary' : 'secondary'}
              onClick={() => setAbaAtiva('imagens')}
              style={{ fontSize: 16, fontWeight: 'bold' }}
            >
              🖼️ Otimizar Todas as Imagens
            </Button>
          </div>

          {feedback.texto && (
            <Alert variant={feedback.tipo || 'info'} style={{ width: '100%', fontSize: 16 }}>
              {feedback.texto}
            </Alert>
          )}

          {/* ================================================================= */}
          {/* ABA DEDICADA: PERCORRER PERGUNTAS SEM FOTO                        */}
          {/* ================================================================= */}
          {abaAtiva === 'semFoto' && (
            <div style={{ width: '100%' }}>
              <div
                style={{
                  backgroundColor: '#fcffab',
                  borderRadius: 20,
                  padding: 25,
                  width: '100%',
                  boxShadow: '4px 4px 12px rgba(0,0,0,0.15)',
                  marginBottom: 20
                }}
              >
                <h3 style={{ margin: '0 0 10px 0', color: '#004A8D' }}>
                  Questões Pendentes de Imagem ({questoesSemFoto.length} restantes)
                </h3>
                <p style={{ fontSize: '13pt', color: '#444', margin: 0 }}>
                  Percorra as questões que ainda não têm imagem, selecione o arquivo e salve. A imagem é automaticamente redimensionada para 400x400 e otimizada.
                </p>
              </div>

              {questoesSemFoto.length > 0 && questaoSemFotoAtual ? (
                <Card
                  style={{
                    backgroundColor: '#fcffab',
                    borderRadius: 20,
                    padding: 25,
                    boxShadow: '4px 4px 12px rgba(0,0,0,0.15)',
                    textAlign: 'center',
                    border: 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                    <Badge bg="danger" style={{ fontSize: 16, padding: '8px 14px' }}>
                      Questão Nº {questaoSemFotoAtual.numero}
                    </Badge>
                    <span style={{ fontSize: '13pt', fontWeight: 'bold', color: '#555' }}>
                      {indiceSemFoto + 1} de {questoesSemFoto.length} sem imagem
                    </span>
                  </div>

                  <div style={{ textAlign: 'left', marginBottom: 15 }}>
                    <p style={{ fontSize: '14pt', margin: '5px 0' }}>
                      <strong>Tema:</strong> {questaoSemFotoAtual.tema}
                    </p>
                    <p style={{ fontSize: '15pt', margin: '5px 0', color: '#222' }}>
                      <strong>Pergunta:</strong> {questaoSemFotoAtual.pergunta}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10, fontSize: '13pt' }}>
                      <div><strong>A:</strong> {questaoSemFotoAtual.A}</div>
                      <div><strong>B:</strong> {questaoSemFotoAtual.B}</div>
                      <div><strong>C:</strong> {questaoSemFotoAtual.C}</div>
                      <div><strong>D:</strong> {questaoSemFotoAtual.D}</div>
                    </div>
                  </div>

                  {/* Campo para anexar a foto */}
                  <Form.Group controlId="formArquivoFoto" style={{ margin: '20px auto', maxWidth: '500px' }}>
                    <Form.Label style={{ fontSize: '14pt', fontWeight: 'bold' }}>
                      Selecione a Imagem da Pergunta:
                    </Form.Label>
                    <Form.Control
                      type="file"
                      ref={inputArquivoRef}
                      onChange={manipularMudancaFoto}
                      accept="image/*"
                      style={{ fontSize: 14 }}
                    />
                  </Form.Group>

                  {/* Pré-visualização da imagem selecionada */}
                  {previaFoto && (
                    <div style={{ margin: '15px auto' }}>
                      <img
                        src={previaFoto}
                        alt="Prévia"
                        style={{
                          width: '200px',
                          height: '200px',
                          borderRadius: '15px',
                          objectFit: 'cover',
                          border: '3px solid #004A8D'
                        }}
                      />
                    </div>
                  )}

                  {/* Controles de Navegação e Gravação */}
                  <div style={{ display: 'flex', gap: 15, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
                    <Button
                      variant="secondary"
                      disabled={indiceSemFoto === 0 || salvandoFoto}
                      onClick={() => {
                        setIndiceSemFoto((ant) => ant - 1);
                        limparPreviaArquivo();
                      }}
                      style={{ padding: '8px 20px', fontSize: 16 }}
                    >
                      ⬅ Anterior
                    </Button>

                    <Button
                      variant="success"
                      disabled={!arquivoFoto || salvandoFoto}
                      onClick={salvarFotoQuestaoAtual}
                      style={{ padding: '10px 30px', fontSize: 18, fontWeight: 'bold' }}
                    >
                      {salvandoFoto ? (
                        <>
                          <Spinner size="sm" animation="border" /> Salvando Foto...
                        </>
                      ) : (
                        '💾 Salvar Foto e Avançar'
                      )}
                    </Button>

                    <Button
                      variant="secondary"
                      disabled={indiceSemFoto >= questoesSemFoto.length - 1 || salvandoFoto}
                      onClick={() => {
                        setIndiceSemFoto((ant) => ant + 1);
                        limparPreviaArquivo();
                      }}
                      style={{ padding: '8px 20px', fontSize: 16 }}
                    >
                      Próxima ➡
                    </Button>
                  </div>
                </Card>
              ) : (
                <Alert variant="success" style={{ fontSize: 18, padding: 30 }}>
                  🎉 <strong>Parabéns!</strong> Todas as perguntas da base de dados já possuem fotos cadastradas!
                </Alert>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* ABA: REDUÇÃO DE TEMAS COM IA                                      */}
          {/* ================================================================= */}
          {abaAtiva === 'temas' && (
            <div style={{ width: '100%' }}>
              <div
                style={{
                  backgroundColor: '#fcffab',
                  borderRadius: 20,
                  padding: 25,
                  width: '100%',
                  boxShadow: '4px 4px 12px rgba(0,0,0,0.15)',
                  marginBottom: 25
                }}
              >
                <h3 style={{ margin: '0 0 15px 0', color: '#004A8D' }}>Redução e Padronização de Temas</h3>
                <p style={{ fontSize: '13pt', color: '#444', margin: '0 0 20px 0' }}>
                  Atualmente existem <strong>{temasCadastrados.length}</strong> temas cadastrados no repositório. A IA analisa sinônimos e erros de digitação e sugere unificá-los aos temas oficiais do projeto.
                </p>
                <Button
                  variant="primary"
                  onClick={dispararAnaliseIa}
                  disabled={carregandoIa || executandoAlteracao}
                  style={{ padding: '10px 25px', fontSize: 16, fontWeight: 'bold' }}
                >
                  {carregandoIa ? <Spinner size="sm" animation="border" /> : '🤖 Analisar Temas com IA'}
                </Button>
              </div>

              {sugestoesIa.length > 0 && (
                <div style={{ backgroundColor: '#fcffab', borderRadius: 20, padding: 20, width: '100%' }}>
                  <Table bordered hover responsive style={{ backgroundColor: '#fff', fontSize: 14 }}>
                    <thead style={{ backgroundColor: '#f2f2f2' }}>
                      <tr>
                        <th style={{ width: '60px', textAlign: 'center' }}>Aplicar</th>
                        <th>Tema Atual</th>
                        <th>Tema Proposto</th>
                        <th style={{ textAlign: 'center' }}>Qtd</th>
                        <th>Justificativa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sugestoesIa.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ textAlign: 'center' }}>
                            <Form.Check
                              type="checkbox"
                              checked={!!itensSelecionados[idx]}
                              onChange={() => alternarSelecao(idx)}
                            />
                          </td>
                          <td style={{ color: '#d9534f', fontWeight: 'bold' }}>{item.temaAntigo}</td>
                          <td style={{ color: '#5cb85c', fontWeight: 'bold' }}>{item.temaProposto}</td>
                          <td style={{ textAlign: 'center' }}>{item.totalRegistros}</td>
                          <td style={{ fontSize: 13 }}>{item.justificativa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  <Button
                    variant="success"
                    onClick={aplicarAlteracoesTemas}
                    disabled={executandoAlteracao}
                    style={{ fontSize: 18, padding: '10px 30px', fontWeight: 'bold' }}
                  >
                    Salvar Alterações de Temas
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* ABA: AUDITORIA E REVISÃO DE QUESTÕES                              */}
          {/* ================================================================= */}
          {abaAtiva === 'auditoria' && (
            <div style={{ width: '100%' }}>
              <div
                style={{
                  backgroundColor: '#fcffab',
                  borderRadius: 20,
                  padding: 25,
                  width: '100%',
                  boxShadow: '4px 4px 12px rgba(0,0,0,0.15)',
                  marginBottom: 25
                }}
              >
                <h3 style={{ margin: '0 0 15px 0', color: '#004A8D' }}>Auditoria Pedagógica e Gabaritos</h3>
                <p style={{ fontSize: '13pt', color: '#444', margin: '0 0 20px 0' }}>
                  Identifica questões sem contextualização (ex.: personagem sem nome do anime), erros ortográficos ou gabarito incorreto.
                </p>
                <Button
                  variant="primary"
                  onClick={dispararAuditoriaQuestoes}
                  disabled={carregandoAuditoria}
                  style={{ padding: '10px 25px', fontSize: 16, fontWeight: 'bold' }}
                >
                  {carregandoAuditoria ? <Spinner size="sm" animation="border" /> : '🔍 Iniciar Auditoria'}
                </Button>
              </div>

              {auditoriaQuestoes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {auditoriaQuestoes.map((item) => (
                    <Card
                      key={item.numero}
                      style={{
                        backgroundColor: '#fcffab',
                        borderRadius: 15,
                        textAlign: 'left',
                        padding: 20,
                        border: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, color: '#004A8D' }}>Questão Nº {item.numero}</h4>
                        {item.possivelCorrigirAutomaticamente ? (
                          <Badge bg="success">Correção Disponível</Badge>
                        ) : (
                          <Badge bg="danger">Revisão Manual</Badge>
                        )}
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <strong style={{ color: '#c00' }}>Problemas:</strong>
                        <ul style={{ margin: '5px 0 10px 20px', fontSize: 14 }}>
                          {item.problemas.map((prob, i) => (
                            <li key={i}>{prob}</li>
                          ))}
                        </ul>
                      </div>

                      {item.sugestao && (
                        <div style={{ backgroundColor: '#fff', borderRadius: 10, padding: 15, fontSize: 14 }}>
                          <h6 style={{ color: '#28a745', fontWeight: 'bold' }}>Sugestão da IA:</h6>
                          <p style={{ margin: '3px 0' }}><strong>Pergunta:</strong> {item.sugestao.pergunta}</p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                            <span>A: {item.sugestao.A}</span>
                            <span>B: {item.sugestao.B}</span>
                            <span>C: {item.sugestao.C}</span>
                            <span>D: {item.sugestao.D}</span>
                          </div>
                          <p style={{ marginTop: 6, color: '#004A8D' }}><strong>Gabarito:</strong> {item.sugestao.correta}</p>

                          <Button
                            variant="success"
                            size="sm"
                            disabled={salvandoQuestaoId === item.numero || questoesCorrigidas[item.numero]}
                            onClick={() => aplicarCorrecaoQuestao(item)}
                            style={{ marginTop: 8, fontWeight: 'bold' }}
                          >
                            {questoesCorrigidas[item.numero] ? '✓ Corrigida!' : 'Aplicar Correção'}
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* ABA: OTIMIZAÇÃO DE TODAS AS IMAGENS                               */}
          {/* ================================================================= */}
          {abaAtiva === 'imagens' && (
            <div
              style={{
                backgroundColor: '#fcffab',
                borderRadius: 20,
                padding: 25,
                width: '100%',
                boxShadow: '4px 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <h3 style={{ margin: '0 0 15px 0', color: '#004A8D' }}>Otimização de Imagens em Lote</h3>
              <p style={{ fontSize: '13pt', color: '#444', margin: '0 0 20px 0' }}>
                Redimensiona e comprime todas as fotos da pasta <code>src/img</code> para 400x400 px e 50% de compressão.
              </p>
              <Button
                variant="dark"
                onClick={dispararOtimizacaoImagens}
                disabled={otimizandoImagens}
                style={{ padding: '12px 30px', fontSize: 16, fontWeight: 'bold' }}
              >
                {otimizandoImagens ? <Spinner size="sm" animation="border" /> : '🖼️ Iniciar Otimização Geral'}
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Ajustes;