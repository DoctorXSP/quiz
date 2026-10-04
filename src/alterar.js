// Importa o React e os hooks para controle de estado e ciclo de vida
import React, { useState, useEffect } from 'react';

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

// Define o endereço base da API backend (porta 3042)
const URL_API = 'http://localhost:3042';

// Declara o componente funcional Alterar
const Alterar = () => {
  // Estado para armazenar o usuário digitado na tela de login
  const [usuario, setUsuario] = useState('');

  // Estado para armazenar a senha digitada na tela de login
  const [senha, setSenha] = useState('');

  // Estado booleano que indica se o usuário realizou o login com sucesso
  const [autenticado, setAutenticado] = useState(false);

  // Estado para mensagens de erro geradas na validação do login
  const [mensagemErroLogin, setMensagemErroLogin] = useState('');

  // Estado que armazena a lista de questões retornadas do banco de dados
  const [registros, setRegistros] = useState([]);

  // Estado contendo os temas distintos disponíveis no banco
  const [temas, setTemas] = useState([]);

  // Estado para o índice da pergunta atualmente visualizada na navegação
  const [indiceAtual, setIndiceAtual] = useState(0);

  // Estado com o valor do tema selecionado no menu suspenso de filtro
  const [temaSelecionado, setTemaSelecionado] = useState('');

  // Estado com o número da pergunta digitado para busca direta
  const [numeroPergunta, setNumeroPergunta] = useState('');

  // Estado para exibir notificações gerais de feedback (sucesso/erro)
  const [mensagemFeedback, setMensagemFeedback] = useState('');

  // Estado que armazena o novo arquivo de imagem selecionado pelo usuário
  const [arquivoImagem, setArquivoImagem] = useState(null);

  // Estado para a URL de visualização da imagem da questão atual
  const [urlPreviaImagem, setUrlPreviaImagem] = useState(null);

  // Versão numérica usada como cache buster para forçar a atualização da imagem
  const [versaoImagem, setVersaoImagem] = useState(0);

  // Função para validar o usuário e senha informados
  const manipularEnvioLogin = (evento) => {
    // Impede o recarregamento automático da página ao submeter o formulário
    evento.preventDefault();

    // Checa se o usuário e a senha coincidem com as credenciais fixadas
    if (usuario === 'etecembu' && senha === 'etec@241') {
      // Concede acesso ao painel de edição
      setAutenticado(true);
      // Limpa mensagem de erro residual
      setMensagemErroLogin('');
    } else {
      // Define aviso caso as credenciais estejam erradas
      setMensagemErroLogin('Usuário ou senha inválidos!');
    }
  };

  // Efeito responsável por buscar dados apenas após autenticação com sucesso
  useEffect(() => {
    // Se ainda não estiver autenticado, não faz requisições desnecessárias
    if (!autenticado) return;

    // Busca a listagem de temas no banco
    buscarTemas();
    // Busca todos os registros de questões
    buscarRegistros();
  }, [autenticado]);

  // Efeito para atualizar a URL da imagem de pré-visualização quando a questão mudar
  useEffect(() => {
    // Interrompe se não houver questões carregadas
    if (registros.length === 0) return;

    // Se o usuário ainda não escolheu um arquivo novo, usa a imagem salva no registro
    if (!arquivoImagem) {
      // Obtém o caminho da imagem do registro atual
      const imagemRegistro = registros[indiceAtual]?.imagem;

      // Monta a URL completa com parâmetro de versão contra cache do navegador
      setUrlPreviaImagem(
        imagemRegistro ? `${URL_API}/${imagemRegistro}?v=${versaoImagem}` : null
      );
    }
  }, [indiceAtual, registros, arquivoImagem, versaoImagem]);

  // Efeito para limpar mensagens de aviso após 5 segundos
  useEffect(() => {
    // Se não houver mensagem na tela, ignora
    if (!mensagemFeedback) return;

    // Configura o cronômetro para apagar a mensagem após 5000 milissegundos
    const temporizador = setTimeout(() => {
      // Apaga o texto do feedback
      setMensagemFeedback('');
      // Limpa o estado da imagem temporária
      setArquivoImagem(null);
      // Incrementa a versão para forçar re-render da imagem atualizada
      setVersaoImagem((anterior) => anterior + 1);
    }, 5000);

    // Limpa o temporizador caso o componente seja desmontado
    return () => clearTimeout(temporizador);
  }, [mensagemFeedback]);

  // Função assíncrona para buscar todos os temas cadastrados
  const buscarTemas = async () => {
    try {
      // Faz requisição GET para a rota de temas
      const resposta = await axios.get(`${URL_API}/temas`);
      // Atualiza o estado com o array recebido
      setTemas(resposta.data);
    } catch (erro) {
      // Exibe erro na interface caso a requisição falhe
      setMensagemFeedback('Erro ao buscar temas');
    }
  };

  // Função assíncrona para buscar as questões com filtros opcionais
  const buscarRegistros = async (filtroTema = '', filtroNumero = '') => {
    try {
      // Dispara requisição GET passando parâmetros de busca na query string
      const resposta = await axios.get(
        `${URL_API}/registros?tema=${filtroTema}&numero=${filtroNumero}`
      );
      // Atualiza a lista de questões
      setRegistros(resposta.data);
      // Retorna a navegação para o primeiro item retornado
      setIndiceAtual(0);
      // Reseta a imagem de edição
      setArquivoImagem(null);
      // Força nova versão da imagem
      setVersaoImagem((anterior) => anterior + 1);
    } catch (erro) {
      // Exibe mensagem informativa de falha
      setMensagemFeedback('Erro ao buscar registros');
    }
  };

  // Avança para a próxima pergunta da lista
  const proximoRegistro = () => {
    // Só avança se o índice atual não for o último elemento
    if (indiceAtual < registros.length - 1) {
      // Incrementa o índice
      setIndiceAtual((anterior) => anterior + 1);
      // Reseta a imagem enviada para não sobrescrever o próximo item
      setArquivoImagem(null);
    }
  };

  // Volta para a pergunta anterior da lista
  const registroAnterior = () => {
    // Só retrocede se o índice for maior que zero
    if (indiceAtual > 0) {
      // Decrementa o índice
      setIndiceAtual((anterior) => anterior - 1);
      // Reseta a imagem enviada
      setArquivoImagem(null);
    }
  };

  // Pula diretamente para a última questão da lista
  const ultimoRegistro = () => {
    // Verifica se existem registros carregados
    if (registros.length > 0) {
      // Posiciona no último índice disponível
      setIndiceAtual(registros.length - 1);
      // Reseta a imagem temporária
      setArquivoImagem(null);
    }
  };

  // Função assíncrona para enviar as alterações do registro para o backend
  const alterarRegistro = async () => {
    try {
      // Obtém o registro atual que está sendo modificado
      const registro = registros[indiceAtual];

      // Instancia um FormData para enviar texto e arquivo binário
      const dadosFormulario = new FormData();

      // Anexa os campos de texto atualizados
      dadosFormulario.append('tema', registro.tema);
      dadosFormulario.append('pergunta', registro.pergunta);
      dadosFormulario.append('A', registro.A);
      dadosFormulario.append('B', registro.B);
      dadosFormulario.append('C', registro.C);
      dadosFormulario.append('D', registro.D);
      dadosFormulario.append('correta', registro.correta);

      // Se o usuário selecionou uma nova imagem, anexa ao envio
      if (arquivoImagem) {
        dadosFormulario.append('imagem', arquivoImagem);
      }

      // Envia a requisição PUT com o número identificador na rota
      await axios.put(
        `${URL_API}/atualizar/${registro.numero}`,
        dadosFormulario
      );

      // Reseta o estado do arquivo enviado
      setArquivoImagem(null);
      // Incrementa a versão para atualizar o preview imediatamente
      setVersaoImagem((anterior) => anterior + 1);
      // Informa ao usuário que a alteração foi concluída com sucesso
      setMensagemFeedback('Registro atualizado com sucesso!');
    } catch (erro) {
      // Imprime o erro no console para diagnóstico
      console.error(erro);
      // Exibe erro no componente de alerta
      setMensagemFeedback('Erro ao atualizar registro');
    }
  };

  // Trata alterações nos campos de texto e selects do formulário de edição
  const manipularMudancaTexto = (evento) => {
    // Extrai o nome do campo e o novo valor digitado
    const { name, value } = evento.target;

    // Atualiza a lista no estado de forma imutável
    setRegistros((anterior) => {
      // Clona o array original
      const copia = [...anterior];
      // Modifica apenas a propriedade alterada no registro atual
      copia[indiceAtual] = { ...copia[indiceAtual], [name]: value };
      // Retorna o array atualizado
      return copia;
    });
  };

  // Trata a seleção de um novo arquivo de imagem
  const manipularMudancaImagem = (evento) => {
    // Captura o primeiro arquivo selecionado
    const arquivo = evento.target.files[0];

    // Se houver arquivo selecionado
    if (arquivo) {
      // Salva o arquivo no estado
      setArquivoImagem(arquivo);
      // Cria a URL temporária para visualização imediata em tela
      setUrlPreviaImagem(URL.createObjectURL(arquivo));
    }
  };

  return (
    // Estrutura raiz preservando a classe CSS original da aplicação
    <div className="Interface">
      {/* Cabeçalho padrão do evento */}
      <header>
        <img className="imgFoto" style={estilos.imgFoto} src={imagemTorta} alt="Torta na Cara" />
        <div>
          <h1>TORTA NA CARA</h1>
          <h2>Semana Paulo Freire</h2>
        </div>
        <img className="imgPaulo" src={imagemPaulo} alt="Paulo Freire" />
      </header>

      {/* Seção com as mesmas medidas e estilos originais de layout */}
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
        {/* Renderização condicional: se não estiver autenticado, exibe o Login */}
        {!autenticado ? (
          // Formulário de Login de Acesso
          <Form onSubmit={manipularEnvioLogin} style={{ marginTop: '35px' }}>
            <h2 style={{ marginBottom: 25 }}>Acesso às Alterações</h2>

            {/* Campo Usuário */}
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

            {/* Campo Senha */}
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

            {/* Botão para submissão do login */}
            <Button
              variant="primary"
              type="submit"
              style={{ fontSize: 22, padding: '5px 25px', color: 'white', backgroundColor: 'Green', border: 'none' }}
            >
              Entrar
            </Button>

            {/* Mensagem caso o login seja rejeitado */}
            {mensagemErroLogin && (
              <Alert variant="danger" style={{ width: '50%', margin: '20px auto 0', fontSize: 14 }}>
                {mensagemErroLogin}
              </Alert>
            )}
          </Form>
        ) : (
          // Formulário de Alteração (exibido apenas após login com sucesso)
          <Form>
            {/* Bloco de filtro por tema */}
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

            {/* Bloco de busca por número da pergunta */}
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

            {/* Renderiza os campos de edição somente se houver registros carregados */}
            {registros.length > 0 && (
              <>
                <Form.Label>Pergunta Nº. {registros[indiceAtual].numero}</Form.Label>

                {/* Seleção de Tema da Pergunta Atual */}
                <Form.Group>
                  <Form.Label>Tema:</Form.Label>
                  <Form.Control
                    as="select"
                    name="tema"
                    value={registros[indiceAtual].tema}
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

                {/* Edição do Enunciado da Pergunta */}
                <Form.Group className="mt-2">
                  <Form.Label>Pergunta:</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="pergunta"
                    value={registros[indiceAtual].pergunta}
                    onChange={manipularMudancaTexto}
                    style={{ width: '60%', height: 80, margin: '0 auto', marginTop: 10 }}
                  />
                </Form.Group>

                {/* Edição das alternativas A, B, C e D */}
                {['A', 'B', 'C', 'D'].map((opcao) => (
                  <Form.Group key={opcao} className="mt-2">
                    <Form.Label>{opcao}:</Form.Label>
                    <Form.Control
                      type="text"
                      name={opcao}
                      value={registros[indiceAtual][opcao]}
                      onChange={manipularMudancaTexto}
                      style={{ width: '60%', margin: '0 auto' }}
                    />
                  </Form.Group>
                ))}

                {/* Seleção da Resposta Correta */}
                <Form.Group className="mt-2">
                  <Form.Label>Resposta Correta:</Form.Label>
                  <Form.Control
                    as="select"
                    name="correta"
                    value={registros[indiceAtual].correta}
                    onChange={manipularMudancaTexto}
                    style={{ width: '20%', margin: '0 auto' }}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </Form.Control>
                </Form.Group>

                {/* Campo de atualização da imagem */}
                <Form.Group className="mt-3">
                  <Form.Label>Imagem:</Form.Label>
                  <Form.Control 
                    type="file" 
                    onChange={manipularMudancaImagem} 
                    style={{ width: '60%', margin: '0 auto' }}
                  />
                </Form.Group>

                {/* Pré-visualização da imagem atual/nova */}
                {urlPreviaImagem && (
                  <div className="mt-3">
                    <img
                      src={urlPreviaImagem}
                      alt="Pré-visualização"
                      style={{ width: 200, height: 200, borderRadius: 100, objectFit: 'cover' }}
                    />
                  </div>
                )}

                {/* Botões de navegação e salvamento */}
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

        {/* Mensagens de notificação de sucesso ou erro */}
        {mensagemFeedback && <Alert variant="info">{mensagemFeedback}</Alert>}
      </section>
    </div>
  );
};

export default Alterar;