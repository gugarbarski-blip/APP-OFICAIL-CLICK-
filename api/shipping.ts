import type { VercelRequest, VercelResponse } from '@vercel/node';

// ── Configuração ──────────────────────────────────────────────────────────────

const CEP_ORIGEM    = '91430221'; // Porto Alegre/RS
const PRODUCAO_DIAS = 2;          // dias úteis de produção somados ao prazo
const CUPS_PER_BOX  = 20;
const BOX_WEIGHT_G  = 700;
const BOX_COMP      = 45;
const BOX_ALT       = 36;
const BOX_LARG      = 33;
const BOX_CUBIC_G   = Math.round((BOX_COMP * BOX_ALT * BOX_LARG) / 6000 * 1000);

// Margem de segurança aplicada à tabela estática para proteger contra
// reajustes dos Correios e cobrir variações de peso/embalagem.
const MARGEM_SEGURANCA = 1.15; // +15%

// ── Tipo interno ──────────────────────────────────────────────────────────────

interface ShippingResult {
  service: string;
  company: string;
  price: number;
  deadlineDays: number;
  label: string;
}

const plural = (n: number) => `${n} dia${n !== 1 ? 's' : ''} ${n !== 1 ? 'úteis' : 'útil'}`;
const round2 = (v: number) => Math.round(v * 100) / 100;

// ── Mapa de zonas — todos os 27 estados brasileiros explícitos ────────────────

const UF_ZONE: Record<string, number> = {
  // Zona 1 — Origem (RS)
  RS: 1,
  // Zona 2 — Sul
  SC: 2, PR: 2,
  // Zona 3 — Sudeste
  SP: 3, RJ: 3, ES: 3, MG: 3,
  // Zona 4 — Centro-Oeste
  GO: 4, MS: 4, MT: 4, DF: 4,
  // Zona 5 — Nordeste costeiro
  BA: 5, SE: 5, AL: 5, PE: 5, PB: 5, RN: 5, CE: 5, PI: 5,
  // Zona 6 — Norte/Nordeste interior
  MA: 6, TO: 6, PA: 6, AP: 6,
  // Zona 7 — Norte profundo
  AM: 7, RO: 7, RR: 7, AC: 7,
};

function getZone(uf: string): number | null {
  return UF_ZONE[uf.toUpperCase()] ?? null;
}

// ── Tabela Correios PAC (preços base por kg/zona, com margem de 15%) ──────────
// Fonte: tabela vigente 2024 — aplicar MARGEM_SEGURANCA no cálculo

const PAC_TABLE = [
  { maxWeight:  1000, prices: [18.50, 20.00, 22.50, 25.00, 27.00, 32.00, 37.00] },
  { maxWeight:  2000, prices: [20.00, 22.00, 25.00, 28.00, 31.00, 37.00, 43.00] },
  { maxWeight:  5000, prices: [24.00, 27.00, 32.00, 37.00, 43.00, 52.00, 61.00] },
  { maxWeight: 10000, prices: [30.00, 35.00, 42.00, 50.00, 59.00, 72.00, 85.00] },
  { maxWeight: 20000, prices: [42.00, 51.00, 62.00, 76.00, 91.00, 112.00, 133.00] },
  { maxWeight: 30000, prices: [54.00, 67.00, 82.00, 102.00, 123.00, 152.00, 181.00] },
];

const SEDEX_TABLE = [
  { maxWeight:  1000, prices: [25.00, 30.00, 38.00, 44.00, 51.00, 62.00, 73.00] },
  { maxWeight:  2000, prices: [29.00, 36.00, 47.00, 56.00, 65.00, 80.00, 95.00] },
  { maxWeight:  5000, prices: [41.00, 54.00, 74.00, 92.00, 107.00, 134.00, 161.00] },
  { maxWeight: 10000, prices: [61.00, 82.00, 116.00, 146.00, 171.00, 216.00, 261.00] },
  { maxWeight: 20000, prices: [101.00, 138.00, 200.00, 254.00, 299.00, 380.00, 461.00] },
  { maxWeight: 30000, prices: [141.00, 194.00, 284.00, 362.00, 427.00, 544.00, 661.00] },
];

const PAC_DEADLINE   = [5, 6, 7, 9, 11, 14, 17];
const SEDEX_DEADLINE = [1, 2, 3, 4,  4,  5,  5];

function staticPrice(table: typeof PAC_TABLE, weightG: number, zone: number): number {
  const row = table.find(r => weightG <= r.maxWeight) ?? table[table.length - 1];
  return row.prices[zone - 1];
}

// ── Melhor Envio ──────────────────────────────────────────────────────────────

async function calcMelhorEnvio(
  cepDestino: string,
  numBoxes: number,
  weightPerBoxKg: number,
): Promise<ShippingResult[]> {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  if (!token) throw new Error('MELHOR_ENVIO_TOKEN não configurado');

  const baseUrl = process.env.MELHOR_ENVIO_SANDBOX === 'true'
    ? 'https://sandbox.melhorenvio.com.br'
    : 'https://www.melhorenvio.com.br';

  const pkg  = { height: BOX_ALT, width: BOX_LARG, length: BOX_COMP, weight: weightPerBoxKg };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);

  let data: any[];
  try {
    const resp = await fetch(`${baseUrl}/api/v2/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ImpreBrindes contato@imprebrindes.com.br',
      },
      body: JSON.stringify({
        from: { postal_code: CEP_ORIGEM },
        to:   { postal_code: cepDestino },
        package: pkg,
        options: { receipt: false, own_hand: false },
      }),
      signal: ctrl.signal,
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      throw new Error(`Melhor Envio HTTP ${resp.status}: ${txt.slice(0, 500)}`);
    }
    data = await resp.json();
  } finally {
    clearTimeout(timer);
  }

  if (!Array.isArray(data)) {
    throw new Error('Melhor Envio retornou resposta inesperada (não é array)');
  }

  const valid = (data as any[]).filter(s => !s.error && s.price != null && parseFloat(s.price) > 0);
  console.log(`[ME] ${(data as any[]).length} serviços, ${valid.length} válidos`);

  return valid
    .map(s => {
      const shippingDays = s.custom_delivery_time ?? s.delivery_time ?? 0;
      const totalDays    = PRODUCAO_DIAS + shippingDays;
      const company      = s.company?.name ?? '';
      const name         = s.name ?? '';
      return {
        service:      `ME_${s.id}`,
        company,
        price:        round2(parseFloat(s.price) * numBoxes),
        deadlineDays: totalDays,
        label:        `${company} ${name} — até ${plural(totalDays)} (${PRODUCAO_DIAS} prod. + ${shippingDays} frete)`,
      };
    })
    .sort((a, b) => a.price - b.price);
}

// ── Lookup de UF via viacep (fallback) ───────────────────────────────────────

async function fetchUFFromCEP(cep: string): Promise<string> {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: ctrl.signal });
    if (!r.ok) throw new Error(`viacep HTTP ${r.status}`);
    const d = await r.json();
    if (d.erro) throw new Error('CEP não encontrado no viacep');
    return String(d.uf).toUpperCase();
  } finally {
    clearTimeout(timer);
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    return await handleShipping(req, res);
  } catch (err) {
    console.error('[SHIPPING-FATAL]', String(err));
    return res.status(500).json({ error: 'Erro interno ao calcular frete. Tente novamente.' });
  }
}

async function handleShipping(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body ?? {};
  const { cepDestino, quantity, productId, uf: ufParam } = body as {
    cepDestino: string; quantity: number; productId: string; uf?: string;
  };

  const cleanCEP = String(cepDestino ?? '').replace(/\D/g, '');
  if (cleanCEP.length !== 8) return res.status(400).json({ error: 'CEP inválido' });
  if (!quantity || quantity < 1) return res.status(400).json({ error: 'Quantidade inválida' });

  const weightPerUnit      = productId === 'cuia-320' ? 173 : 268;
  const numBoxes           = Math.ceil(quantity / CUPS_PER_BOX);
  const realWeightPerBoxKg = (CUPS_PER_BOX * weightPerUnit + BOX_WEIGHT_G) / 1000;

  const combined: ShippingResult[] = [];

  // ── Melhor Envio (se token configurado) ──────────────────────────────────
  if (process.env.MELHOR_ENVIO_TOKEN) {
    try {
      const meOpts = await calcMelhorEnvio(cleanCEP, numBoxes, realWeightPerBoxKg);
      combined.push(...meOpts);
    } catch (err) {
      console.error('[ME-ERRO]', String(err));
    }
  }

  // ── Correios via tabela estática ──────────────────────────────────────────
  const jaTemPAC   = combined.some(o => o.label.toLowerCase().includes('pac'));
  const jaTemSEDEX = combined.some(o => o.label.toLowerCase().includes('sedex'));

  if (!jaTemPAC || !jaTemSEDEX) {
    // 1) UF enviado pelo front (preferencial — sem chamada externa)
    // 2) Busca no viacep como fallback
    // 3) Se nenhum funcionar, retorna erro — NUNCA chuta zona errada
    let uf: string | null = ufParam ? ufParam.toUpperCase().trim() : null;

    if (!uf || !UF_ZONE[uf]) {
      console.warn(`[FRETE] uf inválido ou ausente ("${ufParam}"), tentando viacep...`);
      try {
        uf = await fetchUFFromCEP(cleanCEP);
      } catch (err) {
        console.error('[FRETE] viacep falhou:', String(err));
        uf = null;
      }
    }

    const zone = uf ? getZone(uf) : null;

    if (!zone) {
      // Não foi possível determinar a zona com certeza — não mostra preço errado
      console.error(`[FRETE] Zona indeterminada para UF="${uf}" CEP="${cleanCEP}"`);
      if (combined.length === 0) {
        return res.status(400).json({
          error: 'Não foi possível calcular o frete para este CEP. Por favor, entre em contato pelo WhatsApp.',
        });
      }
      // ME já retornou algo — entrega sem Correios estáticos
      combined.sort((a, b) => a.price - b.price);
      return res.status(200).json({ options: combined, numBoxes, realWeightPerBoxKg });
    }

    console.log(`[FRETE] UF=${uf} Zona=${zone} CEP=${cleanCEP} caixas=${numBoxes}`);
    const chargeG = Math.max(CUPS_PER_BOX * weightPerUnit + BOX_WEIGHT_G, BOX_CUBIC_G);

    if (!jaTemPAC) {
      const d     = PAC_DEADLINE[zone - 1];
      const total = PRODUCAO_DIAS + d;
      combined.push({
        service:      'PAC',
        company:      'Correios',
        price:        round2(staticPrice(PAC_TABLE, chargeG, zone) * numBoxes * MARGEM_SEGURANCA),
        deadlineDays: total,
        label:        `Correios PAC — até ${plural(total)} (${PRODUCAO_DIAS} prod. + ${d} frete)`,
      });
    }
    if (!jaTemSEDEX) {
      const d     = SEDEX_DEADLINE[zone - 1];
      const total = PRODUCAO_DIAS + d;
      combined.push({
        service:      'SEDEX',
        company:      'Correios',
        price:        round2(staticPrice(SEDEX_TABLE, chargeG, zone) * numBoxes * MARGEM_SEGURANCA),
        deadlineDays: total,
        label:        `Correios SEDEX — até ${plural(total)} (${PRODUCAO_DIAS} prod. + ${d} frete)`,
      });
    }
  }

  combined.sort((a, b) => a.price - b.price);
  return res.status(200).json({ options: combined, numBoxes, realWeightPerBoxKg });
}
