const model = require('../models/livroModel');
const { sendJson, readJsonBody } = require('../utils/http');

async function listar(req, res, url) {
  const livros = await model.listar();
  const busca = (url.searchParams.get('titulo') || '').trim().toLocaleLowerCase('pt-BR');
  const filtrados = busca
    ? livros.filter(livro => livro.titulo.toLocaleLowerCase('pt-BR').includes(busca))
    : livros;
  sendJson(res, 200, filtrados);
}

async function consultar(req, res, id) {
  const livro = (await model.listar()).find(item => item.id === id);
  if (!livro) return sendJson(res, 404, { erro: 'Livro não encontrado.' });
  sendJson(res, 200, livro);
}

async function cadastrar(req, res) {
  const dados = await readJsonBody(req);
  const resultado = await model.criar(dados);
  if (resultado.erros) return sendJson(res, 400, { erro: 'Não foi possível cadastrar o livro.', detalhes: resultado.erros });
  sendJson(res, 201, resultado.livro);
}

async function editar(req, res, id) {
  const dados = await readJsonBody(req);
  const resultado = await model.atualizar(id, dados);
  if (resultado.naoEncontrado) return sendJson(res, 404, { erro: 'Livro não encontrado.' });
  if (resultado.erros) return sendJson(res, 400, { erro: 'Não foi possível atualizar o livro.', detalhes: resultado.erros });
  sendJson(res, 200, resultado.livro);
}

async function excluir(req, res, id) {
  const removido = await model.remover(id);
  if (!removido) return sendJson(res, 404, { erro: 'Livro não encontrado.' });
  sendJson(res, 200, { mensagem: 'Livro excluído com sucesso.' });
}

module.exports = { listar, consultar, cadastrar, editar, excluir };
