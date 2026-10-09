// Importa o núcleo do React e os hooks useState (gerenciamento de estados) e useRef (referência direta a elementos DOM)[cite: 4]
import React, { useState, useRef } from 'react';

// Importa o cliente Axios para efetuar requisições HTTP para a API[cite: 4]
import axios from 'axios';

// Importa componentes visuais reutilizáveis do React-Bootstrap[cite: 4]
import { Form, Button, Alert } from 'react-bootstrap';

// Importa a folha de estilos personalizada do projeto[cite: 4]
import './interface.css';

// Importa a imagem estática de logotipo 'torta'[cite: 4]
import imagemTorta from './img/torta.webp';

// Importa a animação GIF com o retrato de Paulo Freire[cite: 4]
import imagemPaulo from './img/pauloFreire.gif';

// Define a URL base da API lendo a variável de ambiente do React ou recorrendo ao fallback local na porta 3042[cite: 4]
const URL_API = process.env.REACT_APP_API_URL || 'http://localhost:3042';

// Declara o componente funcional principal 'Backup'[cite: 4]
const Backup = () => {
  // Estado para armazenar o valor digitado no campo de usuário do login[cite: 4]
  const [usuario, setUsuario] = useState('');

  // Estado para armazenar o valor digitado no campo de senha do login[cite: 4]
  const [senha, setSenha] = useState('');

  // Estado booleano que controla se o usuário está autenticado para liberar a tela[cite: 4]
  const [autenticado, setAutenticado] = useState(false);

  // Estado que armazena a mensagem de erro em caso de credenciais inválidas[cite: 4]
  const [mensagemErroLogin, setMensagemErroLogin] = useState('');

  // Estados de download e upload
  // Estado booleano que indica se o download do pacote ZIP está em processamento[cite: 4]
  const [baixando, setBaixando] = useState(false);

  // Estado booleano que indica se a restauração do banco/fotos está em andamento[cite: 4]
  const [restaurando, setRestaurando] = useState(false);

  // Estado que armazena o arquivo .zip de backup selecionado pelo usuário[cite: 4]
  const [arquivoZipSelecionado, setArquivoZipSelecionado] = useState(null);

  // Estado que gerencia o tipo ('success', 'danger', 'warning') e texto da mensagem de feedback[cite: 4]
  const [mensagemFeedback, setMensagemFeedback] = useState({ tipo: '', texto: '' });

  // Cria uma referência ao elemento HTML do input file de seleção do arquivo ZIP[cite: 4]
  const inputZipRef = useRef(null);

  // Função disparada ao submeter o formulário de login de acesso[cite: 4]
  const manipularEnvioLogin = (evento) => {
    // Impede o recarregamento padrão da página disparado pelo submit do formulário[cite: 4]
    evento.preventDefault();

    // Valida se as credenciais correspondem ao usuário e senha administrativos[cite: 4]
    if (usuario === 'etecembu' && senha === 'etec@241') {
      // Define a autenticação como verdadeira[cite: 4]
      setAutenticado(true);
      // Limpa mensagem de erro prévia de login[cite: 4]
      setMensagemErroLogin('');
    } else {
      // Exibe mensagem de erro caso as credenciais não coincidam[cite: 4]
      setMensagemErroLogin('Usuário ou senha inválidos!');
    }
  };

  // 1. Fazer Download do Backup
  // Função assíncrona responsável por solicitar e baixar o ZIP completo do servidor[cite: 4]
  const baixarBackupZip = async () => {
    try {
      // Ativa o estado de carregamento de download[cite: 4]
      setBaixando(true);
      // Limpa alertas de feedback anteriores[cite: 4]
      setMensagemFeedback({ tipo: '', texto: '' });

      // Executa chamada GET ao endpoint '/backup' configurando 'responseType' como 'blob' para tratar dados binários[cite: 4]
      const resposta = await axios.get(`${URL_API}/backup`, {
        responseType: 'blob'
      });

      // Converte a resposta binária em uma URL de objeto temporária no navegador[cite: 4]
      const urlBlob = window.URL.createObjectURL(new Blob([resposta.data]));

      // Cria dinamicamente um elemento âncora <a> para simular o download[cite: 4]
      const linkDownload = document.createElement('a');

      // Associa a URL do arquivo gerado ao link de download[cite: 4]
      linkDownload.href = urlBlob;

      // Define o atributo de download com um nome de arquivo exclusivo contendo timestamp[cite: 4]
      linkDownload.setAttribute('download', `backup-torta-na-cara-${Date.now()}.zip`);

      // Insere o elemento âncora no corpo do documento temporariamente[cite: 4]
      document.body.appendChild(linkDownload);

      // Dispara o clique programático para iniciar o download no navegador[cite: 4]
      linkDownload.click();

      // Remove a tag âncora do DOM após o disparo do download[cite: 4]
      linkDownload.remove();

      // Libera a URL de objeto da memória do navegador[cite: 4]
      window.URL.revokeObjectURL(urlBlob);

      // Exibe alerta informando a conclusão com sucesso do download[cite: 4]
      setMensagemFeedback({
        tipo: 'success',
        texto: 'Backup baixado com sucesso! Arquivo .zip gerado com o banco e todas as imagens.'
      });
    } catch (erro) {
      // Loga o erro detalhado no console do navegador[cite: 4]
      console.error('Erro ao baixar backup:', erro);

      // Exibe notificação de erro visual para o usuário[cite: 4]
      setMensagemFeedback({
        tipo: 'danger',
        texto: 'Erro ao gerar e transferir o backup. Verifique a conexão com o servidor.'
      });
    } finally {
      // Garante a desativação do indicador de download ao final da operação[cite: 4]
      setBaixando(false);
    }
  };

  // 2. Enviar arquivo ZIP e Restaurar Banco + Imagens
  // Função assíncrona responsável por enviar o arquivo ZIP e restaurar a base e fotos no servidor[cite: 4]
  const restaurarBackupZip = async (evento) => {
    // Impede o reload automático da página no envio do formulário[cite: 4]
    evento.preventDefault();

    // Valida se o usuário selecionou previamente um arquivo antes de continuar[cite: 4]
    if (!arquivoZipSelecionado) {
      // Notifica o usuário caso o arquivo não tenha sido escolhido[cite: 4]
      setMensagemFeedback({
        tipo: 'warning',
        texto: 'Selecione um arquivo .zip de backup antes de clicar em Restaurar.'
      });
      return;
    }

    // Exibe caixa de diálogo de confirmação devido ao risco de sobrescrita de dados[cite: 4]
    const confirmou = window.confirm(
      '⚠️ ATENÇÃO: Esta ação irá substituir o banco de dados atual pelas informações contidas no backup. Deseja prosseguir?'
    );

    // Aborta a operação se o usuário clicar em "Cancelar" na confirmação[cite: 4]
    if (!confirmou) return;

    try {
      // Ativa o estado de carregamento da restauração[cite: 4]
      setRestaurando(true);

      // Limpa qualquer feedback anterior[cite: 4]
      setMensagemFeedback({ tipo: '', texto: '' });

      // Instancia objeto FormData para empacotar o envio do arquivo via multipart/form-data[cite: 4]
      const dadosFormulario = new FormData();

      // Anexa o arquivo compactado sob a chave 'backupZip' esperada pelo backend[cite: 4]
      dadosFormulario.append('backupZip', arquivoZipSelecionado);

      // Envia a requisição POST ao endpoint '/restaurar' com os cabeçalhos apropriados[cite: 4]
      const resposta = await axios.post(`${URL_API}/restaurar`, dadosFormulario, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Exibe a mensagem de êxito retornada pela API ou fallback amigável[cite: 4]
      setMensagemFeedback({
        tipo: 'success',
        texto: resposta.data.message || 'Sistema restaurado com sucesso!'
      });

      // Reseta a referência do arquivo selecionado no estado[cite: 4]
      setArquivoZipSelecionado(null);

      // Limpa o valor físico do campo input de arquivo no DOM[cite: 4]
      if (inputZipRef.current) inputZipRef.current.value = '';
    } catch (erro) {
      // Registra a exceção no console[cite: 4]
      console.error('Erro ao restaurar backup:', erro);

      // Exibe mensagem de erro da resposta ou texto padrão de falha[cite: 4]
      setMensagemFeedback({
        tipo: 'danger',
        texto: erro.response?.data?.message || 'Falha ao restaurar o backup.'
      });
    } finally {
      // Garante a desativação do indicador de restauração ao final da operação[cite: 4]
      setRestaurando(false);
    }
  };

  // Renderização do layout da interface[cite: 4]
  return (
    <div className="Interface">
      {/* Cabeçalho */}
      <header>
        {/* Logotipo da esquerda */}
        <img className="imgFoto" src={imagemTorta} alt="Torta na Cara" />
        <div className="tituloHeader">
          <h1>TORTA NA CARA</h1>
          <h2>Semana Paulo Freire</h2>
        </div>
        {/* Imagem/GIF da direita */}
        <img className="imgPaulo" src={imagemPaulo} alt="Paulo Freire" />
      </header>

      {/* Login ou Painel */}
      {/* Condicional: renderiza a tela de login se o usuário não estiver autenticado[cite: 4] */}
      {!autenticado ? (
        <div className="login-wrapper">
          <div className="login-card">
            <h2>Acesso ao Backup</h2>
            {/* Formulário de autenticação[cite: 4] */}
            <Form onSubmit={manipularEnvioLogin} className="login-form">
              {/* Campo para preenchimento do nome de usuário[cite: 4] */}
              <Form.Group controlId="formUsuarioBackup" className="login-group">
                <Form.Label className="login-label">Usuário:</Form.Label>
                <Form.Control
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Informe seu usuário"
                  className="login-input"
                />
              </Form.Group>

              {/* Campo para preenchimento da senha de acesso[cite: 4] */}
              <Form.Group controlId="formSenhaBackup" className="login-group">
                <Form.Label className="login-label">Senha:</Form.Label>
                <Form.Control
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Informe sua senha"
                  className="login-input"
                />
              </Form.Group>

              {/* Botão de envio para validar credenciais[cite: 4] */}
              <Button type="submit" className="login-btn">
                Entrar
              </Button>

              {/* Alerta de erro caso as credenciais estejam erradas[cite: 4] */}
              {mensagemErroLogin && (
                <Alert variant="danger" className="login-alert">
                  {mensagemErroLogin}
                </Alert>
              )}
            </Form>
          </div>
        </div>
      ) : (
        // Seção exibida quando o usuário estiver autenticado com sucesso[cite: 4]
        <section className="admin-section">
          {/* BLOCO 1: EXPORTAR BACKUP */}
          <div
            style={{
              backgroundColor: '#fcffab',
              borderRadius: '20px',
              padding: '30px 20px',
              maxWidth: '650px',
              width: '100%',
              margin: '10px auto 25px auto',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxSizing: 'border-box'
            }}
          >
            {/* Título do card de exportação de dados[cite: 4] */}
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '12px', color: '#222' }}>
              Exportar Backup do Sistema
            </h2>
            {/* Descrição informativa do conteúdo do backup[cite: 4] */}
            <p style={{ fontSize: '1rem', color: '#444', lineHeight: 1.4, marginBottom: '20px', maxWidth: '520px' }}>
              Baixe o arquivo compactado <strong>.zip</strong> contendo o script SQL com todas as perguntas e a pasta de fotos <strong>src/img</strong>.
            </p>

            {/* Botão para solicitar e disparar o download do pacote ZIP[cite: 4] */}
            <Button
              variant="success"
              onClick={baixarBackupZip}
              disabled={baixando || restaurando} // Bloqueia clique caso haja download ou restauração em andamento[cite: 4]
              className="btn-salvar-mobile"
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                padding: '12px 30px',
                backgroundColor: 'Green',
                borderColor: 'Green',
                borderRadius: '10px'
              }}
            >
              {/* Altera o texto do botão durante o processamento[cite: 4] */}
              {baixando ? 'Gerando Pacote ZIP...' : '📦 Baixar Backup Completo (.ZIP)'}
            </Button>
          </div>

          {/* BLOCO 2: RECUPERAR / RESTAURAR BACKUP */}
          <div
            style={{
              backgroundColor: '#fcffab',
              borderRadius: '20px',
              padding: '30px 20px',
              maxWidth: '650px',
              width: '100%',
              margin: '0 auto 20px auto',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxSizing: 'border-box'
            }}
          >
            {/* Título do bloco de restauração[cite: 4] */}
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '12px', color: '#b91c1c' }}>
              Restaurar / Recuperar Dados
            </h2>
            {/* Texto de aviso sobre a restauração[cite: 4] */}
            <p style={{ fontSize: '1rem', color: '#444', lineHeight: 1.4, marginBottom: '20px', maxWidth: '520px' }}>
              Envie um arquivo <strong>.zip</strong> de backup previamente baixado para restabelecer todo o banco de questões e as imagens do jogo.
            </p>

            {/* Formulário de envio do arquivo de restauração[cite: 4] */}
            <Form onSubmit={restaurarBackupZip} style={{ width: '100%', maxWidth: '450px' }}>
              {/* Grupo com campo para anexar o arquivo ZIP[cite: 4] */}
              <Form.Group style={{ marginBottom: 20 }}>
                <Form.Control
                  type="file"
                  accept=".zip" // Limita a seleção exclusiva a arquivos com extensão .zip[cite: 4]
                  ref={inputZipRef} // Vincula a referência do DOM para limpeza manual[cite: 4]
                  onChange={(e) => setArquivoZipSelecionado(e.target.files[0] || null)} // Salva o arquivo no estado[cite: 4]
                  style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                />
              </Form.Group>

              {/* Botão de confirmação de upload e restauração do sistema[cite: 4] */}
              <Button
                type="submit"
                variant="danger"
                disabled={restaurando || baixando} // Desabilita enquanto houver ações ativas[cite: 4]
                className="btn-salvar-mobile"
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  padding: '12px 30px',
                  backgroundColor: '#c0392b',
                  borderColor: '#c0392b',
                  borderRadius: '10px',
                  width: '100%'
                }}
              >
                {/* Altera o rótulo do botão caso o processo esteja ativo[cite: 4] */}
                {restaurando ? 'Restaurando Sistema...' : '♻️ Restaurar Backup (.ZIP)'}
              </Button>
            </Form>
          </div>

          {/* Mensagens de Feedback */}
          {/* Exibe o componente Alert com mensagens de aviso, erro ou sucesso[cite: 4] */}
          {mensagemFeedback.texto && (
            <Alert
              variant={mensagemFeedback.tipo || 'info'}
              style={{ width: '100%', maxWidth: '650px', margin: '15px auto', fontSize: 15 }}
            >
              {mensagemFeedback.texto}
            </Alert>
          )}
        </section>
      )}
    </div>
  );
};

// Exporta o componente Backup como exportação padrão do módulo[cite: 4]
export default Backup;