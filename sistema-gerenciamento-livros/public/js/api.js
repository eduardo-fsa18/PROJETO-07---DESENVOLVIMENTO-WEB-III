const API = {
  async requisicao(url, opcoes = {}) {
    const resposta = await fetch(url, {
      ...opcoes,
      headers: { 'Content-Type': 'application/json', ...(opcoes.headers || {}) }
    });
    const dados = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
      const mensagem = dados.detalhes ? dados.detalhes.join(' ') : (dados.erro || 'Ocorreu um erro na requisição.');
      throw new Error(mensagem);
    }
    return dados;
  },
  listar: () => API.requisicao('/api/livros'),
  consultar: id => API.requisicao(`/api/livros/${encodeURIComponent(id)}`),
  criar: livro => API.requisicao('/api/livros', { method: 'POST', body: JSON.stringify(livro) }),
  atualizar: (id, livro) => API.requisicao(`/api/livros/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(livro) }),
  excluir: id => API.requisicao(`/api/livros/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  pesquisarOpenLibrary: titulo => API.requisicao(`/api/openlibrary?titulo=${encodeURIComponent(titulo)}`)
};
