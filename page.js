"use client";

import { useState } from "react";

const plans = [
  { id: "semanal", name: "Semanal", period: "7 dias", price: "29,99", amount: 2999, features: ["Guincho", "Socorro mecânico", "Troca de pneus", "Chaveiro", "Assistência 24 horas"] },
  { id: "mensal", name: "Mensal", period: "30 dias", price: "59,99", amount: 5999, popular: true, features: ["Guincho", "Socorro mecânico", "Troca de pneus", "Chaveiro", "Assistência 24 horas"] },
  { id: "anual", name: "Anual", period: "12 meses", price: "399,99", amount: 39999, features: ["Guincho", "Socorro mecânico", "Troca de pneus", "Chaveiro", "Assistência 24 horas"] }
];

export default function Home() {
  const [plan, setPlan] = useState("mensal");
  const [pixPayment, setPixPayment] = useState(null);
  const [customer, setCustomer] = useState({ name: "", email: "", document: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkout(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan, customer })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível iniciar o pagamento.");
      if (data.pixCopyPaste || data.pixQrCode || data.pixQrCodeUrl || data.checkoutUrl) {
        setPixPayment(data);
      } else {
        throw new Error("A FreePay criou a transação, mas o retorno não trouxe um QR Code, código PIX ou link reconhecido. Confira o formato da resposta da sua conta/API.");
      }
    } catch (err) {
      setError(err.message || "Erro ao iniciar o checkout.");
      setLoading(false);
    }
  }

  return <main>
    <header className="header">
      <a className="brand" href="#"><span className="brand-mark">G</span><span>GOLD <small>GUINCHOS</small></span></a>
      <nav><a href="#beneficios">Benefícios</a><a href="#planos">Planos</a><a href="#checkout">Contratar</a></nav>
      <a className="top-cta" href="#checkout">Contratar agora ↗</a>
    </header>

    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow">ASSISTÊNCIA VEICULAR • 24 HORAS</div>
        <h1>Seu caminho.<br/><em>Nossa prioridade.</em></h1>
        <p>Mais tranquilidade para você seguir em frente. Conheça os planos Gold Guinchos para todos os tipos de veículos.</p>
        <a className="btn gold" href="#planos">Conhecer planos <span>→</span></a>
        <div className="hero-note">✦ Guincho • Socorro mecânico • Chaveiro • Muito mais</div>
      </div>
    </section>

    <section className="intro" id="beneficios">
      <div className="eyebrow dark">ASSISTÊNCIA PARA SEGUIR TRANQUILO</div>
      <h2>Conte com apoio quando<br/><em>o imprevisto aparecer.</em></h2>
      <div className="benefit-grid">
        {[
          ["↗", "Guincho", "Remoção do veículo conforme as condições contratadas."],
          ["⚙", "Socorro mecânico", "Apoio em situações de pane e imprevistos."],
          ["◉", "Troca de pneus", "Ajuda quando um pneu furado interromper o trajeto."],
          ["⌘", "Chaveiro", "Suporte em situações relacionadas à chave do veículo."]
        ].map(x => <article className="benefit" key={x[1]}><b>{x[0]}</b><h3>{x[1]}</h3><p>{x[2]}</p></article>)}
      </div>
      <p className="disclaimer">Os serviços estão sujeitos a limites, área de atendimento, disponibilidade e condições contratuais.</p>
    </section>

    <section className="plans" id="planos">
      <div className="eyebrow">ESCOLHA SEU PLANO</div>
      <h2>Proteção para cada <em>jornada.</em></h2>
      <p className="sub">Selecione um plano para continuar para o checkout.</p>
      <div className="plan-grid">
        {plans.map(p => <article className={`plan ${p.popular ? "popular" : ""}`} key={p.id}>
          {p.popular && <div className="tag">MAIS ESCOLHIDO</div>}
          <div className="plan-title">{p.name}<small>{p.period}</small></div>
          <div className="price"><small>R$</small>{p.price}<span>/{p.id === "semanal" ? "semana" : p.id === "mensal" ? "mês" : "ano"}</span></div>
          <div className="line"/>
          <ul>{p.features.map(f => <li key={f}>✓ &nbsp;{f}</li>)}</ul>
          <button className={`btn ${p.popular ? "gold" : "outline"}`} onClick={() => {setPlan(p.id); document.getElementById("checkout").scrollIntoView({behavior:"smooth"});}}>Escolher plano →</button>
        </article>)}
      </div>
    </section>

    <section className="checkout-section" id="checkout">
      <div className="checkout-copy">
        <div className="eyebrow dark">CONTRATAÇÃO ONLINE</div>
        <h2>Finalize sua<br/><em>contratação.</em></h2>
        <p>Informe seus dados e gere seu PIX com segurança pela FreePay.</p>
        <div className="secure">🔒 <span><b>Pagamento via PIX pela FreePay</b><small>O pedido só deve ser confirmado após a validação do pagamento.</small></span></div>
      </div>
      <form className="checkout" onSubmit={checkout}>
        <h3>Seus dados</h3>
        <label>Plano escolhido
          <select value={plan} onChange={e=>setPlan(e.target.value)}>
            {plans.map(p=><option value={p.id} key={p.id}>{p.name} — R$ {p.price}</option>)}
          </select>
        </label>
        <label>Nome completo<input required value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})} placeholder="Seu nome"/></label>
        <label>E-mail<input type="email" required value={customer.email} onChange={e=>setCustomer({...customer,email:e.target.value})} placeholder="voce@email.com"/></label>
        <div className="two">
          <label>CPF<input required value={customer.document} onChange={e=>setCustomer({...customer,document:e.target.value})} placeholder="000.000.000-00"/></label>
          <label>Telefone<input required value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})} placeholder="(00) 00000-0000"/></label>
        </div>
        <h3 className="payment-title">Forma de pagamento</h3>
        <div className="methods"><span className="method active">PIX</span></div>
        {error && <p className="error">{error}</p>}
        <button className="btn gold submit" disabled={loading}>{loading ? "Gerando PIX..." : `Gerar PIX de R$ ${plans.find(p=>p.id===plan).price} →`}</button>
        {pixPayment && <div className="pix-result">
          <h3>PIX gerado</h3>
          {pixPayment.pixQrCodeUrl && <img className="pix-qr" src={pixPayment.pixQrCodeUrl} alt="QR Code PIX para pagamento" />}
          {pixPayment.pixQrCode && <img className="pix-qr" src={pixPayment.pixQrCode.startsWith("data:") ? pixPayment.pixQrCode : `data:image/png;base64,${pixPayment.pixQrCode}`} alt="QR Code PIX para pagamento" />}
          {pixPayment.pixCopyPaste && <><label>PIX copia e cola<textarea readOnly value={pixPayment.pixCopyPaste}/></label><button type="button" className="btn outline" onClick={()=>navigator.clipboard.writeText(pixPayment.pixCopyPaste)}>Copiar código PIX</button></>}
          {pixPayment.checkoutUrl && <p><a href={pixPayment.checkoutUrl} target="_blank" rel="noreferrer">Abrir pagamento na FreePay</a></p>}
          <small>Após pagar, aguarde a confirmação da instituição financeira. Não feche esta página antes de copiar os dados.</small>
        </div>}
        <small className="terms">Ao continuar, você declara que leu as condições do plano. A contratação depende da confirmação do pagamento e da aceitação das regras de cobertura.</small>
      </form>
    </section>

    <footer><div className="brand"><span className="brand-mark">G</span><span>GOLD <small>GUINCHOS</small></span></div><p>Assistência veicular para você seguir em frente.</p><small>© {new Date().getFullYear()} Gold Guinchos. Todos os direitos reservados.</small></footer>
  </main>;
}
