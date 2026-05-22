import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const PRICES: Record<string, Record<string, number>> = {
  'copo-475': { serigrafia: 23.00, laser: 28.00 },
  'cuia-320': { serigrafia: 23.00, laser: 28.00 },
};

function getServerPrice(productId: string, customizationType: string): number | null {
  const product = PRICES[productId];
  if (!product) return null;
  return product[customizationType] ?? product['serigrafia'] ?? null;
}

function getDb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Supabase env vars missing');
  return createClient(url, key);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) return res.status(500).json({ error: 'MP_ACCESS_TOKEN not configured' });

  const { productId, productName, quantity, buyerName, buyerEmail, buyerPhone, buyerCpfCnpj, address, customizationType, serigrafiaColor, artUrl, shippingPrice } = req.body || {};

  if (!productId || !productName || !quantity || !buyerEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const unitPrice = getServerPrice(productId, customizationType || 'serigrafia');
  if (!unitPrice) return res.status(400).json({ error: 'Produto inválido' });

  const qty = Math.max(1, Math.floor(Number(quantity)));
  const shipping = Math.max(0, Math.round(Number(shippingPrice) * 100) / 100) || 0;
  const total = Math.round((unitPrice * qty + shipping) * 100) / 100;

  // Salva pedido ANTES de criar o pagamento — não dependemos de metadata do MP
  let pedidoId: string | null = null;
  try {
    const db = getDb();
    const { data } = await db.from('pedidos').insert({
      status: 'aguardando_pix',
      nome: buyerName || '',
      email: buyerEmail,
      telefone: buyerPhone || '',
      cpf_cnpj: buyerCpfCnpj || '',
      produto: productName,
      quantidade: qty,
      valor_total: total,
      endereco: address || '',
      tipo_personalizacao: customizationType || '',
      cor_serigrafia: serigrafiaColor || '',
      arte_url: artUrl || null,
      created_at: new Date().toISOString(),
    }).select('id').single();
    pedidoId = data?.id ?? null;
  } catch (dbErr) {
    console.error('Supabase insert error:', dbErr);
  }

  try {
    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);

    const nameParts = (buyerName || 'Cliente').split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const cpfCnpjDigits = (buyerCpfCnpj || '').replace(/\D/g, '');
    const identificationType = cpfCnpjDigits.length === 14 ? 'CNPJ' : 'CPF';

    const result = await payment.create({
      body: {
        payment_method_id: 'pix',
        transaction_amount: total,
        description: productName,
        payer: {
          email: buyerEmail,
          first_name: firstName,
          last_name: lastName,
          identification: { type: identificationType, number: cpfCnpjDigits },
        },
        // pedido_id na metadata como fallback extra
        metadata: { pedido_id: pedidoId },
        notification_url: 'https://imprebrindes.impresul.com.br/api/webhook-mp',
      },
    });

    // Associa o mp_payment_id ao pedido salvo
    if (pedidoId) {
      try {
        const db = getDb();
        await db.from('pedidos').update({ mp_payment_id: String(result.id) }).eq('id', pedidoId);
      } catch {}
    }

    const txData = (result as any).point_of_interaction?.transaction_data;
    return res.status(200).json({
      paymentId: result.id,
      pedidoId,
      qrCode: txData?.qr_code,
      qrCodeBase64: txData?.qr_code_base64,
      expiresAt: (result as any).date_of_expiration,
    });
  } catch (err: any) {
    // Se o MP falhou, remove o pedido criado
    if (pedidoId) {
      try { await getDb().from('pedidos').delete().eq('id', pedidoId); } catch {}
    }
    const detail = {
      message: err?.message,
      status: err?.status,
      cause: err?.cause ? JSON.stringify(err.cause) : undefined,
      body: err?.body ? JSON.stringify(err.body) : undefined,
    };
    console.error('MP PIX error:', JSON.stringify(detail));
    return res.status(500).json({ error: 'Falha ao criar PIX', detail });
  }
}
