// Importa o arquivo CSS com as regras globais e específicas de layout e animação[cite: 5]
import './interface.css';

// Importa o React e os hooks useState (para gerenciar estados) e useEffect (para executar efeitos colaterais)[cite: 5]
import React, { useState, useEffect } from 'react';

// Importa a biblioteca Axios para realizar chamadas assíncronas HTTP à API[cite: 5]
import axios from 'axios';

// Importa a imagem do patrono da educação Paulo Freire[cite: 5]
import PF from './img/PaulaoFreirao.png';

// Importa a imagem do elemento gráfico da torta[cite: 5]
import pie from './img/pie6.png';

// Obtém o endereço base da API a partir das variáveis de ambiente do React ou adota a porta 3042 local como padrão[cite: 5]
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3042';

// Declara o componente funcional Entrada recebendo a função callback 'onIniciarJogo' via desestruturação de props[cite: 5]
const Entrada = ({ onIniciarJogo }) => {
  // Cria o estado para armazenar a quantidade total de questões cadastradas[cite: 5]
  const [totalQuestoes, setTotalQuestoes] = useState(0);

  // Cria o estado para armazenar a quantidade total de categorias/temas cadastrados[cite: 5]
  const [totalTemas, setTotalTemas] = useState(0);

  // Efeito executado apenas uma vez logo após a montagem do componente no DOM[cite: 5]
  useEffect(() => {
    // Declara a função assíncrona responsável por buscar as contagens de dados no servidor[cite: 5]
    const carregarTotais = async () => {
      try {
        // Envia requisição GET à rota /registros para buscar todas as perguntas cadastradas[cite: 5]
        const resQuestoes = await axios.get(`${API_URL}/registros`);

        // Verifica se a resposta recebida é uma lista válida em formato de array[cite: 5]
        if (Array.isArray(resQuestoes.data)) {
          // Atualiza o total de questões com base na quantidade de itens do array retornado[cite: 5]
          setTotalQuestoes(resQuestoes.data.length);
        }

        // Envia requisição GET à rota /temas para buscar a lista de categorias disponíveis[cite: 5]
        const resTemas = await axios.get(`${API_URL}/temas`);

        // Verifica se os temas foram retornados em formato de array[cite: 5]
        if (Array.isArray(resTemas.data)) {
          // Atualiza o total de temas com o tamanho do array retornado[cite: 5]
          setTotalTemas(resTemas.data.length);
        }
      } catch (erro) {
        // Imprime mensagem no console caso ocorra qualquer erro de conexão ou de resposta HTTP[cite: 5]
        console.error('Erro ao carregar totais:', erro);
      }
    };

    // Invoca a função de carregamento declarada acima[cite: 5]
    carregarTotais();
  }, []); // Array de dependências vazio garante que o efeito rode apenas na inicialização[cite: 5]

  // Renderiza a estrutura visual da tela inicial[cite: 5]
  return (
    // Container externo cobrindo 100% da largura e altura da janela (viewport) e ocultando barras de rolagem[cite: 5]
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Container visual central com a identidade visual da tela de boas-vindas */}[cite: 5]
      <div className="Entrada-wrapper">
        {/* Renderiza a imagem ilustrativa de Paulo Freire */}[cite: 5]
        <img className="Entrada-foto" src={PF} alt="Paulo Freire" />

        {/* Agrupamento dos títulos de apresentação */}[cite: 5]
        <div className="Entrada-textos">
          {/* Subtítulo institucional do evento */}[cite: 5]
          <div className="Entrada-subTitulo">
            <h2>Semana Paulo Freire</h2>
          </div>
          {/* Título principal do jogo */}[cite: 5]
          <div className="Entrada-titulo">
            <h1>TORTA NA CARA !</h1>
          </div>
        </div>

        {/* Div que aplica a classe de animação e exibe a imagem da torta */}[cite: 5]
        <div className="Entrada-torta">
          <img src={pie} alt="Torta" />
        </div>
      </div>

      {/* BOTÃO JOGAR BLINDADO: Estilos embutidos com Z-INDEX 99999 (impossível ficar oculto) */}[cite: 5]
      <button
        // Define explicitamente o tipo do botão HTML[cite: 5]
        type="button"
        // Evento disparado quando o usuário clica no botão[cite: 5]
        onClick={() => {
          // Checa se a propriedade 'onIniciarJogo' recebida é realmente uma função válida[cite: 5]
          if (typeof onIniciarJogo === 'function') {
            // Executa a função passada pelo componente pai para dar início à partida[cite: 5]
            onIniciarJogo();
          } else {
            // Emite aviso no console caso a função de callback não tenha sido informada[cite: 5]
            console.warn('Função onIniciarJogo não informada pelo index.js!');
          }
        }}
        // Estilização inline para fixação, centralização e sobreposição de tela[cite: 5]
        style={{
          position: 'fixed',                              // Fixa o botão na janela[cite: 5]
          bottom: '80px',                                 // Posiciona a 80px do fundo da tela[cite: 5]
          left: '50%',                                    // Move o ponto de origem para o centro horizontal[cite: 5]
          transform: 'translateX(-50%)',                  // Corrige o alinhamento centralizando pelo meio do elemento[cite: 5]
          zIndex: 99999,                                  // Garante prioridade máxima na camada visual (sobre outros elementos)[cite: 5]
          pointerEvents: 'auto',                          // Garante que o botão seja sempre clicável[cite: 5]
          fontSize: '1.6rem',                             // Define tamanho ampliado para a tipografia[cite: 5]
          fontWeight: 800,                                // Define peso de fonte extra em negrito[cite: 5]
          padding: '14px 45px',                           // Define espaçamento interno do botão[cite: 5]
          borderRadius: '20px',                           // Arredonda os cantos da borda[cite: 5]
          backgroundColor: '#28a745',                     // Aplica tom verde de destaque[cite: 5]
          color: '#ffffff',                               // Define a cor do texto para branco[cite: 5]
          border: '3px solid #ffffff',                    // Aplica borda branca grossa de acabamento[cite: 5]
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6)',     // Cria sombra projetada escura[cite: 5]
          cursor: 'pointer',                              // Transforma o ponteiro do mouse em mãozinha ao passar por cima[cite: 5]
          letterSpacing: '2px',                           // Espaçamento entre as letras[cite: 5]
          textTransform: 'uppercase'                      // Converte todo o texto para letras maiúsculas[cite: 5]
        }}
      >
        JOGAR
      </button>

      {/* Rodapé flutuante com contadores de dados */}[cite: 5]
      <div
        // Estilização inline do badge inferior de contagem[cite: 5]
        style={{
          position: 'fixed',                                // Fixa o painel de status[cite: 5]
          bottom: '15px',                                   // Posiciona próximo ao rodapé da página[cite: 5]
          left: '50%',                                      // Centraliza no eixo horizontal[cite: 5]
          transform: 'translateX(-50%)',                    // Ajusta o alinhamento fino central[cite: 5]
          zIndex: 9999,                                     // Mantém acima da camada de fundo[cite: 5]
          pointerEvents: 'none',                            // Impede que capture cliques, evitando bloquear elementos de trás[cite: 5]
          display: 'flex',                                  // Disposição em linha flexível[cite: 5]
          alignItems: 'center',                             // Alinha os textos verticalmente[cite: 5]
          gap: '16px',                                      // Espaçamento entre os contadores[cite: 5]
          fontSize: '1.05rem',                              // Tamanho de leitura das estatísticas[cite: 5]
          fontWeight: 'bold',                               // Texto em negrito[cite: 5]
          color: '#222',                                    // Cor escura para leitura limpa[cite: 5]
          backgroundColor: 'rgba(255, 255, 255, 0.85)',     // Fundo branco semitransparente[cite: 5]
          padding: '8px 22px',                              // Espaçamento interno da caixa[cite: 5]
          borderRadius: '25px',                             // Borda em formato de pílula[cite: 5]
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',       // Sombra suave sob a pílula[cite: 5]
          whiteSpace: 'nowrap'                              // Impede que o texto quebre linhas[cite: 5]
        }}
      >
        {/* Exibe o número total de questões recuperadas do banco */}[cite: 5]
        <span>📚 Total de Questões: {totalQuestoes}</span>
        {/* Separador vertical entre os contadores */}[cite: 5]
        <span>|</span>
        {/* Exibe o total de temas cadastrados */}[cite: 5]
        <span>🏷️ Total de Temas: {totalTemas}</span>
      </div>
    </div>
  );
};

// Exporta o componente Entrada como padrão para ser usado na navegação da tela principal[cite: 5]
export default Entrada;