const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'livros.json');
const STATUS_VALIDOS = ['Quero ler', 'Lendo', 'Concluído'];

async function garantirArquivo() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, '[]\n', 'utf8');
  }
}

async function listar() {
  await garantirArquivo();
  const conteudo = await fs.readFile(DATA_FILE, 'utf8');
  try {
    const livros = JSON.parse(conteudo);
    return Array.isArray(livros) ? livros : [];
  } catch {
    throw new Error('O arquivo de dados está inválido. Verifique data/livros.json.');
  }
}

async function salvarTodos(livros) {
  await garantirArquivo();
  const temporario = `${DATA_FILE}.tmp`;
  await fs.writeFile(temporario, `${JSON.stringify(livros, null, 2)}\n`, 'utf8');
  await fs.rename(temporario, DATA_FILE);
}

function validarLivro(dados, livrosExistentes, idAtual = null) {
  const erros = [];
  const titulo = typeof dados.titulo === 'string' ? dados.titulo.trim() : '';
  const autor = typeof dados.autor === 'string' ? dados.autor.trim() : '';
  const isbn = typeof dados.isbn === 'string' ? dados.isbn.trim() : '';
  const genero = typeof dados.genero === 'string' ? dados.genero.trim() : '';
  const ano = dados.ano === '' || dados.ano === null || dados.ano === undefined
    ? NaN : Number(dados.ano);
  const status = typeof dados.status === 'string' ? dados.status.trim() : '';

  if (!titulo) erros.push('O título é obrigatório.');
  if (!autor) erros.push('O autor é obrigatório.');
  if (!genero) erros.push('O gênero literário é obrigatório.');
  if (!Number.isInteger(ano) || ano < 1 || ano > new Date().getFullYear()) {
    erros.push('Informe um ano de publicação válido.');
  }
  if (!STATUS_VALIDOS.includes(status)) {
    erros.push('Selecione um status de leitura válido.');
  }
  if (isbn && !/^(?:97[89])?\d{9}[\dX]$/i.test(isbn.replace(/[-\s]/g, ''))) {
    erros.push('O ISBN informado não possui um formato válido (ISBN-10 ou ISBN-13).');
  }
  if (isbn) {
    const isbnNormalizado = isbn.replace(/[-\s]/g, '').toUpperCase();
    const duplicado = livrosExistentes.some(livro =>
      livro.id !== idAtual &&
      (livro.isbn || '').replace(/[-\s]/g, '').toUpperCase() === isbnNormalizado
    );
    if (duplicado) erros.push('Já existe um livro cadastrado com esse ISBN.');
  }

  return {
    erros,
    livro: {
      titulo, autor, isbn, ano, genero, status,
      capa: typeof dados.capa === 'string' ? dados.capa.trim() : ''
    }
  };
}

async function criar(dados) {
  const livros = await listar();
  const validacao = validarLivro(dados, livros);
  if (validacao.erros.length) return { erros: validacao.erros };
  const novoLivro = {
    id: randomUUID(),
    ...validacao.livro,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString()
  };
  livros.push(novoLivro);
  await salvarTodos(livros);
  return { livro: novoLivro };
}

async function atualizar(id, dados) {
  const livros = await listar();
  const indice = livros.findIndex(livro => livro.id === id);
  if (indice === -1) return { naoEncontrado: true };
  const validacao = validarLivro(dados, livros, id);
  if (validacao.erros.length) return { erros: validacao.erros };
  const atualizado = {
    ...livros[indice],
    ...validacao.livro,
    atualizadoEm: new Date().toISOString()
  };
  livros[indice] = atualizado;
  await salvarTodos(livros);
  return { livro: atualizado };
}

async function remover(id) {
  const livros = await listar();
  const indice = livros.findIndex(livro => livro.id === id);
  if (indice === -1) return false;
  livros.splice(indice, 1);
  await salvarTodos(livros);
  return true;
}

module.exports = { listar, criar, atualizar, remover };
