# Demonstração Devily

Protótipo funcional de um sistema de delivery responsivo, inspirado no fluxo de cardápios digitais.

## Funcionalidades do cliente

- seleção entre delivery, retirada e atendimento na mesa;
- categorias, busca e destaques;
- detalhes do produto, quantidade e observações;
- sacola com cálculo de subtotal e taxa;
- checkout com endereço e forma de pagamento;
- cupom de desconto e pedido mínimo;
- acompanhamento do status pelo código do pedido;
- cadastro e login seguro de clientes;
- perfil com múltiplos endereços salvos;
- layout responsivo para celular e desktop.

## Painel administrativo

Acesse `#admin` na URL ou use o botão **Área administrativa**. PIN da demonstração: `1234`.

- visão geral com faturamento, ticket médio e pedidos ativos;
- gestão e avanço dos pedidos por status;
- cadastro, edição, pausa e exclusão de produtos;
- gestão de categorias e estoque;
- cupons de desconto;
- personalização de nome, slogan, cor, endereço e prazos;
- abertura e fechamento do cardápio.

## Executar localmente

```bash
npm install
cp .env.example .env
npm run dev:all
```

No Windows, copie manualmente `.env.example` para `.env` e preencha os dados do MySQL.

## Banco MySQL

1. Execute `database/schema.sql` no seu servidor MySQL.
2. Copie `.env.example` para `.env`.
3. Configure `DB_HOST`, `DB_USER`, `DB_PASSWORD` e `DB_NAME`.
4. Crie uma `JWT_SECRET` longa e exclusiva.

A API roda por padrão em `http://localhost:3001`. O Vite encaminha `/api` automaticamente durante o desenvolvimento.

### API de clientes

- `POST /api/auth/register` — cria uma conta;
- `POST /api/auth/login` — autentica o cliente;
- `GET /api/auth/me` — consulta o perfil;
- `PUT /api/users/me` — atualiza nome e telefone;
- `GET/POST /api/users/me/addresses` — consulta ou adiciona endereços;
- `DELETE /api/users/me/addresses/:id` — remove um endereço.

## Alterar o nome

Edite `src/config.js`. Nome, nome curto, slogan e endereço estão centralizados nesse arquivo.

## Produção

```bash
npm run build
```

Produtos e pedidos demonstrativos ainda usam `localStorage`. Contas e endereços utilizam MySQL. Pagamentos e mensagens de WhatsApp não geram transações reais.
