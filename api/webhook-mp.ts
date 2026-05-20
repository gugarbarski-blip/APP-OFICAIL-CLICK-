import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { createHmac } from 'crypto';

function verifyMpSignature(req: any): boolean {
  const xSignature = req.headers['x-signature'] as string | undefined;
  const xRequestId = req.headers['x-request-id'] as string | undefined;
  const dataId = (req.query?.['data.id'] as string | undefined)
    || String(req.body?.data?.id ?? '');

  console.log('Webhook recebido:', JSON.stringify({
    xSignature: xSignature?.slice(0, 40) ?? null,
    xRequestId: xRequestId ?? null,
    dataId,
    queryKeys: Object.keys(req.query || {}),
  }));

  // Se não há header de assinatura (simulação/teste do painel MP), deixa passar
  if (!xSignature || !xRequestId) {
    console.warn('Webhook: sem headers de assinatura — aceito sem verificação');
    return true;
  }

  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    console.error('CRITICAL: MP_WEBHOOK_SECRET não configurado — aceitando sem verificação');
    return true;
  }

  const tsMatch = xSignature.match(/ts=([^,]+)/);
  const v1Match = xSignature.match(/v1=([^,]+)/);
  if (!tsMatch || !v1Match) {
    console.warn('Webhook: formato x-signature inválido', { xSignature });
    return false;
  }

  const ts = tsMatch[1];
  const v1 = v1Match[1];
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts}`;
  const expected = createHmac('sha256', secret).update(manifest).digest('hex');

  if (expected !== v1) {
    console.warn('Webhook: HMAC inválido', { manifest, expected: expected.slice(0, 10), received: v1.slice(0, 10) });
    return false;
  }

  console.log('Webhook: assinatura VÁLIDA');
  return true;
}

function getDb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Supabase env vars missing');
  return createClient(url, key);
}

async function sendOwnerNotification(opts: {
  nome: string;
  email: string;
  produto: string;
  quantidade: number;
  valorTotal: number;
  endereco: string;
  tipoPersonalizacao: string;
  corSerigrafia: string;
  mpPaymentId: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  const total = `R$ ${opts.valorTotal.toFixed(2).replace('.', ',')}`;
  const personalizacao = opts.tipoPersonalizacao === 'laser'
    ? 'Gravação a Laser'
    : `Serigrafia 1 Cor${opts.corSerigrafia ? ` — ${opts.corSerigrafia}` : ''}`;

  await resend.emails.send({
    from: 'ImpreBrindes <pedidos@imprebrindes.com.br>',
    to: ['gugarbarski@gmail.com', 'gustavo@impresul.com.br'],
    subject: `🛒 Novo pedido aprovado! ${opts.nome} — ${total}`,
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

async function sendConfirmationEmail(opts: {
  to: string;
  nome: string;
  produto: string;
  quantidade: number;
  valorTotal: number;
  endereco: string;
  tipoPersonalizacao: string;
  corSerigrafia: string;
  mpPaymentId: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set, skipping email');
    return;
  }

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
          <h2 style="color: #1a1a1a; margin: 0 0 8px;">Pagamento aprovado! ✅</h2>
          <p style="color: #555; margin: 0 0 24px;">Olá, <strong>${opts.nome}</strong>! Recebemos seu pagamento e seu pedido já está em produção.</p>

          <div style="background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 16px; font-size: 15px; color: #1a1a1a; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px;">Detalhes do Pedido</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #888;">Produto</td>
                <td style="padding: 6px 0; text-align: right; font-weight: 600;">${opts.produto}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #888;">Personalização</td>
                <td style="padding: 6px 0; text-align: right; font-weight: 600;">${personalizacao}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #888;">Quantidade</td>
                <td style="padding: 6px 0; text-align: right; font-weight: 600;">${opts.quantidade} unidades</td>
              </tr>
              <tr style="border-top: 1px solid #f0f0f0;">
                <td style="padding: 10px 0 0; color: #1a1a1a; font-weight: 700; font-size: 15px;">Total pago</td>
                <td style="padding: 10px 0 0; text-align: right; color: #D4AF37; font-weight: 700; font-size: 18px;">${total}</td>
              </tr>
            </table>
          </div>

          <div style="background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 10px; font-size: 15px; color: #1a1a1a;">Endereço de Entrega</h3>
            <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">${opts.endereco}</p>
          </div>

          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; color: #92400e;">
              📦 <strong>Próximos passos:</strong> Entraremos em contato para confirmar os detalhes da personalização e informar o prazo de entrega. Em caso de dúvidas, responda este e-mail.
            </p>
          </div>

          <p style="font-size: 12px; color: #aaa; text-align: center; margin: 0;">
            Pedido #${opts.mpPaymentId} · ImpreBrindes
          </p>
        </div>
      </div>
    `,
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  if (!verifyMpSignature(req)) {
    console.warn('Webhook MP: assinatura inválida rejeitada');
    return res.status(401).end();
  }

  const { type, action, data } = req.body || {};

  // Suporta formato IPN antigo (type:"payment") e Webhooks/Events novo (action:"payment.*")
  const isPaymentEvent =
    type === 'payment' ||
    action === 'payment.created' ||
    action === 'payment.updated';

  if (!isPaymentEvent) return res.status(200).end();

  try {
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
    const payment = new Payment(client);
    const mp = await payment.get({ id: data.id });

    if (mp.status !== 'approved') return res.status(200).end();

    const meta = mp.metadata || {};
    const db = getDb();

    const emailTo = mp.payer?.email || meta.buyer_email || '';
    const nome = mp.payer?.first_name
      ? `${mp.payer.first_name} ${mp.payer.last_name || ''}`.trim()
      : meta.buyer_name || '';

    if (meta.pedido_id) {
      await db.from('pedidos').update({
        status: 'pago',
        mp_payment_id: String(mp.id),
      }).eq('id', meta.pedido_id);
    } else {
      await db.from('pedidos').insert({
        mp_payment_id: String(mp.id),
        status: 'pago',
        nome,
        email: emailTo,
        produto: meta.product_name || '',
        quantidade: Number(meta.quantity) || 0,
        valor_total: mp.transaction_amount,
        endereco: meta.address || '',
        tipo_personalizacao: meta.customization_type || '',
        cor_serigrafia: meta.serigrafia_color || '',
        created_at: new Date().toISOString(),
      });
    }

    await sendOwnerNotification({
      nome,
      email: emailTo,
      produto: meta.product_name || '',
      quantidade: Number(meta.quantity) || 0,
      valorTotal: mp.transaction_amount ?? 0,
      endereco: meta.address || '',
      tipoPersonalizacao: meta.customization_type || '',
      corSerigrafia: meta.serigrafia_color || '',
      mpPaymentId: String(mp.id),
    });

    await sendConfirmationEmail({
      to: emailTo,
      nome,
      produto: meta.product_name || '',
      quantidade: Number(meta.quantity) || 0,
      valorTotal: mp.transaction_amount ?? 0,
      endereco: meta.address || '',
      tipoPersonalizacao: meta.customization_type || '',
      corSerigrafia: meta.serigrafia_color || '',
      mpPaymentId: String(mp.id),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).end();
  }
}
