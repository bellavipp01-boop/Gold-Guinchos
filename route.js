import { NextResponse } from "next/server";

/*
  Endpoint de notificação da FreePay Brasil.
  Antes de liberar qualquer benefício, implemente a validação de autenticidade
  do webhook conforme o formato/assinatura oficial fornecido pela FreePay.
  Também persista o ID/status da transação em um banco de dados e trate eventos
  repetidos de forma idempotente. Não confie em uma página de retorno do navegador
  para declarar uma cobrança como paga.
*/
export async function POST(request) {
  const rawBody = await request.text();

  // Durante a integração/testes, registra o recebimento sem marcar como pago.
  console.log("FreePay webhook recebido:", rawBody);

  return NextResponse.json({ received: true });
}
