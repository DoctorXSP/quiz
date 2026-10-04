// Importa o arquivo de estilos CSS como um objeto (CSS Modules ou classes mapeadas)
import styles from './interface.css';
// Importa o React e os hooks useState (gerenciamento de estado) e useEffect (efeitos colaterais)
import React, { useState, useEffect } from 'react';
// Importa a biblioteca Axios para realizar requisições HTTP à API
import axios from 'axios';
// Importa a imagem do Paulo Freire para ser utilizada no componente
import PF from './img/PaulaoFreirao.png';
// Importa a imagem da torta para ser utilizada no componente
import pie from './img/pie6.png';

// Define a URL base da API: usa a variável de ambiente se configurada, ou o endereço local padrão como fallback
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3042';

// Declara o componente funcional principal chamado Entrada
const Entrada = () => {
  // Cria a variável de estado 'totalQuestoes' e sua função atualizadora, inicializada com 0
  const [totalQuestoes, setTotalQuestoes] = useState(0);
  // Cria a variável de estado 'totalTemas' e sua função atualizadora, inicializada com 0
  const [totalTemas, setTotalTemas] = useState(0);

  // Hook que executa efeitos colaterais após o componente ser montado na tela
  useEffect(() => {
    // Declara uma função assíncrona interna para buscar os dados de totais no backend
    const carregarTotais = async () => {
      // Inicia bloco try para capturar eventuais falhas durante as requisições de rede
      try {
        // Realiza uma requisição GET assíncrona para o endpoint de registros de questões
        const resQuestoes = await axios.get(`${API_URL}/registros`);
        // Valida se a resposta retornada pela API é realmente um array
        if (Array.isArray(resQuestoes.data)) {
          // Atualiza o estado com a quantidade total de questões encontradas (tamanho do array)
          setTotalQuestoes(resQuestoes.data.length);
        }

        // Realiza uma requisição GET assíncrona para o endpoint de temas
        const resTemas = await axios.get(`${API_URL}/temas`);
        // Valida se os dados de temas retornados vêm no formato de array
        if (Array.isArray(resTemas.data)) {
          // Atualiza o estado com a quantidade total de temas encontrados (tamanho do array)
          setTotalTemas(resTemas.data.length);
        }
      // Captura qualquer erro ocorrido nas chamadas HTTP
      } catch (erro) {
        // Exibe no console do navegador uma mensagem de alerta com o erro detalhado
        console.error('Erro ao carregar totais:', erro);
      }
    };

    // Invoca a função assíncrona definida acima
    carregarTotais();
  // Array de dependências vazio: garante que o useEffect seja executado apenas uma vez na montagem
  }, []);

  // Retorna a estrutura visual em JSX que será renderizada na interface
  return (
    // Fragment do React (<>) para agrupar múltiplos elementos adjacentes sem criar nós extras no DOM
    <>
      {/* Comentário JSX: indicação de que o container a seguir preserva a disposição original */}
      {/* Container principal da tela inicial, aplicando classe CSS e estilos inline do módulo */}
      <div className="Entrada" style={styles.Entrada}>
        {/* Renderiza a imagem do Paulo Freire com classe, estilos e texto alternativo de acessibilidade */}
        <img className="fotoEntrada" style={styles.fotoEntrada} src={PF} alt="PauloFreire" />
        {/* Container que envolve o subtítulo da página */}
        <div className="subTitulo">
          {/* Título de nível 2 com o nome do evento */}
          <h2>Semana Paulo Freire</h2>
        {/* Fecha a div do subtítulo */}
        </div>
        {/* Container que envolve o título principal */}
        <div className="Titulo">
          {/* Título principal de destaque com o nome do jogo */}
          <h1>TORTA NA CARA !</h1>
        {/* Fecha a div do título principal */}
        </div>
        {/* Container da ilustração da torta */}
        <div className="Torta">
          {/* Renderiza a imagem da torta com texto alternativo vazio para leitura decorativa */}
          <img src={pie} alt="" />
        {/* Fecha a div da imagem da torta */}
        </div>
      {/* Fecha a div do container principal */}
      </div>

      {/* Comentário JSX: explica que a barra inferior fica flutuante e sobreposta sem quebrar o layout */}
      {/* Container fixo (badge/rodapé flutuante) para exibir os contadores */}
      <div
        // Inicia o objeto de estilos inline aplicados ao container flutuante
        style={{
          // Fixa o elemento em relação à janela de visualização do navegador
          position: 'fixed',
          // Posiciona o elemento a 15px de distância da borda inferior da tela
          bottom: '15px',
          // Posiciona o início da caixa a 50% da largura da tela
          left: '50%',
          // Desloca o elemento em -50% do seu próprio tamanho no eixo X para alinhá-lo perfeitamente ao centro
          transform: 'translateX(-50%)',
          // Camada de sobreposição muito alta para garantir que fique visível acima de outros elementos
          zIndex: 9999,
          // Impede que este painel capture cliques do mouse, permitindo interagir com elementos abaixo dele
          pointerEvents: 'none',
          // Aplica o modelo flexbox para organizar os textos horizontalmente
          display: 'flex',
          // Alinha os itens flexíveis verticalmente ao centro da barra
          alignItems: 'center',
          // Define um espaçamento de 16px entre cada elemento interno
          gap: '16px',
          // Define o tamanho da fonte do texto
          fontSize: '1.1rem',
          // Aplica peso em negrito para facilitar a leitura
          fontWeight: 'bold',
          // Define a cor do texto para um cinza escuro próximo ao preto
          color: '#222',
          // Fundo branco semitransparente (efeito translúcido com 75% de opacidade)
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          // Espaçamento interno: 8px vertical e 22px horizontal
          padding: '8px 22px',
          // Arredonda as bordas gerando um formato de pílula
          borderRadius: '25px',
          // Sombra suave ao redor da barra para dar sensação de profundidade e elevação
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          // Impede que o texto quebre em várias linhas caso o espaço seja reduzido
          whiteSpace: 'nowrap'
        // Fecha o objeto de estilos inline
        }}
      // Fecha a abertura da tag div do rodapé flutuante
      >
        {/* Exibe o rótulo com ícone e o valor numérico do total de questões armazenado no estado */}
        <span>📚 Total de Questões: {totalQuestoes}</span>
        {/* Exibe um separador visual em formato de barra vertical entre as duas métricas */}
        <span>|</span>
        {/* Exibe o rótulo com ícone e o valor numérico do total de temas armazenado no estado */}
        <span>🏷️ Total de Temas: {totalTemas}</span>
      {/* Fecha a div do container flutuante */}
      </div>
    {/* Fecha o Fragment do React */}
    </>
  // Fecha o bloco de retorno JSX do componente
  );
// Fecha a função do componente Entrada
};

// Exporta o componente Entrada como padrão para que possa ser importado em outros arquivos da aplicação
export default Entrada;