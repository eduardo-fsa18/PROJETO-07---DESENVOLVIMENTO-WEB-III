# Sistema de Gerenciamento de Livros

Aplicação web para gerenciamento de um acervo de livros, com CRUD completo, API REST e integração com a Open Library.

## Requisitos
- Node.js 18 ou superior
- NPM

## Como executar
1. Extraia o arquivo ZIP.
2. Abra a pasta `sistema-gerenciamento-livros` no terminal.
3. Instale as dependências (o projeto utiliza apenas módulos nativos do Node.js):
   ```bash
   npm install
   ```
4. Inicie o servidor:
   ```bash
   npm start
   ```
5. Acesse http://localhost:3000.

Para desenvolvimento com reinicialização automática:
```bash
npm run dev
```

## Funcionalidades
- Cadastro, listagem, consulta por ID, edição e exclusão de livros.
- ID automático com UUID.
- Validação de campos obrigatórios, ano, status e formato do ISBN.
- Bloqueio de ISBN duplicado quando informado.
- Pesquisa por título no acervo e filtro por status.
- Confirmação antes da exclusão.
- Persistência em `data/livros.json`.
- Pesquisa de livros pela API Open Library, com preenchimento automático dos dados disponíveis.
- Cadastro manual disponível mesmo quando a pesquisa externa falhar.

## API REST

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/livros` | Lista os livros |
| GET | `/api/livros/:id` | Consulta um livro |
| POST | `/api/livros` | Cadastra um livro |
| PUT | `/api/livros/:id` | Atualiza um livro |
| DELETE | `/api/livros/:id` | Exclui um livro |
| GET | `/api/openlibrary?titulo=...` | Pesquisa na Open Library |

A listagem aceita o parâmetro opcional `titulo`, por exemplo: `/api/livros?titulo=dom`.

### Exemplo de JSON para POST/PUT
```json
{
  "titulo": "Dom Casmurro",
  "autor": "Machado de Assis",
  "isbn": "9788535910663",
  "ano": 1899,
  "genero": "Romance",
  "status": "Quero ler",
  "capa": ""
}
```

Status permitidos: `Quero ler`, `Lendo` e `Concluído`.

## Persistência
Os livros são armazenados no arquivo `data/livros.json`. Esse arquivo é criado automaticamente caso não exista. Faça backup dele se desejar preservar os dados cadastrados.

## Observações
- A integração com a Open Library é feita pelo backend para evitar depender de chamadas diretas do navegador ao serviço externo.
- A disponibilidade da Open Library depende da conexão com a internet. Se estiver indisponível, é possível cadastrar os livros manualmente.
- O projeto não utiliza frameworks ou dependências externas de NPM; o servidor é implementado com o módulo `http` nativo do Node.js.
