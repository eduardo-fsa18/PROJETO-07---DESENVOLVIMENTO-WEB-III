const controller = require('../controllers/livroController');
const { sendJson } = require('../utils/http');

async function handleLivrosRoutes(req, res, url) {
  const pathname = url.pathname;
  const partes = pathname.split('/').filter(Boolean);

  if (pathname === '/api/livros') {
    if (req.method === 'GET') return controller.listar(req, res, url);
    if (req.method === 'POST') return controller.cadastrar(req, res);
    res.setHeader('Allow', 'GET, POST');
    return sendJson(res, 405, { erro: 'Método não permitido para esta rota.' });
  }

  if (partes.length === 3 && partes[0] === 'api' && partes[1] === 'livros') {
    const id = partes[2];
    if (req.method === 'GET') return controller.consultar(req, res, id);
    if (req.method === 'PUT') return controller.editar(req, res, id);
    if (req.method === 'DELETE') return controller.excluir(req, res, id);
    res.setHeader('Allow', 'GET, PUT, DELETE');
    return sendJson(res, 405, { erro: 'Método não permitido para esta rota.' });
  }

  sendJson(res, 404, { erro: 'Rota da API não encontrada.' });
}

module.exports = { handleLivrosRoutes };
