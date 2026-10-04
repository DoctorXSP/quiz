const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testarInsercao() {
  const form = new FormData();

  // Dados do corpo (req.body)
  form.append('tema', 'Sistemas Operacionais');
  form.append('pergunta', 'O que é um Kernel?');
  form.append('A', 'Um hardware');
  form.append('B', 'O núcleo do SO');
  form.append('C', 'Um navegador');
  form.append('D', 'Um tipo de RAM');
  form.append('correta', 'B');

  // Simulando o arquivo (substitua 'sua-imagem.jpg' por um arquivo real na sua pasta)
  // O nome 'imagem' deve ser igual ao definido em upload.single('imagem')
  form.append('imagem', fs.createReadStream('./src/img/exemplo.png'));

  try {
    const response = await axios.post('http://localhost:3000/insert', form, {
      headers: {
        ...form.getHeaders(),
      },
    });
    
    console.log('Resposta do Servidor:', response.data);
  } catch (error) {
    console.error('Erro no teste:', error.response ? error.response.data : error.message);
  }
}

testarInsercao();