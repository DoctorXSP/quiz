// Importa o React e os hooks para controle de estado e ciclo de vida
import React, { useState, useEffect } from 'react';

// Importa o cliente HTTP axios para requisições ao backend
import axios from 'axios';

// Importa componentes visuais do react-bootstrap
import { Form, Button, Alert } from 'react-bootstrap';

// Importa a folha de estilos padrão
import estilos from './interface.css';

// Importa os recursos de imagem para o cabeçalho
import imagemTorta from './img/torta.webp';
import imagemPaulo from './img/pauloFreire.gif';

// URL base da API
const URL_API = process.env.REACT_APP_API_URL || 'http://localhost:3042';

const GerarIA = () => {
  // Controle de Login
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [mensagemErroLogin, setMensagemErroLogin] = useState('');

  // Controle de Etapas: 'formulario' (geração), 'revisao' (curadoria) ou 'concluido' (relatório)
  const [etapa, setEtapa] = useState('formulario');

  // Dados do Formulário Gerador
  const [listaTemasExistentes, setListaTemasExistentes] = useState([]);
  const [temaSelecionado, setTemaSelecionado] = useState('');
  const [novoTema, setNovoTema] = useState('');
  const [promptUsuario, setPromptUsuario] = useState('');
  const [quantidadeDesejada, setQuantidadeDesejada] = useState(1);
  const [carregandoIA, setCarregandoIA] = useState(false);

  // Lista de Questões Sugeridas pela IA e Navegação
  const [questoesSugeridas, setQuestoesSugeridas] = useState([]);
  const [indiceAtual, setIndiceAtual] = useState(0);

  // Controle de Imagem para a questão em revisão
  const [arquivoImagem, setArquivoImagem] = useState(null);
  const [urlPreviaImagem, setUrlPreviaImagem] = useState(null);

  // Métricas de Curadoria para o relatório final
  const [contadorInseridas, setContadorInseridas] = useState(0);
  const [contadorDescartadas, setContadorDescartadas] = useState(0);
  const [contadorSemImagem, setContadorSemImagem] = useState(0);
  const [mensagemFeedback, setMensagemFeedback] = useState('');

  // Validação de Login
  const manipularEnvioLogin = (evento) => {
    evento.preventDefault();
    if (usuario === 'etecembu' && senha === 'etec@241') {
      setAutenticado(true);
      setMensagemErroLogin('');
    } else {
      setMensagemErroLogin('Usuário ou senha inválidos!');
    }
  };

  // Carrega temas já cadastrados no banco para o menu suspenso
  useEffect(() => {
    if (!autenticado) return;
    const buscarTemas = async () => {
      try {
        const resposta = await axios.get(`${URL_API}/temas`);
        if (Array.isArray(resposta.data)) {
          setListaTemasExistentes(resposta.data);
        }
      } catch (erro) {
        console.error('Erro ao buscar temas:', erro);
      }
    };
    buscarTemas();
  }, [autenticado]);

  // Função para chamar o endpoint de geração com IA
  const manipularGeracaoQuestoes = async (evento) => {
    evento.preventDefault();
    const temaFinal = novoTema.trim() !== '' ? novoTema.trim() : temaSelecionado;

    if (!temaFinal) {
      setMensagemFeedback('Por favor, selecione um tema ou digite um novo tema.');
      return;
    }

    if (!promptUsuario.trim()) {
      setMensagemFeedback('Por favor, informe as instruções/prompt para a IA.');
      return;
    }

    try {
      setCarregandoIA(true);
      setMensagemFeedback('');

      const resposta = await axios.post(`${URL_API}/gerar-questoes`, {
        tema: temaFinal,
        promptUsuario,
        quantidade: quantidadeDesejada
      });

      if (Array.isArray(resposta.data) && resposta.data.length > 0) {
        setQuestoesSugeridas(resposta.data);
        setIndiceAtual(0);
        setArquivoImagem(null);
        setUrlPreviaImagem(null);
        setContadorInseridas(0);
        setContadorDescartadas(0);
        setContadorSemImagem(0);
        setEtapa('revisao');
      } else {
        setMensagemFeedback('A IA não retornou nenhuma questão válida. Tente novamente.');
      }
    } catch (erro) {
      console.error(erro);
      setMensagemFeedback(`Erro na geração: ${erro.response?.data?.message || erro.message}`);
    } finally {
      setCarregandoIA(false);
    }
  };

  // Trata seleção de imagem local para a questão atual
  const manipularMudancaImagem = (evento) => {
    const arquivo = evento.target.files[0];
    if (arquivo) {
      setArquivoImagem(arquivo);
      setUrlPreviaImagem(URL.createObjectURL(arquivo));
    }
  };

  // Edição dinâmica dos campos sugeridos pela IA durante a curadoria
  const manipularEdicaoTexto = (evento) => {
    const { name, value } = evento.target;
    setQuestoesSugeridas((anterior) => {
      const copia = [...anterior];
      copia[indiceAtual] = { ...copia[indiceAtual], [name]: value };
      return copia;
    });
  };

  // Avança para a próxima questão ou finaliza o processo
  const prosseguirFila = (foiInserida, semFoto = false) => {
    if (foiInserida) {
      setContadorInseridas((prev) => prev + 1);
      if (semFoto) setContadorSemImagem((prev) => prev + 1);
    } else {
      setContadorDescartadas((prev) => prev + 1);
    }

    // Se houver mais perguntas na fila
    if (indiceAtual < questoesSugeridas.length - 1) {
      setIndiceAtual((prev) => prev + 1);
      setArquivoImagem(null);
      setUrlPreviaImagem(null);
    } else {
      setEtapa('concluido');
    }
  };

  // Ação de APROVAR e gravar no banco de dados
  const aprovarEInserir = async () => {
    try {
      const questao = questoesSugeridas[indiceAtual];
      const dadosFormulario = new FormData();

      dadosFormulario.append('tema', questao.tema);
      dadosFormulario.append('pergunta', questao.pergunta);
      dadosFormulario.append('A', questao.A);
      dadosFormulario.append('B', questao.B);
      dadosFormulario.append('C', questao.C);
      dadosFormulario.append('D', questao.D);
      dadosFormulario.append('correta', questao.correta);

      const semFoto = !arquivoImagem;
      if (arquivoImagem) {
        dadosFormulario.append('imagem', arquivoImagem);
      }

      await axios.post(`${URL_API}/insert`, dadosFormulario, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      prosseguirFila(true, semFoto);
    } catch (erro) {
      console.error(erro);
      setMensagemFeedback(`Erro ao salvar no banco: ${erro.response?.data?.message || erro.message}`);
    }
  };

  // Ação de DESCARTAR a questão atual
  const descartarQuestao = () => {
    prosseguirFila(false);
  };

  // Navegação opcional entre as questões da lista
  const voltarQuestao = () => {
    if (indiceAtual > 0) {
      setIndiceAtual((prev) => prev - 1);
      setArquivoImagem(null);
      setUrlPreviaImagem(null);
    }
  };

  return (
    <div className="Interface">
      {/* Cabeçalho */}
      <header>
        <img className="imgFoto" style={estilos.imgFoto} src={imagemTorta} alt="Torta na Cara" />
        <div>
          <h1>TORTA NA CARA</h1>
          <h2>Semana Paulo Freire</h2>
        </div>
        <img className="imgPaulo" src={imagemPaulo} alt="Paulo Freire" />
      </header>

      <section
        style={{
          width: '80%',
          margin: 'auto',
          marginTop: '15px',
          textAlign: 'center',
          fontSize: '16pt',
          fontWeight: 'bold'
        }}
      >
        {/* 1. TELA DE LOGIN */}
        {!autenticado && (
          <Form onSubmit={manipularEnvioLogin} style={{ marginTop: '35px' }}>
            <h2 style={{ marginBottom: 25 }}>Acesso ao Gerador com IA</h2>
            <Form.Group controlId="loginUsuario" style={{ marginBottom: 15 }}>
              <Form.Label>Usuário:</Form.Label>
              <Form.Control
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Informe seu usuário"
                style={{ width: '50%', margin: '0 auto', padding: 5, fontSize: 14 }}
              />
            </Form.Group>

            <Form.Group controlId="loginSenha" style={{ marginBottom: 20 }}>
              <Form.Label>Senha:</Form.Label>
              <Form.Control
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Informe sua senha"
                style={{ width: '50%', margin: '0 auto', padding: 5, fontSize: 14 }}
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              style={{ fontSize: 22, padding: '5px 25px', color: 'white', backgroundColor: 'Green', border: 'none' }}
            >
              Entrar
            </Button>

            {mensagemErroLogin && (
              <Alert variant="danger" style={{ width: '50%', margin: '20px auto 0', fontSize: 14 }}>
                {mensagemErroLogin}
              </Alert>
            )}
          </Form>
        )}

        {/* 2. FORMULÁRIO DE GERAÇÃO COM IA */}
        {autenticado && etapa === 'formulario' && (
          <Form onSubmit={manipularGeracaoQuestoes} style={{ marginTop: '20px' }}>
            <h2 style={{ marginBottom: 20 }}>Gerar Questões com IA</h2>

            <Form.Group style={{ marginBottom: 15 }}>
              <Form.Label>Escolha um Tema Existente:</Form.Label>
              <Form.Control
                as="select"
                value={temaSelecionado}
                onChange={(e) => {
                  setTemaSelecionado(e.target.value);
                  if (e.target.value) setNovoTema('');
                }}
                style={{ width: '50%', margin: '0 auto' }}
              >
                <option value="">Selecione um tema...</option>
                {listaTemasExistentes.map((t, i) => (
                  <option key={i} value={t.tema}>
                    {t.tema}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group style={{ marginBottom: 15 }}>
              <Form.Label>Ou Adicione um Novo Tema:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex.: Redes de Computadores, História do Brasil"
                value={novoTema}
                onChange={(e) => {
                  setNovoTema(e.target.value);
                  if (e.target.value) setTemaSelecionado('');
                }}
                style={{ width: '50%', margin: '0 auto', padding: 5, fontSize: 14 }}
              />
            </Form.Group>

            <Form.Group style={{ marginBottom: 15 }}>
              <Form.Label>Instruções / Prompt para as Questões:</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Ex.: Crie perguntas de nível médio com pegadinhas inteligentes sobre protocolos da camada de aplicação..."
                value={promptUsuario}
                onChange={(e) => setPromptUsuario(e.target.value)}
                style={{ width: '60%', margin: '0 auto', padding: 5, fontSize: 14 }}
              />
            </Form.Group>

            <Form.Group style={{ marginBottom: 25 }}>
              <Form.Label>Quantidade de Questões (1 a 10):</Form.Label>
              <Form.Control
                as="select"
                value={quantidadeDesejada}
                onChange={(e) => setQuantidadeDesejada(Number(e.target.value))}
                style={{ width: '20%', margin: '0 auto' }}
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              disabled={carregandoIA}
              style={{ fontSize: 22, padding: '8px 30px', color: 'white', backgroundColor: 'Green', border: 'none' }}
            >
              {carregandoIA ? 'Consultando IA...' : 'Gerar com IA'}
            </Button>
          </Form>
        )}

        {/* 3. TELA DE REVISÃO E APROVAÇÃO (ESTILO ALTERAR.JS) */}
        {autenticado && etapa === 'revisao' && questoesSugeridas.length > 0 && (
          <Form style={{ marginTop: '10px' }}>
            <Form.Label style={{ color: '#004A8D', fontSize: '18pt' }}>
              Revisão da Sugestão {indiceAtual + 1} de {questoesSugeridas.length}
            </Form.Label>

            <Form.Group style={{ marginBottom: 10 }}>
              <Form.Label>Tema:</Form.Label>
              <Form.Control
                type="text"
                name="tema"
                value={questoesSugeridas[indiceAtual].tema}
                onChange={manipularEdicaoTexto}
                style={{ width: '50%', margin: '0 auto', padding: 5, fontSize: 13 }}
              />
            </Form.Group>

            <Form.Group style={{ marginBottom: 10 }}>
              <Form.Label>Pergunta:</Form.Label>
              <Form.Control
                as="textarea"
                name="pergunta"
                value={questoesSugeridas[indiceAtual].pergunta}
                onChange={manipularEdicaoTexto}
                style={{ width: '60%', height: 75, margin: '0 auto', padding: 5, fontSize: 13 }}
              />
            </Form.Group>

            {['A', 'B', 'C', 'D'].map((letra) => (
              <Form.Group key={letra} style={{ marginBottom: 8 }}>
                <Form.Label>{letra}:</Form.Label>
                <Form.Control
                  type="text"
                  name={letra}
                  value={questoesSugeridas[indiceAtual][letra]}
                  onChange={manipularEdicaoTexto}
                  style={{ width: '60%', margin: '0 auto', padding: 4, fontSize: 13 }}
                />
              </Form.Group>
            ))}

            <Form.Group style={{ marginBottom: 10 }}>
              <Form.Label>Resposta Correta:</Form.Label>
              <Form.Control
                as="select"
                name="correta"
                value={questoesSugeridas[indiceAtual].correta}
                onChange={manipularEdicaoTexto}
                style={{ width: '20%', margin: '0 auto' }}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </Form.Control>
            </Form.Group>

            {/* Inserção opcional de imagem */}
            <Form.Group style={{ marginTop: 15 }}>
              <Form.Label>Imagem (Opcional):</Form.Label>
              <Form.Control
                type="file"
                onChange={manipularMudancaImagem}
                style={{ width: '60%', margin: '0 auto' }}
              />
            </Form.Group>

            {urlPreviaImagem && (
              <div style={{ marginTop: 15 }}>
                <img
                  src={urlPreviaImagem}
                  alt="Prévia"
                  style={{ width: 180, height: 180, borderRadius: 100, objectFit: 'cover' }}
                />
              </div>
            )}

            {/* Painel de Ações */}
            <div style={{ marginTop: 25, marginBottom: 25 }}>
              <Button
                variant="secondary"
                onClick={voltarQuestao}
                disabled={indiceAtual === 0}
                style={{ marginRight: 15 }}
              >
                Anterior
              </Button>

              <Button
                variant="danger"
                onClick={descartarQuestao}
                style={{ marginRight: 15, padding: '6px 20px' }}
              >
                Descartar ❌
              </Button>

              <Button
                variant="success"
                onClick={aprovarEInserir}
                style={{ backgroundColor: 'green', borderColor: 'green', color: 'white', padding: '6px 25px' }}
              >
                Aprovar e Inserir ✅
              </Button>
            </div>
          </Form>
        )}

        {/* 4. RELATÓRIO FINAL */}
        {autenticado && etapa === 'concluido' && (
          <div style={{ marginTop: '40px', padding: '20px', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 12 }}>
            <h2 style={{ color: '#004A8D', marginBottom: 20 }}>Não existem mais registros para curadoria!</h2>
            <p style={{ fontSize: '18pt' }}>📊 <strong>Relatório da Sessão:</strong></p>
            <p style={{ color: 'green' }}>✅ Questões aprovadas e inseridas: <strong>{contadorInseridas}</strong></p>
            <p style={{ color: 'red' }}>❌ Questões descartadas: <strong>{contadorDescartadas}</strong></p>

            {contadorSemImagem > 0 ? (
              <Alert variant="warning" style={{ width: '70%', margin: '20px auto', fontSize: '14pt' }}>
                ⚠️ Atenção: Existem <strong>{contadorSemImagem}</strong> questão(ões) que foram inseridas sem imagem anexada.
              </Alert>
            ) : (
              <Alert variant="success" style={{ width: '70%', margin: '20px auto', fontSize: '14pt' }}>
                🎉 Todas as questões inseridas possuem imagem associada!
              </Alert>
            )}

            <Button
              variant="primary"
              onClick={() => {
                setEtapa('formulario');
                setQuestoesSugeridas([]);
                setPromptUsuario('');
                setNovoTema('');
              }}
              style={{ marginTop: 20, fontSize: 18, padding: '8px 25px', backgroundColor: '#004A8D', border: 'none' }}
            >
              Criar Nova Rodada
            </Button>
          </div>
        )}

        {mensagemFeedback && (
          <Alert variant="info" style={{ marginTop: 20, fontSize: 14 }}>
            {mensagemFeedback}
          </Alert>
        )}
      </section>
    </div>
  );
};

export default GerarIA;