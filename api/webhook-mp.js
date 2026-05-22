'use strict';

const crypto = require('crypto');

function verifySignature(req, secret) {
  const sig = req.headers['x-signature'];
  const reqId = req.headers['x-request-id'];

  if (!sig) return false;

  // Extrai ts e v1 do header "ts=...,v1=..."
  let ts = '';
  let v1 = '';
  sig.split(',').forEach(function(part) {
    const eqIdx = part.indexOf('=');
    if (eqIdx === -1) return;
    const key = part.slice(0, eqIdx).trim();
    const val = part.slice(eqIdx + 1).trim();
    if (key === 'ts') ts = val;
    if (key === 'v1') v1 = val;
  });

  if (!ts || !v1) return false;

  // Monta a string exatamente como o MP documenta
  const parts = [];
  const dataId = req.body && req.body.data && req.body.data.id;
  if (dataId) parts.push('id:' + dataId);
  if (reqId)  parts.push('request-id:' + reqId);
  parts.push('ts:' + ts);
  const manifest = parts.join(';');

  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  // Comparação em tempo constante para evitar timing attack
  try {
    return crypto.timingSafeEqual(Buffer.from(v1, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

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

async function sendAlert(mpPaymentId, errorMessage) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  try {
    const { Resend } = require('resend');
    const resend = new Resend(apiKey);
    const horario = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    await resend.emails.send({
      from: 'ImpreBrindes <pedidos@imprebrindes.com.br>',
      to: ['gugarbarski@gmail.com', 'gustavo@impresul.com.br'],
      subject: `⚠️ Falha no webhook MP — pagamento ${mpPaymentId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background: #7f1d1d; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #fca5a5; margin: 0; font-size: 20px;">⚠️ Falha no Webhook MP</h1>
          </div>
          <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 16px; font-size: 14px; color: #555;">
              O webhook encontrou um erro ao processar um pagamento aprovado no Mercado Pago.
            </p>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #888; width: 140px;">Payment ID (MP)</td>
                <td style="padding: 6px 0; font-weight: 700; font-family: monospace;">${mpPaymentId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #888;">Horário</td>
                <td style="padding: 6px 0;">${horario}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #888; vertical-align: top;">Erro</td>
                <td style="padding: 6px 0; color: #dc2626; font-family: monospace; word-break: break-all; font-size: 12px;">${errorMessage}</td>
              </tr>
            </table>
            <div style="margin-top: 20px; padding: 14px 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;">
              <p style="margin: 0; font-size: 13px; color: #991b1b; line-height: 1.5;">
                <strong>Ação necessária:</strong> Verifique no Supabase se o pedido com
                <strong>mp_payment_id = ${mpPaymentId}</strong> está marcado como <em>pago</em>.
                Se não estiver, atualize o status manualmente no painel admin.
              </p>
            </div>
          </div>
        </div>
      `,
    });
  } catch {
    // Não deixa o alerta travar o handler
  }
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

  const webhookSecret = process.env.MP_WEBHOOK_SECRET;
  if (webhookSecret) {
    if (!verifySignature(req, webhookSecret)) {
      console.warn('Webhook MP: assinatura inválida rejeitada');
      return res.status(401).json({ error: 'invalid_signature' });
    }
  } else {
    console.warn('Webhook MP: MP_WEBHOOK_SECRET não configurado — verificação desabilitada');
  }

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
      const { error: upErr1 } = await db.from('pedidos').update({ status: 'pago' }).eq('mp_payment_id', mpPaymentId);
      if (upErr1) throw new Error(`DB update by mp_payment_id falhou: ${upErr1.message}`);
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
        const { error: upErr2 } = await db.from('pedidos').update({ status: 'pago', mp_payment_id: mpPaymentId }).eq('id', pedidoId);
        if (upErr2) throw new Error(`DB update by pedido_id falhou: ${upErr2.message}`);
        console.log(`Webhook: pedido ${pedidoId} → pago (via metadata)`);
        await sendEmails(byId, valorTotal, mpPaymentId);
        return res.status(200).json({ ok: true });
      }
    }

    const emailTo = g('buyer_email', 'buyerEmail') || mp.payer?.email || '';
    const nome = g('buyer_name', 'buyerName') || (mp.payer?.first_name ? `${mp.payer.first_name} ${mp.payer.last_name || ''}`.trim() : '');
    const productName = g('product_name', 'productName');

    const { error: insErr } = await db.from('pedidos').insert({
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
    if (insErr) throw new Error(`DB insert via metadata falhou: ${insErr.message}`);
    console.log(`Webhook: pedido criado via metadata para pagamento ${mpPaymentId}`);
    await sendEmails(
      { nome, email: emailTo, produto: productName, quantidade: Number(meta.quantity) || 0,
        endereco: g('address', 'address'), tipo_personalizacao: g('customization_type', 'customizationType'),
        cor_serigrafia: g('serigrafia_color', 'serigrafiaColor') },
      valorTotal, mpPaymentId,
    );

    return res.status(200).json({ ok: true });

  } catch (err) {
    const alertId = data?.id ? String(data.id) : 'desconhecido';
    sendAlert(alertId, err?.message || String(err)); // fire-and-forget
    console.error('Webhook erro interno:', err?.message || err);
    return res.status(200).json({ ok: false, error: 'internal_error' });
  }
};
