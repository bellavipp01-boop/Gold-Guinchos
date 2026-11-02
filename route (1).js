import { NextResponse } from "next/server";

const plans = {
  semanal: { name: "Plano Semanal Gold Guinchos", amount: 2999 },
  mensal: { name: "Plano Mensal Gold Guinchos", amount: 5999 },
  anual: { name: "Plano Anual Gold Guinchos", amount: 39999 }
};

export async function POST(request) {
  try {
    const { planId, customer } = await request.json();
    const plan = plans[planId];

    if (!plan) return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
    if (!customer?.name || !customer?.email || !customer?.document || !customer?.phone) {
      return NextResponse.json({ error: "Preencha todos os dados do comprador." }, { status: 400 });
    }

    const publicKey = process.env.FREEPAY_PUBLIC_KEY;
    const secretKey = process.env.FREEPAY_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!publicKey || !secretKey || !siteUrl) {
      return NextResponse.json({ error: "Configure FREEPAY_PUBLIC_KEY, FREEPAY_SECRET_KEY e NEXT_PUBLIC_SITE_URL na Vercel." }, { status: 500 });
    }

    const auth = Buffer.from(`${publicKey}:${secretKey}`).toString("base64");

    // Confirme os campos internos de customer e items com o schema completo
    // disponibilizado no painel/documentação da sua conta FreePay Brasil.
    const payload = {
      amount: plan.amount,
      payment_method: "pix",
      postback_url: `${siteUrl}/api/freepay/webhook`,
      customer: {
        name: customer.name,
        email: customer.email,
        document: customer.document.replace(/\D/g, ""),
        phone: customer.phone.replace(/\D/g, "")
      },
      items: [{
        name: plan.name,
        quantity: 1,
        amount: plan.amount
      }],
      installments: 1,
      metadata: {
        provider_name: "Gold Guinchos",
        plan_id: planId
      }
    };

    const freepayResponse = await fetch("https://api.freepaybrasil.com/v1/payment-transaction/create", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload),
      cache: "no-store"
    });

    const result = await freepayResponse.json().catch(() => ({}));

    if (!freepayResponse.ok) {
      console.error("FreePay create transaction error:", freepayResponse.status, result);
      return NextResponse.json({
        error: result?.message || result?.error || "A FreePay recusou a criação da transação. Confira os campos obrigatórios do cadastro/API."
      }, { status: 502 });
    }

    // O nome exato do campo de URL pode variar conforme a resposta habilitada
    // na conta. Ajuste aqui para o campo documentado/retornado pela FreePay.
    const data = result.data || result;
    // Os nomes exatos dos campos PIX dependem do retorno habilitado na conta FreePay.
    // Este mapeamento contempla nomes comuns; confirme o schema com a documentação da sua conta.
    const pixCopyPaste = data.pix_copy_paste || data.copy_paste || data.br_code || data.qr_code_text || data.pix?.copy_paste || data.pix?.br_code || null;
    const pixQrCode = data.pix_qr_code_base64 || data.qr_code_base64 || data.qrcode_base64 || data.pix?.qr_code_base64 || null;
    const pixQrCodeUrl = data.pix_qr_code_url || data.qr_code_url || data.qrcode_url || data.pix?.qr_code_url || null;
    const checkoutUrl = data.checkout_url || data.payment_url || data.url || null;

    if (!pixCopyPaste && !pixQrCode && !pixQrCodeUrl && !checkoutUrl) {
      console.error("FreePay PIX response fields not recognized:", result);
      return NextResponse.json({
        error: "Transação criada, mas não identifiquei os dados PIX no retorno. Confirme os nomes dos campos na resposta da sua conta FreePay."
      }, { status: 502 });
    }

    return NextResponse.json({ pixCopyPaste, pixQrCode, pixQrCodeUrl, checkoutUrl });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Erro interno ao iniciar o checkout." }, { status: 500 });
  }
}
