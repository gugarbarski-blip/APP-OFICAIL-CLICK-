'use strict';

function getDb() {
  const { createClient } = require('@supabase/supabase-js');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Supabase env vars missing');
  return createClient(url, key);
}

async function sendOwnerNotification(opts) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const { Resend } = require('resend');
  const resend = new Resend(apiKey);
  const total = `R$ ${opts.valorTotal.toFixed(2).replace('.', ',')}`;
  const personalizacao = opts.tipoPersonalizacao === 'laser'
    ? 'Gravação a Laser'
    : `Serigrafia 1 Cor${opts.corSerigrafia ? ` — ${opts.corSerigrafia}` : ''}`;

  await resend.emails.send({
    from: 'ImpreBrindes <pedidos@imprebrindes.com.br>',
    to: ['gugarbarski@gmail.com', 'gustavo@impresul.com.br'],
    subject: `Novo pedido aprovado! ${opts.nome} — ${total}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: #1a1a1a; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #D4AF37; margin: 0; font-size: 22px;">Novo Pedido Recebido!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 32px; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #888;">Cliente</td><td style="padding: 6px 0; font-weight: 600;">${opts.nome}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">E-mail</td><td style="padding: 6px 0;">${opts.email}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Produto</td><td style="padding: 6px 0; font-weight: 600;">${opts.produto}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Personalização</td><td style="padding: 6px 0;">${personalizacao}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Quantidade</td><td style="padding: 6px 0;">${opts.quantidade} unidades</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Endereço</td><td style="padding: 6px 0;">${opts.endereco}</td></tr>
            <tr style="border-top: 2px solid #D4AF37;"><td style="padding: 10px 0 0; font-weight: 700; font-size: 16px;">Total</td><td style="padding: 10px 0 0; font-weight: 700; font-size: 18px; color: #D4AF37;">${total}</td></tr>
          </table>
          <p style="font-size: 12px; color: #aaa; margin-top: 24px;">Pedido #${opts.mpPaymentId}</p>
        </div>
      </div>
    `,
  });
}

async function sendConfirmationEmail(opts) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const { Resend } = require('resend');
  const resend = new Resend(apiKey);
  const total = `R$ ${opts.valorTotal.toFixed(2).replace('.', ',')}`;
  const personalizacao = opts.tipoPersonalizacao === 'laser'
    ? 'Gravação a Laser'
    : `Serigrafia 1 Cor${opts.corSerigrafia ? ` — ${opts.corSerigrafia}` : ''}`;

  await resend.emails.send({
    from: 'ImpreBrindes <pedidos@imprebrindes.com.br>',
    to: opts.to,
    subject: 'Pedido confirmado! Seu copo personalizado está sendo preparado',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: #1a1a1a; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #D4AF37; margin: 0; font-size: 24px;">ImpreBrindes</h1>
          <p style="color: #aaa; margin: 8px 0 0; font-size: 14px;">Copos Térmicos Personalizados</p>
        </div>
        <div style="background: #f9f9f9; padding: 32px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1a1a1a; margin: 0 0 8px;">Pagamento aprovado!</h2>
          <p style="color: #555; margin: 0 0 24px;">Olá, <strong>${opts.nome}</strong>! Recebemos seu pagamento e seu pedido já está em produção.</p>
          <div style="background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 16px; font-size: 15px; color: #1a1a1a; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px;">Detalhes do Pedido</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 6px 0; color: #888;">Produto</td><td style="padding: 6px 0; text-align: right; font-weight: 600;">${opts.produto}</td></tr>
              <tr><td style="padding: 6px 0; color: #888;">Personalização</td><td style="padding: 6px 0; text-align: right; font-weight: 600;">${personalizacao}</td></tr>
              <tr><td style="padding: 6px 0; color: #888;">Quantidade</td><td style="padding: 6px 0; text-align: right; font-weight: 600;">${opts.quantidade} unidades</td></tr>
              <tr style="border-top: 1px solid #f0f0f0;"><td style="padding: 10px 0 0; color: #1a1a1a; font-weight: 700; font-size: 15px;">Total pago</td><td style="padding: 10px 0 0; text-align: right; color: #D4AF37; font-weight: 700; font-size: 18px;">${total}</td></tr>
            </table>
          </div>
          <div style="background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 10px; font-size: 15px; color: #1a1a1a;">Endereço de Entrega</h3>
            <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">${opts.endereco}</p>
          </div>
          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; color: #92400e;">
              <strong>Próximos passos:</strong> Entraremos em contato para confirmar os detalhes da personalização e informar o prazo de entrega.
            </p>
          </div>
          <p style="font-size: 12px; color: #aaa; text-align: center; margin: 0;">Pedido #${opts.mpPaymentId} · ImpreBrindes</p>
        </div>
      </div>
    `,
  });
}

async function sendEmails(p, valorTotal, mpPaymentId) {
  const emailOpts = {
    nome: p.nome, email: p.email, produto: p.produto,
    quantidade: p.quantidade, valorTotal, endereco: p.endereco,
    tipoPersonalizacao: p.tipo_personalizacao, corSerigrafia: p.cor_serigrafia,
    mpPaymentId,
  };
  const results = await Promise.allSettled([
    sendOwnerNotification(emailOpts),
    sendConfirmationEmail({ to: p.email, ...emailOpts }),
  ]);
  results.forEach(function(r, i) {
    if (r.status === 'rejected') {
      console.error(`Email ${i === 0 ? 'owner' : 'customer'} falhou:`, r.reason?.message);
    }
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  console.log('Webhook MP recebido:', JSON.stringify({
    type: req.body?.type, action: req.body?.action, dataId: req.body?.data?.id,
  }));

  const { type, action, data } = req.body || {};

  const isPaymentEvent =
    type === 'payment' ||
    action === 'payment.created' ||
    action === 'payment.updated';

  if (!isPaymentEvent) return res.status(200).end();

  try {
    const { MercadoPagoConfig, Payment } = require('mercadopago');
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const payment = new Payment(client);

    let mp;
    try {
      mp = await payment.get({ id: data.id });
    } catch (fetchErr) {
      console.warn('Webhook: pagamento não encontrado, ignorando', { id: data.id, err: fetchErr?.message });
      return res.status(200).end();
    }

    if (mp.status !== 'approved') {
      console.log(`Webhook: status=${mp.status}, ignorando`);
      return res.status(200).end();
    }

    const db = getDb();
    const mpPaymentId = String(mp.id);
    const valorTotal = mp.transaction_amount ?? 0;

    const { data: existing } = await db
      .from('pedidos')
      .select('id, status, nome, email, produto, quantidade, endereco, tipo_personalizacao, cor_serigrafia')
      .eq('mp_payment_id', mpPaymentId)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'pago') {
        console.log(`Webhook: pagamento ${mpPaymentId} já processado, ignorando`);
        return res.status(200).json({ ok: true, skipped: 'already_paid' });
      }
      await db.from('pedidos').update({ status: 'pago' }).eq('mp_payment_id', mpPaymentId);
      console.log(`Webhook: pedido ${existing.id} → pago`);
      await sendEmails(existing, valorTotal, mpPaymentId);
      return res.status(200).json({ ok: true });
    }

    const meta = mp.metadata || {};
    const g = function(snake, camel) { return meta[snake] || meta[camel] || ''; };
    const pedidoId = g('pedido_id', 'pedidoId');

    if (pedidoId) {
      const { data: byId } = await db
        .from('pedidos')
        .select('id, status, nome, email, produto, quantidade, endereco, tipo_personalizacao, cor_serigrafia')
        .eq('id', pedidoId)
        .maybeSingle();

      if (byId) {
        if (byId.status === 'pago') {
          return res.status(200).json({ ok: true, skipped: 'already_paid' });
        }
        await db.from('pedidos').update({ status: 'pago', mp_payment_id: mpPaymentId }).eq('id', pedidoId);
        console.log(`Webhook: pedido ${pedidoId} → pago (via metadata)`);
        await sendEmails(byId, valorTotal, mpPaymentId);
        return res.status(200).json({ ok: true });
      }
    }

    const emailTo = g('buyer_email', 'buyerEmail') || mp.payer?.email || '';
    const nome = g('buyer_name', 'buyerName') || (mp.payer?.first_name ? `${mp.payer.first_name} ${mp.payer.last_name || ''}`.trim() : '');
    const productName = g('product_name', 'productName');

    await db.from('pedidos').insert({
      mp_payment_id: mpPaymentId,
      status: 'pago',
      nome,
      email: emailTo,
      telefone: g('buyer_phone', 'buyerPhone'),
      cpf_cnpj: g('buyer_cpf_cnpj', 'buyerCpfCnpj'),
      produto: productName,
      quantidade: Number(meta.quantity) || 0,
      valor_total: valorTotal,
      endereco: g('address', 'address'),
      tipo_personalizacao: g('customization_type', 'customizationType'),
      cor_serigrafia: g('serigrafia_color', 'serigrafiaColor'),
      arte_url: meta.art_url || meta.artUrl || null,
      created_at: new Date().toISOString(),
    });
    console.log(`Webhook: pedido criado via metadata para pagamento ${mpPaymentId}`);
    await sendEmails(
      { nome, email: emailTo, produto: productName, quantidade: Number(meta.quantity) || 0,
        endereco: g('address', 'address'), tipo_personalizacao: g('customization_type', 'customizationType'),
        cor_serigrafia: g('serigrafia_color', 'serigrafiaColor') },
      valorTotal, mpPaymentId,
    );

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Webhook erro interno:', err?.message || err);
    return res.status(200).json({ ok: false, error: 'internal_error' });
  }
};
