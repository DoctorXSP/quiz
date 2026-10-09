/**
 * Script de Otimização em Lote de Imagens Existentes
 * Varre a pasta 'src/img', redimensiona para 400x400 e aplica 50% de qualidade em JPG/JPEG.
 * Para executar: node otimizar-imagens.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Define a pasta onde ficam armazenadas as imagens
const pastaImagens = path.join(__dirname, 'src/img');

async function processarImagensExistentes() {
  // Verifica se o diretório existe
  if (!fs.existsSync(pastaImagens)) {
    console.error(`❌ Pasta não encontrada: ${pastaImagens}`);
    return;
  }

  // Lista todos os arquivos da pasta
  const arquivos = await fs.promises.readdir(pastaImagens);
  console.log(`📁 Encontrados ${arquivos.length} arquivos em ${pastaImagens}. Iniciando otimização...`);

  let convertidas = 0;
  let erros = 0;

  for (const arquivo of arquivos) {
    const caminhoCompleto = path.join(pastaImagens, arquivo);
    const extensao = path.extname(arquivo).toLowerCase();

    // Ignora arquivos que não sejam imagens padrão
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(extensao)) {
      continue;
    }

    try {
      // Cria buffer na memória para liberar o arquivo do disco durante o processamento
      const bufferOriginal = await fs.promises.readFile(caminhoCompleto);
      const tamanhoOriginal = bufferOriginal.length;

      // Inicia o pipeline do Sharp
      let pipeline = sharp(bufferOriginal).resize(400, 400, {
        fit: 'cover', // preenche 400x400 cortando as sobras proporcionalmente pelo centro
        position: 'center'
      });

      // Aplica compactação de 50% caso seja JPG ou JPEG
      if (extensao === '.jpg' || extensao === '.jpeg') {
        pipeline = pipeline.jpeg({ quality: 50, mozjpeg: true });
      } else if (extensao === '.webp') {
        pipeline = pipeline.webp({ quality: 65 });
      } else if (extensao === '.png') {
        pipeline = pipeline.png({ compressionLevel: 8 });
      }

      // Gera o novo buffer otimizado
      const bufferOtimizado = await pipeline.toBuffer();

      // Sobrescreve o arquivo no disco com o mesmo nome
      await fs.promises.writeFile(caminhoCompleto, bufferOtimizado);

      const reducao = (((tamanhoOriginal - bufferOtimizado.length) / tamanhoOriginal) * 100).toFixed(1);
      console.log(`✅ [${arquivo}] ${(tamanhoOriginal / 1024).toFixed(1)}KB ➔ ${(bufferOtimizado.length / 1024).toFixed(1)}KB (${reducao}% menor)`);
      convertidas++;
    } catch (erro) {
      console.error(`❌ Falha ao processar ${arquivo}:`, erro.message);
      erros++;
    }
  }

  console.log(`\n🎉 Concluído: ${convertidas} imagem(ns) otimizada(s) com sucesso. Erros: ${erros}.`);
}

// Executa a função
processarImagensExistentes();