const elementos = {
  lista: document.querySelector('#listaLivros'),
  mensagem: document.querySelector('#mensagem'),
  dialog: document.querySelector('#dialogLivro'),
  form: document.querySelector('#formLivro'),
  resultados: document.querySelector('#resultadosExternos')
};

let livros = [];
let filtroAtual = 'Todos';
let temporizadorMensagem;

function mostrarMensagem(texto, tipo = 'success') {
  clearTimeout(temporizadorMensagem);
  elementos.mensagem.textContent = texto;
  elementos.mensagem.className = `message ${tipo}`;
  temporizadorMensagem = setTimeout(() => {
    elementos.mensagem.textContent = '';
    elementos.mensagem.className = 'message';
  }, 5000);
}

function atualizarResumo() {
  document.querySelector('#totalLivros').textContent = livros.length;
  document.querySelector('#totalQueroLer').textContent = livros.filter(l => l.status === 'Quero ler').length;
  document.querySelector('#totalLendo').textContent = livros.filter(l => l.status === 'Lendo').length;
  document.querySelector('#totalConcluidos').textContent = livros.filter(l => l.status === 'Concluído').length;
}

function criarCard(livro) {
  const article = document.createElement('article');
  article.className = 'book-card';

  if (livro.capa) {
    const img = document.createElement('img');
    img.className = 'book-cover';
    img.src = livro.capa;
    img.alt = `Capa do livro ${livro.titulo}`;
    img.loading = 'lazy';
    img.onerror = () => {
      const placeholder = document.createElement('div');
      placeholder.className = 'cover-placeholder';
      placeholder.textContent = 'B';
      img.replaceWith(placeholder);
    };
    article.append(img);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'cover-placeholder';
    placeholder.textContent = 'B';
    article.append(placeholder);
  }

  const info = document.createElement('div');
  info.className = 'book-info';
  const titulo = document.createElement('h3');
  titulo.textContent = livro.titulo;
  const autor = document.createElement('p');
  autor.className = 'book-author';
  autor.textContent = livro.autor;
  const meta = document.createElement('div');
  meta.className = 'book-meta';
  meta.textContent = `${livro.ano} · ${livro.genero}${livro.isbn ? ` · ISBN ${livro.isbn}` : ''}`;
  const status = document.createElement('span');
  status.className = `status ${classeStatus(livro.status)}`;
  status.textContent = livro.status;
  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const editar = document.createElement('button');
  editar.type = 'button';
  editar.className = 'text-button';
  editar.textContent = 'Editar';
  editar.addEventListener('click', () => abrirEdicao(livro.id));

  const excluir = document.createElement('button');
  excluir.type = 'button';
  excluir.className = 'text-button delete';
  excluir.textContent = 'Excluir';
  excluir.addEventListener('click', () => excluirLivro(livro.id, livro.titulo));

  actions.append(editar, excluir);
  info.append(titulo, autor, meta, status, actions);
  article.append(info);
  return article;
}

function classeStatus(status) {
  if (status === 'Lendo') return 'status-lendo';
  if (status === 'Concluído') return 'status-concluido';
  return 'status-quero-ler';
}

function renderizarLivros() {
  const busca = document.querySelector('#buscaLocal').value.trim().toLocaleLowerCase('pt-BR');
  const filtrados = livros.filter(livro => {
    const correspondeStatus = filtroAtual === 'Todos' || livro.status === filtroAtual;
    const correspondeBusca = livro.titulo.toLocaleLowerCase('pt-BR').includes(busca);
    return correspondeStatus && correspondeBusca;
  });

  elementos.lista.replaceChildren();
  if (!filtrados.length) {
    const vazio = document.createElement('div');
    vazio.className = 'empty-state';
    const titulo = document.createElement('strong');
    titulo.textContent = livros.length ? 'Nenhum livro encontrado' : 'Sua estante está esperando por histórias';
    const texto = document.createElement('span');
    texto.textContent = livros.length ? 'Tente mudar os filtros ou a pesquisa.' : 'Adicione seu primeiro livro para começar a organizar seu acervo.';
    vazio.append(titulo, texto);
    elementos.lista.append(vazio);
    return;
  }
  filtrados.forEach(livro => elementos.lista.append(criarCard(livro)));
}

async function carregarLivros() {
  try {
    livros = await API.listar();
    atualizarResumo();
    renderizarLivros();
  } catch (error) {
    mostrarMensagem(error.message, 'error');
  }
}

function abrirCadastro(livroExterno = null) {
  elementos.form.reset();
  document.querySelector('#livroId').value = '';
  document.querySelector('#capa').value = '';
  document.querySelector('#tituloDialog').textContent = 'Adicionar livro';
  if (livroExterno) preencherFormulario(livroExterno);
  elementos.dialog.showModal();
  document.querySelector('#titulo').focus();
}

function preencherFormulario(livro) {
  document.querySelector('#titulo').value = livro.titulo || '';
  document.querySelector('#autor').value = livro.autor || '';
  document.querySelector('#isbn').value = livro.isbn || '';
  document.querySelector('#ano').value = livro.ano || '';
  document.querySelector('#genero').value = livro.genero || '';
  document.querySelector('#status').value = livro.status || 'Quero ler';
  document.querySelector('#capa').value = livro.capa || '';
}

async function abrirEdicao(id) {
  try {
    const livro = await API.consultar(id);
    elementos.form.reset();
    document.querySelector('#livroId').value = livro.id;
    document.querySelector('#tituloDialog').textContent = 'Editar livro';
    preencherFormulario(livro);
    elementos.dialog.showModal();
  } catch (error) {
    mostrarMensagem(error.message, 'error');
  }
}

async function excluirLivro(id, titulo) {
  if (!confirm(`Tem certeza de que deseja excluir "${titulo}"? Esta ação não poderá ser desfeita.`)) return;
  try {
    await API.excluir(id);
    mostrarMensagem('Livro excluído com sucesso.');
    await carregarLivros();
  } catch (error) {
    mostrarMensagem(error.message, 'error');
  }
}

elementos.form.addEventListener('submit', async event => {
  event.preventDefault();
  const dados = {
    titulo: document.querySelector('#titulo').value,
    autor: document.querySelector('#autor').value,
    isbn: document.querySelector('#isbn').value,
    ano: document.querySelector('#ano').value,
    genero: document.querySelector('#genero').value,
    status: document.querySelector('#status').value,
    capa: document.querySelector('#capa').value
  };
  const id = document.querySelector('#livroId').value;
  const botao = document.querySelector('#salvarBtn');
  botao.disabled = true;
  botao.textContent = 'Salvando...';
  try {
    if (id) {
      await API.atualizar(id, dados);
      mostrarMensagem('Livro atualizado com sucesso.');
    } else {
      await API.criar(dados);
      mostrarMensagem('Livro cadastrado com sucesso.');
    }
    elementos.dialog.close();
    await carregarLivros();
  } catch (error) {
    mostrarMensagem(error.message, 'error');
  } finally {
    botao.disabled = false;
    botao.textContent = 'Salvar livro';
  }
});

document.querySelector('#formBuscaExterna').addEventListener('submit', async event => {
  event.preventDefault();
  const titulo = document.querySelector('#buscaExterna').value.trim();
  elementos.resultados.replaceChildren();
  const carregando = document.createElement('p');
  carregando.className = 'book-meta';
  carregando.textContent = 'Pesquisando na Open Library...';
  elementos.resultados.append(carregando);
  try {
    const dados = await API.pesquisarOpenLibrary(titulo);
    elementos.resultados.replaceChildren();
    if (!dados.resultados.length) {
      const aviso = document.createElement('p');
      aviso.className = 'book-meta';
      aviso.textContent = 'Nenhum resultado encontrado. Você pode cadastrar o livro manualmente.';
      elementos.resultados.append(aviso);
      return;
    }
    dados.resultados.forEach(livro => {
      const card = document.createElement('article');
      card.className = 'external-card';
      if (livro.capa) {
        const img = document.createElement('img');
        img.src = livro.capa;
        img.alt = '';
        img.onerror = () => img.remove();
        card.append(img);
      }
      const info = document.createElement('div');
      const nome = document.createElement('strong');
      nome.textContent = livro.titulo || 'Título não disponível';
      const detalhe = document.createElement('small');
      detalhe.textContent = [livro.autor, livro.ano].filter(Boolean).join(' · ') || 'Informações incompletas';
      info.append(nome, detalhe);
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'button button-primary';
      botao.textContent = 'Usar dados';
      botao.addEventListener('click', () => {
        const anoValido = Number(livro.ano) > 0 && Number(livro.ano) <= new Date().getFullYear();
        abrirCadastro({
          ...livro,
          ano: anoValido ? livro.ano : '',
          genero: '',
          status: 'Quero ler'
        });
      });
      card.append(info, botao);
      elementos.resultados.append(card);
    });
  } catch (error) {
    elementos.resultados.replaceChildren();
    const aviso = document.createElement('p');
    aviso.className = 'book-meta';
    aviso.textContent = `${error.message} O cadastro manual continua disponível.`;
    elementos.resultados.append(aviso);
  }
});

document.querySelector('#novoLivroBtn').addEventListener('click', () => abrirCadastro());
document.querySelector('#fecharDialog').addEventListener('click', () => elementos.dialog.close());
document.querySelector('#cancelarDialog').addEventListener('click', () => elementos.dialog.close());
document.querySelector('#buscaLocal').addEventListener('input', renderizarLivros);
document.querySelectorAll('[data-filtro]').forEach(botao => {
  botao.addEventListener('click', () => {
    filtroAtual = botao.dataset.filtro;
    document.querySelectorAll('[data-filtro]').forEach(item => item.classList.toggle('active', item === botao));
    renderizarLivros();
  });
});

carregarLivros();
