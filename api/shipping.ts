import type { VercelRequest, VercelResponse } from '@vercel/node';

const CEP_ORIGEM    = '91430221';
const PRODUCAO_DIAS = 2;
const CUPS_PER_BOX  = 20;
const BOX_WEIGHT_G  = 700;
const BOX_COMP      = 45;
const BOX_ALT       = 36;
const BOX_LARG      = 33;
const BOX_CUBIC_G   = Math.round((BOX_COMP * BOX_ALT * BOX_LARG) / 6000 * 1000);
const MARGEM        = 1.15;

interface ShippingResult {
  service: string;
  company: string;
  price: number;
  deadlineDays: number;
  label: string;
}

const plural = (n: number) => `${n} dia${n !== 1 ? 's' : ''} ${n !== 1 ? 'úteis' : 'útil'}`;
const round2 = (v: number) => Math.round(v * 100) / 100;

const UF_ZONE: Record<string, number> = {
  RS: 1,
  SC: 2, PR: 2,
  SP: 3, RJ: 3, ES: 3, MG: 3,
  GO: 4, MS: 4, MT: 4, DF: 4,
  BA: 5, SE: 5, AL: 5, PE: 5, PB: 5, RN: 5, CE: 5, PI: 5,
  MA: 6, TO: 6, PA: 6, AP: 6,
  AM: 7, RO: 7, RR: 7, AC: 7,
};

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

function tablePrice(table: typeof PAC_TABLE, weightG: number, zone: number): number {
  const row = table.find(r => weightG <= r.maxWeight) ?? table[table.length - 1];
  return row.prices[zone - 1];
}

async function getUFFromViaCep(cep: string): Promise<string | null> {
  try {
    const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!resp.ok) return null;
    const json = await resp.json();
    if (json.erro || !json.uf) return null;
    return String(json.uf).toUpperCase();
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body ?? {};
    const { cepDestino, quantity, productId, uf: ufParam } = body as {
      cepDestino?: string;
      quantity?: number;
      productId?: string;
      uf?: string;
    };

    const cleanCEP = String(cepDestino ?? '').replace(/\D/g, '');
    if (cleanCEP.length !== 8) return res.status(400).json({ error: 'CEP inválido' });

    const qty = Number(quantity);
    if (!qty || qty < 1) return res.status(400).json({ error: 'Quantidade inválida' });

    const weightPerUnit      = productId === 'cuia-320' ? 173 : 268;
    const numBoxes           = Math.ceil(qty / CUPS_PER_BOX);
    const realWeightPerBoxKg = (CUPS_PER_BOX * weightPerUnit + BOX_WEIGHT_G) / 1000;

    let uf: string | null = (ufParam && UF_ZONE[ufParam.toUpperCase().trim()])
      ? ufParam.toUpperCase().trim()
      : null;

    if (!uf) {
      uf = await getUFFromViaCep(cleanCEP);
    }

    const zone = uf ? (UF_ZONE[uf] ?? null) : null;

    if (!zone) {
      return res.status(400).json({
        error: 'Não foi possível calcular o frete para este CEP. Entre em contato pelo WhatsApp.',
      });
    }

    const chargeG = Math.max(CUPS_PER_BOX * weightPerUnit + BOX_WEIGHT_G, BOX_CUBIC_G);
    const results: ShippingResult[] = [];

    const pacDays  = PAC_DEADLINE[zone - 1];
    const pacTotal = PRODUCAO_DIAS + pacDays;
    results.push({
      service:      'PAC',
      company:      'Correios',
      price:        round2(tablePrice(PAC_TABLE, chargeG, zone) * numBoxes * MARGEM),
      deadlineDays: pacTotal,
      label:        `Correios PAC — até ${plural(pacTotal)} (${PRODUCAO_DIAS} prod. + ${pacDays} frete)`,
    });

    const sedexDays  = SEDEX_DEADLINE[zone - 1];
    const sedexTotal = PRODUCAO_DIAS + sedexDays;
    results.push({
      service:      'SEDEX',
      company:      'Correios',
      price:        round2(tablePrice(SEDEX_TABLE, chargeG, zone) * numBoxes * MARGEM),
      deadlineDays: sedexTotal,
      label:        `Correios SEDEX — até ${plural(sedexTotal)} (${PRODUCAO_DIAS} prod. + ${sedexDays} frete)`,
    });

    results.sort((a, b) => a.price - b.price);
    return res.status(200).json({ options: results, numBoxes, realWeightPerBoxKg });

  } catch (err) {
    console.error('[SHIPPING-FATAL]', String(err));
    return res.status(500).json({ error: 'Erro interno ao calcular frete. Tente novamente.' });
  }
}
