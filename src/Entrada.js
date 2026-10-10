// Importa o arquivo CSS com as regras globais e específicas de layout e animação
import './interface.css';

// Importa o React e os hooks useState (para gerenciar estados) e useEffect (para executar efeitos colaterais)
import React, { useState, useEffect } from 'react';

// Importa a biblioteca Axios para realizar chamadas assíncronas HTTP à API
import axios from 'axios';

// Importa a imagem do patrono da educação Paulo Freire
import PF from './img/PaulaoFreirao.png';

// Importa a imagem do elemento gráfico da torta
import pie from './img/pie6.png';

// Obtém o endereço base da API a partir das variáveis de ambiente do React ou adota a porta 3042 local como padrão
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3042';

// Declara o componente funcional Entrada recebendo a função callback 'onIniciarJogo' via desestruturação de props
const Entrada = ({ onIniciarJogo }) => {
  // Cria o estado para armazenar a quantidade total de questões cadastradas
  const [totalQuestoes, setTotalQuestoes] = useState(0);

  // Cria o estado para armazenar a quantidade total de categorias/temas cadastrados
  const [totalTemas, setTotalTemas] = useState(0);

  // Efeito executado apenas uma vez logo após a montagem do componente no DOM
  useEffect(() => {
    // Declara a função assíncrona responsável por buscar as contagens de dados no servidor
    const carregarTotais = async () => {
      try {
        // Envia requisição GET à rota /registros para buscar todas as perguntas cadastradas
        const resQuestoes = await axios.get(`${API_URL}/registros`);

        // Verifica se a resposta recebida é uma lista válida em formato de array
        if (Array.isArray(resQuestoes.data)) {
          // Atualiza o total de questões com base na quantidade de itens do array retornado
          setTotalQuestoes(resQuestoes.data.length);
        }

        // Envia requisição GET à rota /temas para buscar a lista de categorias disponíveis
        const resTemas = await axios.get(`${API_URL}/temas`);

        // Verifica se os temas foram retornados em formato de array
        if (Array.isArray(resTemas.data)) {
          // Atualiza o total de temas com o tamanho do array retornado
          setTotalTemas(resTemas.data.length);
        }
      } catch (erro) {
        // Imprime mensagem no console caso ocorra qualquer erro de conexão ou de resposta HTTP
        console.error('Erro ao carregar totais:', erro);
      }
    };

    // Invoca a função de carregamento declarada acima
    carregarTotais();
  }, []); // Array de dependências vazio garante que o efeito rode apenas na inicialização

  // Renderiza a estrutura visual da tela inicial
  return (
    // Container externo cobrindo 100% da largura e altura da janela (viewport) e ocultando barras de rolagem
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Container visual central com a identidade visual da tela de boas-vindas */}
      <div className="Entrada-wrapper">
        {/* Renderiza a imagem ilustrativa de Paulo Freire */}
        <img className="Entrada-foto" src={PF} alt="Paulo Freire" />

        {/* Agrupamento dos títulos de apresentação */}
        <div className="Entrada-textos">
          {/* Subtítulo institucional do evento */}
          <div className="Entrada-subTitulo">
            <h2>Semana Paulo Freire</h2>
          </div>
          {/* Título principal do jogo */}
          <div className="Entrada-titulo">
            <h1>TORTA NA CARA !</h1>
          </div>
        </div>

        {/* Div que aplica a classe de animação e exibe a imagem da torta */}
        <div className="Entrada-torta">
          <img src={pie} alt="Torta" />
        </div>
      </div>

      {/* BOTÃO JOGAR BLINDADO: Estilos embutidos com Z-INDEX 99999 (impossível ficar oculto) */}
      <button
        // Define explicitamente o tipo do botão HTML
        type="button"
        // Evento disparado quando o usuário clica no botão
        onClick={() => {
          // Checa se a propriedade 'onIniciarJogo' recebida é realmente uma função válida
          if (typeof onIniciarJogo === 'function') {
            // Executa a função passada pelo componente pai para dar início à partida
            onIniciarJogo();
          } else {
            // Emite aviso no console caso a função de callback não tenha sido informada
            console.warn('Função onIniciarJogo não informada pelo index.js!');
          }
        }}
        // Estilização inline para fixação, centralização e sobreposição de tela
        style={{
          position: 'fixed',                              // Fixa o botão na janela
          bottom: '80px',                                 // Posiciona a 80px do fundo da tela
          left: '50%',                                    // Move o ponto de origem para o centro horizontal
          transform: 'translateX(-50%)',                  // Corrige o alinhamento centralizando pelo meio do elemento
          zIndex: 99999,                                  // Garante prioridade máxima na camada visual (sobre outros elementos)
          pointerEvents: 'auto',                          // Garante que o botão seja sempre clicável
          fontSize: '1.6rem',                             // Define tamanho ampliado para a tipografia
          fontWeight: 800,                                // Define peso de fonte extra em negrito
          padding: '14px 45px',                           // Define espaçamento interno do botão
          borderRadius: '20px',                           // Arredonda os cantos da borda
          backgroundColor: '#28a745',                     // Aplica tom verde de destaque
          color: '#ffffff',                               // Define a cor do texto para branco
          border: '3px solid #ffffff',                    // Aplica borda branca grossa de acabamento
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6)',     // Cria sombra projetada escura
          cursor: 'pointer',                              // Transforma o ponteiro do mouse em mãozinha ao passar por cima
          letterSpacing: '2px',                           // Espaçamento entre as letras
          textTransform: 'uppercase'                      // Converte todo o texto para letras maiúsculas
        }}
      >
        JOGAR
      </button>

      {/* Rodapé flutuante com contadores de dados */}
      <div
        // Estilização inline do badge inferior de contagem
        style={{
          position: 'fixed',                                // Fixa o painel de status
          bottom: '15px',                                   // Posiciona próximo ao rodapé da página
          left: '50%',                                      // Centraliza no eixo horizontal
          transform: 'translateX(-50%)',                    // Ajusta o alinhamento fino central
          zIndex: 9999,                                     // Mantém acima da camada de fundo
          pointerEvents: 'none',                            // Impede que capture cliques, evitando bloquear elementos de trás
          display: 'flex',                                  // Disposição em linha flexível
          alignItems: 'center',                             // Alinha os textos verticalmente
          gap: '16px',                                      // Espaçamento entre os contadores
          fontSize: '1.05rem',                              // Tamanho de leitura das estatísticas
          fontWeight: 'bold',                               // Texto em negrito
          color: '#222',                                    // Cor escura para leitura limpa
          backgroundColor: 'rgba(255, 255, 255, 0.85)',     // Fundo branco semitransparente
          padding: '8px 22px',                              // Espaçamento interno da caixa
          borderRadius: '25px',                             // Borda em formato de pílula
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',       // Sombra suave sob a pílula
          whiteSpace: 'nowrap'                              // Impede que o texto quebre linhas
        }}
      >
        {/* Exibe o número total de questões recuperadas do banco */}
        <span>📚 Total de Questões: {totalQuestoes}</span>
        {/* Separador vertical entre os contadores */}
        <span>|</span>
        {/* Exibe o total de temas cadastrados */}
        <span>🏷️ Total de Temas: {totalTemas}</span>
      </div>
    </div>
  );
};

// Exporta o componente Entrada como padrão para ser usado na navegação da tela principal
export default Entrada;