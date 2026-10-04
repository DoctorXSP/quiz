
// Importa a biblioteca React e os hooks useState e useEffect 
import React, { useState, useEffect } from 'react';
// Importa ReactDOM para renderizar o componente na raiz do HTML 
import ReactDOM from 'react-dom/client';
// Importa o arquivo de estilos CSS para o índice 
import './index.css';
// Importa os componentes de interface que serão exibidos 
import Interface from './interface'; //Tela do jogo
import Inserir from './Inserir'; //Tela para inserir perguntas
import Entrada from './Entrada'; //Tela do Titulo
import Alterar from './alterar'; //Tela par alterar as peguntas
import GerarIA from './GerarIA';

// Define o componente funcional App 
function App() {
  // Define a variável de estado 'pagina' para armazenar a página atual, iniciando com 'Entrada'. Use 'setPagina' para alterá-la.
  const [pagina, setPagina] = useState('Entrada');
  // Define a variável de estado 'isMenuVisivel' para controlar a visibilidade do menu, iniciando como falso. Use 'setIsMenuVisivel' para alterá-la.
  const [isMenuVisivel, setIsMenuVisivel] = useState(false);

  // Define a função 'lidarComCliqueNoBotao' que altera a página exibida quando um botão do menu é clicado.
  const lidarComCliqueNoBotao = (nomeDaPagina) => {
    // Atualiza a variável de estado 'pagina' com o nome da página fornecido.
    setPagina(nomeDaPagina);
  };

  // Define um efeito que é executado após a renderização do componente.
  useEffect(() => {
    // Define a função 'lidarComMovimentoDoMouse' que verifica se o mouse está próximo do topo da página.
    const lidarComMovimentoDoMouse = (e) => {
      // Se a coordenada Y do mouse for menor que 50px (mouse próximo do topo).
      if (e.clientY < 50) {
        // Exibe o menu definindo 'isMenuVisivel' como verdadeiro.
        setIsMenuVisivel(true);
      } else {
        // Esconde o menu definindo 'isMenuVisivel' como falso.
        setIsMenuVisivel(false);
      }
    };

    // Adiciona um ouvinte de evento para o movimento do mouse no objeto global 'window'.
    window.addEventListener('mousemove', lidarComMovimentoDoMouse);

    // Função de limpeza que é executada quando o componente é desmontado.
    return () => {
      // Remove o ouvinte de evento para o movimento do mouse para evitar vazamentos de memória.
      window.removeEventListener('mousemove', lidarComMovimentoDoMouse);
    };
  // O array de dependências vazio significa que o efeito é executado apenas uma vez após a renderização inicial.
  }, []);

  // Retorna a estrutura JSX do componente para ser renderizada.
  return (
    // Cria um contêiner div com a classe 'Menu1'.
    <div className='Menu1'>
      {/* Cria um contêiner div com estilo embutido para controlar a visibilidade do menu.*/}
      <div style={{ display: isMenuVisivel ? 'block' : 'none' }}>
        {/*// Cria botões do menu que, ao serem clicados, chamam 'lidarComCliqueNoBotao' com o nome da página correspondente.*/}
        <button className='btn' onClick={() => lidarComCliqueNoBotao('Interface')}>INICIAR JOGO</button>
        <button className='btn' onClick={() => lidarComCliqueNoBotao('Inserir')}>INSERIR PERGUNTAS</button>
        <button className='btn' onClick={() => lidarComCliqueNoBotao('GerarIA')}>INSERIR COM IA</button>
        <button className='btn' onClick={() => lidarComCliqueNoBotao('Alterar')}>ALTERAR PERGUNTAS</button>
                <button className='btn' onClick={() => lidarComCliqueNoBotao('Entrada')}>PAUSAR</button>
      </div>

      {/* Renderiza condicionalmente o componente correspondente à página atual.*/}
      {pagina === 'Interface' && <Interface />}
      {pagina === 'Inserir' && <Inserir />}
      {pagina === 'GerarIA' && <GerarIA />}
      {pagina === 'Alterar' && <Alterar />}
      {pagina === 'Entrada' && <Entrada />}
    </div>
  );
}

// Cria a raiz do React para renderizar o componente na div com id 'root'.
const root = ReactDOM.createRoot(document.getElementById('root'));
// Renderiza o componente principal App dentro da raiz no modo estrito.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
