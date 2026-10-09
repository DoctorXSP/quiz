// Importa o React e os hooks useState (controle de estados) e useEffect (efeitos colaterais do ciclo de vida)[cite: 8]
import React, { useState, useEffect } from 'react';

// Importa o cliente ReactDOM para inicializar e renderizar a aplicação na árvore DOM (React 18+)[cite: 8]
import ReactDOM from 'react-dom/client';

// Importa a folha de estilos CSS global da aplicação[cite: 8]
import './index.css';

// Importa a tela principal da partida do jogo[cite: 8]
import Interface from './interface';

// Importa o componente de formulário para inserção manual de novas perguntas[cite: 8]
import Inserir from './Inserir';

// Importa a tela inicial de entrada com animações e dados de resumo[cite: 8]
import Entrada from './Entrada';

// Importa a tela administrativa para alteração e navegação de perguntas cadastradas[cite: 8]
import Alterar from './alterar';

// Importa a funcionalidade de geração de questões automática com inteligência artificial[cite: 8]
import GerarIA from './GerarIA';

// Importa o componente para exportação e restauração de dados via arquivo ZIP[cite: 8]
import Backup from './Backup'; // Novo módulo de Backup[cite: 8]

// Declara o componente funcional raiz da aplicação[cite: 8]
function App() {
  // Estado que armazena a tela ativa no momento (inicializa na tela 'Entrada')[cite: 8]
  const [pagina, setPagina] = useState('Entrada');

  // Estado booleano que controla a visibilidade do menu suspenso em telas desktop[cite: 8]
  const [isMenuVisivel, setIsMenuVisivel] = useState(false);

  // Estado booleano que controla se o menu gaveta/hambúrguer está aberto em dispositivos móveis[cite: 8]
  const [menuAbertoMobile, setMenuAbertoMobile] = useState(false);

  // Função auxiliar para mudar a tela atual e garantir o fechamento do menu mobile[cite: 8]
  const lidarComCliqueNoBotao = (nomeDaPagina) => {
    // Atualiza a tela a ser renderizada[cite: 8]
    setPagina(nomeDaPagina);
    // Fecha o menu no mobile após a escolha da opção[cite: 8]
    setMenuAbertoMobile(false);
  };

  // Efeito responsável por monitorar o ponteiro do mouse no desktop para exibir o menu no topo[cite: 8]
  useEffect(() => {
    // Função disparada a cada movimento do cursor na janela[cite: 8]
    const lidarComMovimentoDoMouse = (e) => {
      // Aplica a lógica apenas se a largura da janela for de computador/desktop (> 768px)[cite: 8]
      if (window.innerWidth > 768) {
        // Se a posição vertical do cursor (clientY) estiver a menos de 50px do topo, exibe o menu[cite: 8]
        if (e.clientY < 50) {
          setIsMenuVisivel(true);
        } else {
          // Caso contrário, oculta o menu quando o mouse se afasta do topo[cite: 8]
          setIsMenuVisivel(false);
        }
      }
    };

    // Registra o ouvinte de evento global de movimento do mouse[cite: 8]
    window.addEventListener('mousemove', lidarComMovimentoDoMouse);

    // Função de limpeza: remove o ouvinte ao desmontar o componente para evitar memory leaks[cite: 8]
    return () => {
      window.removeEventListener('mousemove', lidarComMovimentoDoMouse);
    };
  }, []); // Array de dependências vazio garante que o listener seja configurado apenas uma vez[cite: 8]

  // Renderização do layout principal da aplicação[cite: 8]
  return (
    // Container principal envolvendo a navegação e o conteúdo dinâmico[cite: 8]
    <div className='Menu1'>
      {/* Botão Hambúrguer no smartphone */}
      <button 
        type="button"
        // Alterna dinamicamente a classe 'aberto' dependendo do estado do menu[cite: 8]
        className={`btn-hamburguer ${menuAbertoMobile ? 'aberto' : ''}`}
        // Inverte o estado booleano ao ser clicado (abre/fecha)[cite: 8]
        onClick={() => setMenuAbertoMobile(!menuAbertoMobile)}
        aria-label="Abrir menu"
      >
        {/* Mostra ícone de fechar (✕) se aberto ou hambúrguer (☰) se fechado */}
        {menuAbertoMobile ? '✕' : '☰'}
      </button>

      {/* Camada para fechar ao tocar fora no mobile */}
      {/* Exibe o fundo escurecido apenas quando o menu mobile estiver visível */}
      {menuAbertoMobile && (
        <div 
          className="overlay-mobile" 
          // Fecha o menu ao clicar fora dele[cite: 8]
          onClick={() => setMenuAbertoMobile(false)}
        />
      )}

      {/* Barra de Menus */}
      {/* Aplica classes condicionais para exibição no desktop (ao passar o mouse) e no mobile (ao abrir) */}
      <div className={`menu-barra ${isMenuVisivel ? 'visivel-desktop' : ''} ${menuAbertoMobile ? 'aberto-mobile' : ''}`}>
        {/* Botão para iniciar o jogo abrindo a tela 'Interface' */}
        <button className='btn' onClick={() => lidarComCliqueNoBotao('Interface')}>INICIAR JOGO</button>
        {/* Botão para voltar à tela inicial/pausa 'Entrada' */}
        <button className='btn' onClick={() => lidarComCliqueNoBotao('Entrada')}>PAUSAR</button>
        {/* Botão para abrir o formulário de cadastro manual de perguntas */}
        <button className='btn' onClick={() => lidarComCliqueNoBotao('Inserir')}>INSERIR PERGUNTAS</button>
        {/* Botão para abrir o módulo de criação de questões com IA */}
        <button className='btn' onClick={() => lidarComCliqueNoBotao('GerarIA')}>INSERIR COM IA</button>
        {/* Botão para abrir o painel de edição e consulta de perguntas existentes */}
        <button className='btn' onClick={() => lidarComCliqueNoBotao('Alterar')}>ALTERAR PERGUNTAS</button>
        {/* Botão para abrir o módulo de backup e restauração */}
        <button className='btn' onClick={() => lidarComCliqueNoBotao('Backup')}>BACKUP</button>
        
      </div>

      {/* Renderização condicional das Telas */}
      {/* Exibe a tela da partida quando a página ativa for 'Interface' */}
      {pagina === 'Interface' && <Interface />}

      {/* Exibe a tela de boas-vindas repassando a função para começar a partida via prop */}
      {pagina === 'Entrada' && (
        <Entrada onIniciarJogo={() => lidarComCliqueNoBotao('Interface')} />
      )}

      {/* Exibe a tela de inserção manual quando selecionada */}
      {pagina === 'Inserir' && <Inserir />}

      {/* Exibe o gerador de questões via IA quando selecionado */}
      {pagina === 'GerarIA' && <GerarIA />}

      {/* Exibe a tela de alteração e listagem de questões quando selecionada */}
      {pagina === 'Alterar' && <Alterar />}

      {/* Exibe a tela de backup quando selecionada */}
      {pagina === 'Backup' && <Backup />}
     
    </div>
  );
}

// Localiza o elemento com id 'root' no HTML e cria o nó raiz de renderização do React[cite: 8]
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderiza o componente App envolvido pelo StrictMode para verificação de boas práticas em desenvolvimento[cite: 8]
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);