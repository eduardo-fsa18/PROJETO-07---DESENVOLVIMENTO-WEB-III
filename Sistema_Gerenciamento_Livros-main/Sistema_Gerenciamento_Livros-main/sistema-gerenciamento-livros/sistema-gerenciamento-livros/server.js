const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');
const { handleLivrosRoutes } = require('./src/routes/livrosRoutes');
const { buscarNaOpenLibrary } = require('./src/services/openLibraryService');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(data));
}

function serveStatic(req, res, pathname) {
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.resolve(PUBLIC_DIR, `.${requestedPath}`);

  if (!filePath.startsWith(PUBLIC_DIR + path.sep) && filePath !== path.join(PUBLIC_DIR, 'index.html')) {
    sendJson(res, 403, { erro: 'Acesso negado.' });
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(res, 404, { erro: 'Página ou arquivo não encontrado.' });
      return;
    }
    const contentType = mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(url.pathname);

  try {
    if (pathname.startsWith('/api/livros')) {
      await handleLivrosRoutes(req, res, url);
      return;
    }

    if (pathname === '/api/openlibrary' && req.method === 'GET') {
      const titulo = (url.searchParams.get('titulo') || '').trim();
      if (!titulo) {
        sendJson(res, 400, { erro: 'Informe o título do livro para pesquisar.' });
        return;
      }
      try {
        const resultados = await buscarNaOpenLibrary(titulo);
        sendJson(res, 200, { resultados });
      } catch {
        sendJson(res, 502, {
          erro: 'Não foi possível consultar a Open Library no momento.',
          resultados: []
        });
      }
      return;
    }

    if (pathname.startsWith('/api/')) {
      sendJson(res, 404, { erro: 'Rota da API não encontrada.' });
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      sendJson(res, 405, { erro: 'Método não permitido.' });
      return;
    }
    serveStatic(req, res, pathname);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) sendJson(res, 500, { erro: 'Erro interno do servidor.' });
    else res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});
