// Importa o arquivo de estilos CSS específico para os elementos visuais deste componente
import estilos from './interface.css';

// Importa a imagem estática da torta usada no cabeçalho
import imagemTorta from './img/torta.webp';

// Importa a imagem animada/estática do patrono Paulo Freire para o cabeçalho
import imagemPauloFreire from './img/pauloFreire.gif';

// Importa o ícone exibido no modal/aviso de erro (torta)
import iconeTorta from './img/pie6.png';

// Importa o ícone exibido no modal/aviso de acerto (joinha positivo)
import iconeJoinha from './img/joinha2.png';

// Importa o componente base de ícones do FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Importa os ícones específicos de avanço e relógio do FontAwesome
import { faForward, faClock } from '@fortawesome/free-solid-svg-icons';

// Importa o React e os hooks essenciais para manipulação de estado e ciclo de vida
import React, { useState, useEffect } from 'react';

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

// Define a URL base da API (prioriza variável de ambiente ou usa a porta 3042 como padrão)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3042';

// Função para embaralhar um array (algoritmo Fisher-Yates)
const embaralharArray = (array) => {
  const lista = [...array];
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
};

// Função principal que declara o componente funcional Interface
function Interface() {
  // Estado para controlar a exibição do modal de erro/derrota
  const [exibirPerdeu, setExibirPerdeu] = useState(false);

  // Estado para controlar a visibilidade do botão manual de avançar questão
  const [exibirAvancar, setExibirAvancar] = useState(false);

  // Estado para controlar a exibição do modal de acerto/parabéns
  const [exibirAcertou, setExibirAcertou] = useState(false);

  // Estado para sinalizar visualmente que o tempo da questão expirou
  const [exibirTempoEsgotado, setExibirTempoEsgotado] = useState(false);

  // Estado para desabilitar cliques nos botões de alternativas após responder
  const [bloquearInterface, setBloquearInterface] = useState(false);

  // Estado para acionar a reprodução do áudio de aviso dos últimos 14 segundos
  const [exibirAudioAviso, setExibirAudioAviso] = useState(false);

  // Estado que armazena os dados do objeto da pergunta atualmente em exibição
  const [perguntaAtual, setPerguntaAtual] = useState({});

  // NOVO: Estado que armazena as opções da rodada na ordem embaralhada
  const [opcoesEmbaralhadas, setOpcoesEmbaralhadas] = useState([]);

  // Estado contendo a lista de identificadores (IDs) das questões já sorteadas na sessão
  const [historicoSorteio, setHistoricoSorteio] = useState([]);

  // Estado numérico que guarda a contagem regressiva em segundos (iniciando em 90)
  const [segundosRestantes, setSegundosRestantes] = useState(90);

  // Estado booleano para pausar ou continuar o decrescimento do cronômetro
  const [cronometroAtivo, setCronometroAtivo] = useState(true);

  // Função assíncrona responsável por sortear e carregar uma nova pergunta da API
  const buscarPerguntaAleatoria = async (tentativas = 0) => {
    setExibirAcertou(false);
    setBloquearInterface(false);
    setExibirPerdeu(false);
    setExibirTempoEsgotado(false);
    setExibirAudioAviso(false);
    setSegundosRestantes(90);
    setCronometroAtivo(true);

    try {
      const resposta = await axios.get(`${API_URL}/consultaAleatoria`);
      const idSorteado = resposta.data.numero;

      if (historicoSorteio.includes(idSorteado) && tentativas < 5) {
        return buscarPerguntaAleatoria(tentativas + 1);
      }

      setHistoricoSorteio((anterior) => [...anterior, idSorteado]);
      setPerguntaAtual(resposta.data);

      // Embaralha as alternativas mantendo o mapeamento com a chave original (A, B, C, D)
      const listaOpcoes = ['A', 'B', 'C', 'D'].map((letra) => ({
        chaveOriginal: letra,
        texto: resposta.data[letra]
      }));

      setOpcoesEmbaralhadas(embaralharArray(listaOpcoes));
    } catch (erro) {
      console.error('Erro ao buscar dados da API:', erro);
    }
  };

  // Efeito responsável pelo ciclo do cronômetro a cada segundo
  useEffect(() => {
    let temporizador = null;

    if (cronometroAtivo) {
      temporizador = setInterval(() => {
        setSegundosRestantes((anterior) => {
          if (anterior <= 1) {
            setExibirTempoEsgotado(true);
            setExibirPerdeu(true);
            setBloquearInterface(true);
            setCronometroAtivo(false);
            clearInterval(temporizador);
            return 0;
          }

          if (anterior - 1 === 14) {
            setExibirAudioAviso(true);
          }

          return anterior - 1;
        });
      }, 1000);
    }

    return () => clearInterval(temporizador);
  }, [cronometroAtivo]);

  useEffect(() => {
    buscarPerguntaAleatoria();
  }, []);

  const formatarTempo = (tempo) => {
    const minutos = Math.floor(tempo / 60);
    const segundos = tempo % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  };

  // Recebe a chave original (qual alternativa aquela opção representava na API)
  const selecionarOpcao = (chaveOriginal) => {
    setCronometroAtivo(false);
    setExibirAudioAviso(false);
    setBloquearInterface(true);

    // Valida comparando a chave original com a coluna/campo correta da API
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

  const letrasBotoes = ['A', 'B', 'C', 'D'];

  return (
    <div className="Interface">
      <header>
        <img className="imgFoto" style={estilos.imgFoto} src={imagemTorta} alt="Torta na Cara" />
        <div>
          <h1>TORTA NA CARA</h1>
          <h2>Semana Paulo Freire</h2>
        </div>
        <img className="imgPaulo" src={imagemPauloFreire} alt="Paulo Freire" />
      </header>

      <section>
        <div className="perguntas">
          <div
            className="cronometro"
            style={{
              fontSize: '2em',
              fontWeight: 'bold',
              color: segundosRestantes <= 10 ? '#ff1900' : '#000',
              marginBottom: '-60px',
              marginLeft: '20px',
              marginTop: '-20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <p>Tempo:</p>
            <FontAwesomeIcon icon={faClock} /> {formatarTempo(segundosRestantes)}
          </div>

          <div className="tema">
            <p className="titTema">Tema: </p>
            {perguntaAtual.tema ? <p>{perguntaAtual.tema}</p> : <p>Carregando...</p>}
          </div>

          <div className="titPergunta">
            <p className="titTema">Pergunta: </p>
          </div>

          <div className="Pergunta">
            <p>
              {perguntaAtual.imagem && (
                <img src={`${API_URL}/${perguntaAtual.imagem}`} alt="Imagem da pergunta" />
              )}
              {perguntaAtual.pergunta}
            </p>
          </div>

          <div className="Debug">
            <p><span>ID Atual: </span>{perguntaAtual.numero}</p>
          </div>

          {historicoSorteio.length > 1 && (
            <div className="Debug1">
              <p><span>Questões anteriores: </span>{historicoSorteio.slice(0, -1).join(', ')}</p>
            </div>
          )}
        </div>

        <div className="alternativas">
          <div className="boxAlternativas">
            {/* 
              Renderiza as opções embaralhadas. 
              Visualmente exibe sempre A, B, C e D na tela, 
              mas envia 'item.chaveOriginal' para a validação.
            */}
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

          <div id="acao" className="botoesAcao">
            {exibirAudioAviso && <ReactAudioPlayer src={audioContagemRegressiva} autoPlay />}

            {exibirTempoEsgotado && (
              <div>
                <button className="Perdeu">TEMPO ESGOTADO!!</button>
              </div>
            )}

            {exibirAvancar && (
              <button className="Avancar" onClick={() => buscarPerguntaAleatoria()}>
                PRÓXIMA PERGUNTA <FontAwesomeIcon className="icon" icon={faForward} />
              </button>
            )}
          </div>
        </div>
      </section>

      {exibirPerdeu && (
        <div className="errou">
          <img src={iconeTorta} alt="Torta" />
          <p>TORTA NA CARA!</p>
          {!exibirTempoEsgotado && <ReactAudioPlayer src={audioTortaNaCara} autoPlay />}
          <button className="Avancar" onClick={() => buscarPerguntaAleatoria()}>
            PRÓXIMA <FontAwesomeIcon icon={faForward} />
          </button>
        </div>
      )}

      {exibirAcertou && (
        <div className="acertou">
          <img src={iconeJoinha} alt="Joinha" />
          <p>ACERTOU!</p>
          <ReactAudioPlayer src={audioAplausos} autoPlay />
          <button className="Avancar" onClick={() => buscarPerguntaAleatoria()}>
            PRÓXIMA <FontAwesomeIcon icon={faForward} />
          </button>
        </div>
      )}
    </div>
  );
}

export default Interface;