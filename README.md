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
npm run dev
```

## Alterar o nome

Edite `src/config.js`. Nome, nome curto, slogan e endereço estão centralizados nesse arquivo.

## Produção

```bash
npm run build
```

Os dados da demonstração são persistidos no navegador com `localStorage`. Pagamentos e mensagens de WhatsApp não geram transações reais.
