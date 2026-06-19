# Demonstração Devily

Protótipo funcional de um sistema de delivery responsivo, inspirado no fluxo de cardápios digitais.

## Funcionalidades

- seleção entre delivery, retirada e atendimento na mesa;
- categorias, busca e destaques;
- detalhes do produto, quantidade e observações;
- sacola com cálculo de subtotal e taxa;
- checkout com endereço e forma de pagamento;
- layout responsivo para celular e desktop.

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

O protótipo usa dados locais. Backend, autenticação, banco de dados, pagamento e WhatsApp serão integrados em etapas posteriores.
