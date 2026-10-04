// Importa o React e os hooks para controle de estado e ciclo de vida
import React, { useState, useEffect, useRef } from 'react';

// Importa o cliente HTTP axios para consumo dos endpoints da API
import axios from 'axios';

// Importa os componentes de interface da biblioteca react-bootstrap
import { Form, Button, Alert } from 'react-bootstrap';

// Importa a folha de estilos padronizada da aplicação
import estilos from './interface.css';

// Importa a imagem estática da torta usada no cabeçalho
import imagemTorta from './img/torta.webp';

// Importa a imagem GIF de Paulo Freire usada no cabeçalho
import imagemPaulo from './img/pauloFreire.gif';

// Define o endereço base da API backend
const URL_API = 'http://localhost:304n';

const Alterar = () => {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [mensagemErroLogin, setMensagemErroLogin] = useState('');

  const [registros, setRegistros] = useState([]);
  const [temas, setTemas] = useState([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [temaSelecionado, setTemaSelecionado] = useState('');
  const [numeroPergunta, setNumeroPergunta] = useState('');
  const [mensagemFeedback, setMensagemFeedback] = useState({ tipo: '', texto: '' });

  const [arquivoImagem, setArquivoImagem] = useState(null);
  const [urlPreviaImagem, setUrlPreviaImagem] = useState(null);
  const [versaoImagem, setVersaoImagem] = useState(Date.now());

  // Estado para controlar o destaque de borda verde e aviso de imagem salva
  const [imagemSalvaSucesso, setImagemSalvaSucesso] = useState(false);

  const inputArquivoRef = useRef(null);

  const manipularEnvioLogin = (evento) => {
    evento.preventDefault();

    if (usuario === 'etecembu' && senha === 'etec@241') {
      setAutenticado(true);
      setMensagemErroLogin('');
    } else {
      setMensagemErroLogin('Usuário ou senha inválidos!');
    }
  };

  useEffect(() => {
    if (!autenticado) return;
    buscarTemas();
    buscarRegistros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autenticado]);

  // Atualiza a URL de visualização da imagem
  useEffect(() => {
    if (!registros.length || !registros[indiceAtual]) {
      setUrlPreviaImagem(null);
      return;
    }

    if (arquivoImagem) {
      const urlBlob = URL.createObjectURL(arquivoImagem);
      setUrlPreviaImagem(urlBlob);
      return () => URL.revokeObjectURL(urlBlob);
    }

    const imagemRegistro = registros[indiceAtual]?.imagem;
    console.log('🔍 [DEBUG] Renderizando imagem da questão:', {
      numero: registros[indiceAtual]?.numero,
      imagem: imagemRegistro,
      versao: versaoImagem
    });

    if (imagemRegistro) {
      const caminhoLimpo = imagemRegistro.startsWith('/') ? imagemRegistro.slice(1) : imagemRegistro;
      const urlFinal = `${URL_API}/${caminhoLimpo}?v=${versaoImagem}`;
      setUrlPreviaImagem(urlFinal);
    } else {
      setUrlPreviaImagem(null);
    }
  }, [indiceAtual, registros, arquivoImagem, versaoImagem]);

  useEffect(() => {
    if (!mensagemFeedback.texto) return;
    const temporizador = setTimeout(() => {
      setMensagemFeedback({ tipo: '', texto: '' });
    }, 5000);
    return () => clearTimeout(temporizador);
  }, [mensagemFeedback]);

  const buscarTemas = async () => {
    try {
      const resposta = await axios.get(`${URL_API}/temas`);
      setTemas(resposta.data);
    } catch (erro) {
      console.error('❌ Erro ao buscar temas:', erro);
      setMensagemFeedback({ tipo: 'danger', texto: 'Erro ao buscar temas' });
    }
  };

  const buscarRegistros = async (filtroTema = '', filtroNumero = '', manterIndice = null) => {
    try {
      const resposta = await axios.get(
        `${URL_API}/registros?tema=${filtroTema}&numero=${filtroNumero}`
      );
      console.log('📥 [DEBUG] Dados recebidos de /registros:', resposta.data);
      setRegistros(resposta.data);

      if (manterIndice !== null && manterIndice < resposta.data.length) {
        setIndiceAtual(manterIndice);
      } else {
        setIndiceAtual(0);
      }

      limparSelecaoArquivo();
      setVersaoImagem(Date.now());
    } catch (erro) {
      console.error('❌ Erro ao buscar registros:', erro);
      setMensagemFeedback({ tipo: 'danger', texto: 'Erro ao buscar registros' });
    }
  };

  const limparSelecaoArquivo = () => {
    setArquivoImagem(null);
    if (inputArquivoRef.current) {
      inputArquivoRef.current.value = '';
    }
  };

  // Navegação entre perguntas reseta o status de destaque da imagem
  const proximoRegistro = () => {
    if (indiceAtual < registros.length - 1) {
      setIndiceAtual((anterior) => anterior + 1);
      limparSelecaoArquivo();
      setImagemSalvaSucesso(false);
    }
  };

  const registroAnterior = () => {
    if (indiceAtual > 0) {
      setIndiceAtual((anterior) => anterior - 1);
      limparSelecaoArquivo();
      setImagemSalvaSucesso(false);
    }
  };

  const ultimoRegistro = () => {
    if (registros.length > 0) {
      setIndiceAtual(registros.length - 1);
      limparSelecaoArquivo();
      setImagemSalvaSucesso(false);
    }
  };

  const alterarRegistro = async () => {
    try {
      const registro = registros[indiceAtual];
      const dadosFormulario = new FormData();

      dadosFormulario.append('tema', registro.tema);
      dadosFormulario.append('pergunta', registro.pergunta);
      dadosFormulario.append('A', registro.A);
      dadosFormulario.append('B', registro.B);
      dadosFormulario.append('C', registro.C);
      dadosFormulario.append('D', registro.D);
      dadosFormulario.append('correta', registro.correta);

      const enviouNovaImagem = Boolean(arquivoImagem);
      if (enviouNovaImagem) {
        dadosFormulario.append('imagem', arquivoImagem);
        console.log('📤 [DEBUG] Enviando arquivo:', arquivoImagem.name);
      }

      console.log(`🚀 [DEBUG] Enviando PUT para: ${URL_API}/atualizar/${registro.numero}`);
      const resposta = await axios.put(
        `${URL_API}/atualizar/${registro.numero}`,
        dadosFormulario
      );

      console.log('✅ [DEBUG] Resposta completa do backend:', resposta.data);

      const imagemRetornada =
        resposta.data?.imagem ||
        resposta.data?.registro?.imagem ||
        resposta.data?.dados?.imagem ||
        registro.imagem;

      const novoTimestamp = Date.now();
      const indiceSalvo = indiceAtual;

      setRegistros((anterior) => {
        const copia = [...anterior];
        copia[indiceSalvo] = {
          ...copia[indiceSalvo],
          imagem: imagemRetornada
        };
        return copia;
      });

      setVersaoImagem(novoTimestamp);
      limparSelecaoArquivo();

      // Ativa o destaque de borda verde e frase de sucesso para a imagem
      setImagemSalvaSucesso(true);

      // Desativa o destaque verde após 5 segundos (opcional)
      setTimeout(() => {
        setImagemSalvaSucesso(false);
      }, 5000);

      await buscarRegistros(temaSelecionado, numeroPergunta, indiceSalvo);

      setMensagemFeedback({
        tipo: 'success',
        texto: 'Registro e imagem atualizados com sucesso!'
      });
    } catch (erro) {
      console.error('❌ [DEBUG] Erro na requisição:', erro.response?.data || erro.message);
      setImagemSalvaSucesso(false);
      setMensagemFeedback({
        tipo: 'danger',
        texto: 'Erro ao atualizar o registro. Verifique os dados e tente novamente.'
      });
    }
  };

  const manipularMudancaTexto = (evento) => {
    const { name, value } = evento.target;
    setRegistros((anterior) => {
      const copia = [...anterior];
      copia[indiceAtual] = { ...copia[indiceAtual], [name]: value };
      return copia;
    });
  };

  const manipularMudancaImagem = (evento) => {
    const arquivo = evento.target.files[0];
    if (arquivo) {
      console.log('📁 [DEBUG] Novo arquivo selecionado:', arquivo);
      setArquivoImagem(arquivo);
      setImagemSalvaSucesso(false); // Reseta a borda verde enquanto não for salvo
    }
  };

  return (
    <div className="Interface">
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
          marginTop: '10px',
          textAlign: 'center',
          fontSize: '16pt',
          fontWeight: 'bold'
        }}
      >
        {!autenticado ? (
          <Form onSubmit={manipularEnvioLogin} style={{ marginTop: '35px' }}>
            <h2 style={{ marginBottom: 25 }}>Acesso às Alterações</h2>

            <Form.Group controlId="formUsuarioLogin" style={{ marginBottom: 15 }}>
              <Form.Label>Usuário:</Form.Label>
              <Form.Control
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Informe seu usuário"
                style={{ width: '50%', margin: '0 auto', padding: 5, fontSize: 14 }}
              />
            </Form.Group>

            <Form.Group controlId="formSenhaLogin" style={{ marginBottom: 20 }}>
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
        ) : (
          <Form>
            <Form.Group>
              <Form.Label>Filtrar por Tema:</Form.Label>
              <Form.Control
                as="select"
                value={temaSelecionado}
                onChange={(e) => setTemaSelecionado(e.target.value)}
                style={{ width: '50%', margin: '0 auto' }}
              >
                <option value="">Todos</option>
                {temas.map((itemTema, i) => (
                  <option key={i} value={itemTema.tema}>
                    {itemTema.tema}
                  </option>
                ))}
              </Form.Control>

              <Button
                variant="primary"
                style={{ marginTop: '10px' }}
                onClick={() => buscarRegistros(temaSelecionado)}
              >
                Filtrar
              </Button>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Buscar pelo Número da Pergunta:</Form.Label>
              <Form.Control
                type="text"
                value={numeroPergunta}
                onChange={(e) => setNumeroPergunta(e.target.value)}
                style={{ width: '50%', margin: '0 auto' }}
              />

              <Button
                variant="primary"
                style={{ marginTop: '10px' }}
                onClick={() => buscarRegistros('', numeroPergunta)}
              >
                Buscar
              </Button>
            </Form.Group>

            {registros.length > 0 && registros[indiceAtual] && (
              <>
                <Form.Label>Pergunta Nº. {registros[indiceAtual].numero}</Form.Label>

                <Form.Group>
                  <Form.Label>Tema:</Form.Label>
                  <Form.Control
                    as="select"
                    name="tema"
                    value={registros[indiceAtual].tema || ''}
                    onChange={manipularMudancaTexto}
                    style={{ width: '50%', marginBottom: '10px', margin: '0 auto' }}
                  >
                    {temas.map((itemTema, i) => (
                      <option key={i} value={itemTema.tema}>
                        {itemTema.tema}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mt-2">
                  <Form.Label>Pergunta:</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="pergunta"
                    value={registros[indiceAtual].pergunta || ''}
                    onChange={manipularMudancaTexto}
                    style={{ width: '60%', height: 80, margin: '0 auto', marginTop: 10 }}
                  />
                </Form.Group>

                {['A', 'B', 'C', 'D'].map((opcao) => (
                  <Form.Group key={opcao} className="mt-2">
                    <Form.Label>{opcao}:</Form.Label>
                    <Form.Control
                      type="text"
                      name={opcao}
                      value={registros[indiceAtual][opcao] || ''}
                      onChange={manipularMudancaTexto}
                      style={{ width: '60%', margin: '0 auto' }}
                    />
                  </Form.Group>
                ))}

                <Form.Group className="mt-2">
                  <Form.Label>Resposta Correta:</Form.Label>
                  <Form.Control
                    as="select"
                    name="correta"
                    value={registros[indiceAtual].correta || 'A'}
                    onChange={manipularMudancaTexto}
                    style={{ width: '20%', margin: '0 auto' }}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mt-3">
                  <Form.Label>Imagem:</Form.Label>
                  <Form.Control 
                    type="file" 
                    ref={inputArquivoRef}
                    onChange={manipularMudancaImagem} 
                    style={{ width: '60%', margin: '0 auto' }}
                  />
                </Form.Group>

                {/* Bloco de Exibição da Imagem com Borda e Frase de Sucesso */}
                {urlPreviaImagem && (
                  <div className="mt-3" style={{ display: 'inline-block' }}>
                    <img
                      src={urlPreviaImagem}
                      alt="Pré-visualização"
                      onError={() => console.warn('⚠️ Falha ao carregar URL da imagem:', urlPreviaImagem)}
                      style={{
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: imagemSalvaSucesso ? '5px solid #28a745' : '3px solid #ccc',
                        boxShadow: imagemSalvaSucesso ? '0 0 15px rgba(40, 167, 69, 0.7)' : 'none',
                        transition: 'all 0.3s ease-in-out'
                      }}
                    />
                    {imagemSalvaSucesso && (
                      <div
                        style={{
                          marginTop: 8,
                          color: '#28a745',
                          fontSize: '13pt',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6
                        }}
                      >
                        <span>✓</span> Imagem salva com sucesso!
                      </div>
                    )}
                  </div>
                )}

                <div style={{ marginTop: 30, marginBottom: 30 }}>
                  <Button
                    variant="secondary"
                    onClick={registroAnterior}
                    style={{ marginRight: 10 }}
                    disabled={indiceAtual === 0}
                  >
                    Anterior
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={proximoRegistro}
                    style={{ marginRight: 10 }}
                    disabled={indiceAtual === registros.length - 1}
                  >
                    Próximo
                  </Button>

                  <Button
                    variant="dark"
                    onClick={ultimoRegistro}
                    style={{ marginRight: 10 }}
                    disabled={indiceAtual === registros.length - 1}
                  >
                    Último
                  </Button>

                  <Button
                    onClick={alterarRegistro}
                    style={{ backgroundColor: 'green', borderColor: 'green', color: 'white' }}
                  >
                    Salvar Alterações
                  </Button>

                  <div style={{ fontSize: '12pt', marginTop: 15, color: '#666' }}>
                    {indiceAtual + 1} de {registros.length} registros
                  </div>
                </div>
              </>
            )}
          </Form>
        )}

        {mensagemFeedback.texto && (
          <Alert 
            variant={mensagemFeedback.tipo || 'info'} 
            style={{ width: '60%', margin: '20px auto', fontSize: 16 }}
          >
            {mensagemFeedback.texto}
          </Alert>
        )}
      </section>
    </div>
  );
};

export default Alterar;