# Sistema de Gerenciamento de Livros

Aplicação web para gerenciar um acervo de livros. O projeto conta com CRUD completo, API REST e integração com a Open Library. Tudo isso sem usar frameworks ou dependências externas — apenas módulos nativos do Node.js.

## 🚀 Como Executar

1. Extraia o arquivo ZIP do projeto.
2. Abra a pasta `sistema-gerenciamento-livros` no terminal.
3. Instale as dependências:
   ```bash
   npm install
Inicie o servidor:Bashnpm start
Acesse no navegador: http://localhost:3000Para desenvolvimento com reinicialização automática:Bashnpm run dev
✨ O que o sistema faz?Gerenciamento completo: Cadastra, edita, exclui e lista livros.Busca e Filtros: Pesquisa livros por título no acervo e filtra por status.Integração Open Library: Busca livros automaticamente na API da Open Library ao cadastrar. Se estiver sem internet ou o serviço falhar, o cadastro manual continua funcionando perfeitamente.Validações: Verifica campos obrigatórios, ano, formato do ISBN e evita duplicidade.Salvamento local: Os dados ficam salvos em data/livros.json (criado automaticamente). Basta fazer backup desse arquivo se quiser guardar seus livros.🔌 API RESTMétodoEndpointDescriçãoGET/api/livrosLista todos os livros (aceita filtro por título: /api/livros?titulo=dom)GET/api/livros/:idBusca um livro específico pelo IDPOST/api/livrosCadastra um novo livroPUT/api/livros/:idAtualiza um livro existenteDELETE/api/livros/:idExclui um livroGET/api/openlibrary?titulo=...Pesquisa livros diretamente na Open Library📝 Exemplo de JSON (para POST ou PUT)JSON{
  "titulo": "Dom Casmurro",
  "autor": "Machado de Assis",
  "isbn": "9788535910663",
  "ano": 1899,
  "genero": "Romance",
  "status": "Quero ler",
  "capa": ""
}
Status permitidos: Quero ler, Lendo e Concluído.📋 RequisitosNode.js (versão 18 ou superior)NPM
