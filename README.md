# Gold Guinchos + FreePay Brasil

## Rodar localmente
- Node.js 18+
- `npm install`
- Copie `.env.example` para `.env.local`
- Preencha as chaves obtidas no painel FreePay Brasil
- `npm run dev`

## Variáveis na Vercel
Em Project → Settings → Environment Variables, cadastre:
- `FREEPAY_PUBLIC_KEY`
- `FREEPAY_SECRET_KEY`
- `NEXT_PUBLIC_SITE_URL` (URL pública https do site)

Nunca coloque as chaves FreePay em variáveis `NEXT_PUBLIC_` nem no código do navegador.

## Integração FreePay
O endpoint `/api/checkout` chama `POST https://api.freepaybrasil.com/v1/payment-transaction/create`, usa Basic Auth e envia o total em centavos. O código implementa um mapeamento inicial de `customer` e `items`.

**Importante:** a documentação pública consultada informa que `customer` e `items` são objetos obrigatórios, mas não exibe todos os campos internos nem um exemplo completo de resposta. Confirme o schema desses dois campos e o nome exato do campo de URL de pagamento com o suporte/painel da sua conta FreePay. Ajuste `app/api/checkout/route.js` conforme necessário. O código tenta reconhecer `checkout_url`, `payment_url` ou `url`.

## Webhook
`/api/freepay/webhook` recebe POSTs, mas por segurança ainda NÃO marca pedidos como pagos. Antes de produção:
1. Implemente a validação de assinatura/autenticidade do webhook segundo a documentação oficial da FreePay.
2. Salve pedidos e transações em banco de dados.
3. Faça a confirmação consultando a transação na API ou validando o evento autenticado.
4. Trate notificações repetidas (idempotência).
5. Só então libere os benefícios/assistência.

## Regras comerciais
Antes de vender, publique regulamento/contrato com quilometragem de guincho, quantidade de acionamentos, carência, área de cobertura, veículos aceitos, exclusões e condições de cada plano. Não prometa cobertura ilimitada se isso não estiver previsto.
