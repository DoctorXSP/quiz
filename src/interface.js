// Importa o arquivo de estilos CSS específico para os elementos visuais deste componente
import './interface.css';

// Importa a imagem estática da torta usada no cabeçalho
import imagemTorta from './img/torta.webp';

// Importa a imagem animada/estática de Paulo Freire para o cabeçalho
import imagemPauloFreire from './img/pauloFreire.gif';

// Importa o ícone exibido no modal/aviso de erro (torta)
import iconeTorta from './img/pie6.png';

// Importa o ícone exibido no modal/aviso de acerto (joinha positivo)
import iconeJoinha from './img/joinha2.png';

// Importa o componente base de ícones do FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Importa os ícones específicos de avanço e relógio do FontAwesome
import { faForward, faClock } from '@fortawesome/free-solid-svg-icons';

// Importa o React e os hooks necessários (adicionando useCallback para memorizar funções e corrigir o ESLint)
import React, { useState, useEffect, useCallback } from 'react';

// Importa o componente reprodutor de áudio para HTML5
import ReactAudioPlayer from 'react-audio-player';

// Importa o arquivo de áudio de efeito sonoro de derrota ("torta na cara")
import audioTortaNaCara from './audio/torta.mp3';

// Importa o arquivo de áudio de efeito sonoro de aplausos para resposta correta
import audioAplausos from './audio/aplausos.mp3';

// Importa o arquivo de áudio de contagem regressiva para os segundos finais
import audioContagemRegressiva from './audio/contagem.mp3';

// Importa a biblioteca Axios para realizar chamadas HTTP à API do backend
import axios from 'axios';

// Define a URL base da API (lendo do .env ou usando localhost:3042 como padrão)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3042';

// Função utilitária para embaralhar um array utilizando o algoritmo Fisher-Yates
const embaralharArray = (array) => {
  // Cria uma cópia rasa do array para não mutar a lista original diretamente
  const lista = [...array];
  // Percorre os itens do final para o início
  for (let i = lista.length - 1; i > 0; i--) {
    // Sorteia um índice aleatório correspondente
    const j = Math.floor(Math.random() * (i + 1));
    // Realiza a troca dos valores entre os índices
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  // Retorna a lista reorganizada de forma aleatória
  return lista;
};

function Interface() {
  // Controla a visibilidade da tela/modal de erro ("Torta na cara")
  const [exibirPerdeu, setExibirPerdeu] = useState(false);
  // Controla a exibição de um botão avulso de avançar na tela
  const [exibirAvancar, setExibirAvancar] = useState(false);
  // Controla a exibição do modal de acerto ("Acertou!")
  const [exibirAcertou, setExibirAcertou] = useState(false);
  // Indica se a derrota ocorreu especificamente por esgotamento do tempo limite
  const [exibirTempoEsgotado, setExibirTempoEsgotado] = useState(false);
  // Bloqueia as opções após o participante responder para evitar múltiplos cliques
  const [bloquearInterface, setBloquearInterface] = useState(false);
  // Dispara a reprodução do áudio de aviso nos últimos segundos
  const [exibirAudioAviso, setExibirAudioAviso] = useState(false);
  // Armazena todos os dados da questão corrente trazida do backend
  const [perguntaAtual, setPerguntaAtual] = useState({});
  // Guarda as opções de resposta (A, B, C, D) já embaralhadas para exibição
  const [opcoesEmbaralhadas, setOpcoesEmbaralhadas] = useState([]);
  // Armazena a lista de IDs de questões já sorteadas para evitar perguntas repetidas
  const [historicoSorteio, setHistoricoSorteio] = useState([]);
  // Guarda a quantidade de segundos restantes no cronômetro (inicializado em 90s)
  const [segundosRestantes, setSegundosRestantes] = useState(90);
  // Determina se a contagem do cronômetro está ocorrendo
  const [cronometroAtivo, setCronometroAtivo] = useState(true);

  // Função memorizada com useCallback para buscar uma nova questão na API sem gerar warnings no ESLint
  const buscarPerguntaAleatoria = useCallback(async (tentativas = 0) => {
    // Oculta modal de acerto anterior
    setExibirAcertou(false);
    // Destrava as opções de resposta para a nova rodada
    setBloquearInterface(false);
    // Oculta modal de erro
    setExibirPerdeu(false);
    // Limpa estado de tempo esgotado
    setExibirTempoEsgotado(false);
    // Desativa o alerta sonoro de tempo
    setExibirAudioAviso(false);
    // Oculta botão de avançar da área de ações
    setExibirAvancar(false);
    // Reinicia o tempo para 90 segundos
    setSegundosRestantes(90);
    // Inicia novamente a contagem do cronômetro
    setCronometroAtivo(true);

    try {
      // Requisita uma pergunta aleatória na rota /consultaAleatoria
      const resposta = await axios.get(`${API_URL}/consultaAleatoria`);
      const idSorteado = resposta.data.numero;

      // Flag auxiliar para identificar se a questão atual já foi utilizada
      let jaSorteado = false;

      // Atualiza o histórico usando callback funcional para ler o estado mais recente sem disparar recriação
      setHistoricoSorteio((anterior) => {
        if (anterior.includes(idSorteado)) {
          jaSorteado = true;
          return anterior;
        }
        return [...anterior, idSorteado];
      });

      // Se já foi sorteada e ainda não atingiu o limite de 5 tentativas recursivas, tenta buscar outra
      if (jaSorteado && tentativas < 5) {
        return buscarPerguntaAleatoria(tentativas + 1);
      }

      // Define os dados da pergunta recebida no estado
      setPerguntaAtual(resposta.data);

      // Prepara o array com as alternativas originais e seus respectivos textos
      const listaOpcoes = ['A', 'B', 'C', 'D'].map((letra) => ({
        chaveOriginal: letra,
        texto: resposta.data[letra]
      }));

      // Embaralha as alternativas antes de salvar no estado
      setOpcoesEmbaralhadas(embaralharArray(listaOpcoes));
    } catch (erro) {
      // Registra no console caso ocorra falha de conexão ou na API
      console.error('Erro ao buscar dados da API:', erro);
    }
  }, []); // Array de dependências vazio pois as atualizações usam callbacks de estado funcional

  // Efeito responsável por controlar o intervalo de 1 segundo do cronômetro
  useEffect(() => {
    let temporizador = null;

    // Caso o cronômetro esteja ligado:
    if (cronometroAtivo) {
      temporizador = setInterval(() => {
        setSegundosRestantes((anterior) => {
          // Quando resta 1 segundo ou menos, encerra o tempo
          if (anterior <= 1) {
            setExibirTempoEsgotado(true);
            setExibirPerdeu(true);
            setBloquearInterface(true);
            setCronometroAtivo(false);
            clearInterval(temporizador);
            return 0;
          }

          // Ativa o áudio de contagem regressiva ao atingir 14 segundos restantes
          if (anterior - 1 === 14) {
            setExibirAudioAviso(true);
          }

          // Decrementa 1 segundo a cada ciclo
          return anterior - 1;
        });
      }, 1000);
    }

    // Limpa o timer quando o cronômetro é pausado ou o componente desmontado
    return () => clearInterval(temporizador);
  }, [cronometroAtivo]);

  // Efeito executado na montagem do componente, agora contendo buscarPerguntaAleatoria na dependência sem alertas
  useEffect(() => {
    buscarPerguntaAleatoria();
  }, [buscarPerguntaAleatoria]);

  // Função auxiliar para formatar os segundos em formato MM:SS
  const formatarTempo = (tempo) => {
    const minutos = Math.floor(tempo / 60);
    const segundos = tempo % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  };

  // Função acionada quando o participante clica em uma alternativa
  const selecionarOpcao = (chaveOriginal) => {
    // Pausa o cronômetro imediatamente
    setCronometroAtivo(false);
    // Interrompe o áudio de aviso caso esteja tocando
    setExibirAudioAviso(false);
    // Trava os botões para impedir novos cliques
    setBloquearInterface(true);

    // Confere se a alternativa escolhida corresponde à resposta correta do backend
    if (chaveOriginal === perguntaAtual.correta) {
      setExibirAcertou(true);
      setExibirPerdeu(false);
      setExibirTempoEsgotado(false);
    } else {
      setExibirPerdeu(true);
      setExibirAcertou(false);
      setExibirTempoEsgotado(false);
    }
  };

  // Rótulos fixos das letras dos botões para exibição visual (A, B, C, D)
  const letrasBotoes = ['A', 'B', 'C', 'D'];

  // Verifica o comprimento do texto da pergunta para aplicar classes de tamanho no CSS
  const tamanhoTexto = perguntaAtual.pergunta ? perguntaAtual.pergunta.length : 0;
  const classeTamanhoPergunta = tamanhoTexto > 240 
    ? 'pergunta-extralonga' 
    : tamanhoTexto > 140 
      ? 'pergunta-longa' 
      : '';

  return (
    <div className="Interface">
      {/* Cabeçalho da página */}
      <header>
        <img className="imgFoto" src={imagemTorta} alt="Torta na Cara" />
        <div className="tituloHeader">
          <h1>TORTA NA CARA</h1>
          <h2>Semana Paulo Freire</h2>
        </div>
        <img className="imgPaulo" src={imagemPauloFreire} alt="Paulo Freire" />
      </header>

      {/* Seção principal do jogo */}
      <section>
        {/* Bloco de exibição da imagem da pergunta */}
        <div className="areaImagem">
          {perguntaAtual.imagem ? (
            <img src={`${API_URL}/${perguntaAtual.imagem}`} alt="Imagem da pergunta" />
          ) : (
            <div className="semImagem">Sem Imagem</div>
          )}
        </div>

        {/* Bloco central contendo cronômetro, tema e enunciado da pergunta */}
        <div className="perguntas">
          {/* Cronômetro com cor alterada para vermelho nos últimos 10 segundos */}
          <div
            className="cronometro"
            style={{
              fontSize: '1.8em',
              fontWeight: 'bold',
              color: segundosRestantes <= 10 ? '#ff1900' : '#000',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <p style={{ margin: 0 }}>Tempo:</p>
            <FontAwesomeIcon icon={faClock} /> {formatarTempo(segundosRestantes)}
          </div>

          {/* Exibição do tema da pergunta */}
          <div className="tema">
            <span className="titTema">Tema: </span>
            <span>{perguntaAtual.tema || 'Carregando...'}</span>
          </div>

          <div className="titPergunta">
            <span className="titTema">Pergunta: </span>
          </div>

          {/* Texto da pergunta com estilização de tamanho de texto dinâmico */}
          <div className={`Pergunta ${classeTamanhoPergunta}`}>
            <p>{perguntaAtual.pergunta}</p>
          </div>
        </div>

        {/* Bloco lateral contendo as opções de resposta */}
        <div className="alternativas">
          <div className="boxAlternativas">
            {/* Renderiza as alternativas que foram embaralhadas */}
            {opcoesEmbaralhadas.map((item, index) => {
              const letraVisual = letrasBotoes[index];
              return (
                <div className="opcao" key={index}>
                  <button
                    className={`btn${letraVisual}`}
                    onClick={() => selecionarOpcao(item.chaveOriginal)}
                    disabled={bloquearInterface}
                  >
                    {letraVisual}
                  </button>
                  <p className="textOpcao">{item.texto}</p>
                </div>
              );
            })}
          </div>

          {/* Área de controle de áudio e botões de ação */}
          <div id="acao" className="botoesAcao">
            {exibirAudioAviso && <ReactAudioPlayer src={audioContagemRegressiva} autoPlay />}

            {exibirAvancar && (
              <button className="Avancar" style={{ zIndex: 99999 }} onClick={() => buscarPerguntaAleatoria()}>
                PRÓXIMA PERGUNTA <FontAwesomeIcon className="icon" icon={faForward} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Rodapé informativo para depuração */}
      <footer className="rodape-debug">
        <span><strong>ID Atual:</strong> {perguntaAtual.numero ?? '-'}</span>
        {historicoSorteio.length > 1 && (
          <span> | <strong>Já sorteadas:</strong> {historicoSorteio.slice(0, -1).join(', ')}</span>
        )}
      </footer>

      {/* Modal exibido em caso de erro ou término do tempo */}
      {exibirPerdeu && (
        <div className="errou">
          <p>{exibirTempoEsgotado ? 'TEMPO ESGOTADO!!' : 'TORTA NA CARA!'}</p>
          <img src={iconeTorta} alt="Torta" />
          {!exibirTempoEsgotado && <ReactAudioPlayer src={audioTortaNaCara} autoPlay />}
          <button className="Avancar" style={{ zIndex: 99999 }} onClick={() => buscarPerguntaAleatoria()}>
            PRÓXIMA PERGUNTA <FontAwesomeIcon className="icon" icon={faForward} />
          </button>
        </div>
      )}

      {/* Modal exibido quando a resposta correta é escolhida */}
      {exibirAcertou && (
        <div className="acertou">
          <p>ACERTOU!</p>
          <img src={iconeJoinha} alt="Joinha" />
          <ReactAudioPlayer src={audioAplausos} autoPlay />
          <button className="Avancar" style={{ zIndex: 99999 }} onClick={() => buscarPerguntaAleatoria()}>
            PRÓXIMA PERGUNTA <FontAwesomeIcon className="icon" icon={faForward} />
          </button>
        </div>
      )}
    </div>
  );
}

export default Interface;