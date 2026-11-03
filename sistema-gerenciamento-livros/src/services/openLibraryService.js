async function buscarNaOpenLibrary(titulo) {
  const endpoint = new URL('https://openlibrary.org/search.json');
  endpoint.searchParams.set('title', titulo);
  endpoint.searchParams.set('limit', '10');
  endpoint.searchParams.set('fields', 'key,title,author_name,first_publish_year,isbn,cover_i');

  const resposta = await fetch(endpoint, {
    headers: { 'User-Agent': 'SistemaGerenciamentoLivros/1.0 (atividade academica)' },
    signal: AbortSignal.timeout(8000)
  });

  if (!resposta.ok) throw new Error(`Open Library respondeu com HTTP ${resposta.status}.`);
  const dados = await resposta.json();

  return (dados.docs || []).map(item => ({
    titulo: item.title || '',
    autor: Array.isArray(item.author_name) ? item.author_name[0] : '',
    ano: item.first_publish_year || '',
    isbn: Array.isArray(item.isbn) ? item.isbn[0] : '',
    capa: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : ''
  }));
}

module.exports = { buscarNaOpenLibrary };
