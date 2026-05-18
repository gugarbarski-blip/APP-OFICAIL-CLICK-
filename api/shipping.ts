import type { VercelRequest, VercelResponse } from '@vercel/node';

// ── Configuração ─────────────────────────────────────────────────────────────

const CEP_ORIGEM      = '91430221'; // Porto Alegre/RS
const PRODUCAO_DIAS   = 2;         // dias úteis de produção somados ao prazo
const CUPS_PER_BOX = 20;
const BOX_WEIGHT_G = 700;
const BOX_COMP     = 45;
const BOX_ALT      = 36;
const BOX_LARG     = 33;
const BOX_CUBIC_G  = Math.round((BOX_COMP * BOX_ALT * BOX_LARG) / 6000 * 1000);

const PAC_CODE   = '04510';
const SEDEX_CODE = '04014';

// ── Tipo interno ─────────────────────────────────────────────────────────────

interface ShippingResult {
  service: string;
  company: string;
  price: number;
  deadlineDays: number;
  label: string;
}

const plural = (n: number) => `${n} dia${n !== 1 ? 's' : ''} útil${n !== 1 ? 'eis' : ''}`;
const round2 = (v: number) => Math.round(v * 100) / 100;

// ── Melhor Envio ─────────────────────────────────────────────────────────────

async function calcMelhorEnvio(
  cepDestino: string,
  numBoxes: number,
  weightPerBoxKg: number,
): Promise<ShippingResult[]> {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  if (!token) throw new Error('MELHOR_ENVIO_TOKEN não configurado');

  // Support sandbox tokens (set MELHOR_ENVIO_SANDBOX=true for testing)
  const baseUrl = process.env.MELHOR_ENVIO_SANDBOX === 'true'
    ? 'https://sandbox.melhorenvio.com.br'
    : 'https://www.melhorenvio.com.br';

  // ME API usa package (singular), peso total de todas as caixas
  const totalWeightKg = round2(weightPerBoxKg * numBoxes);
  const pkg = { height: BOX_ALT, width: BOX_LARG, length: BOX_COMP, weight: totalWeightKg };

  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);

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

  const valid = (data as any[]).filter(s => !s.error && s.price != null && parseFloat(s.price) > 0);
  console.log(`Melhor Envio: ${(data as any[]).length} serviços retornados, ${valid.length} válidos`);

  return valid
    .map(s => {
      const shippingDays = s.custom_delivery_time ?? s.delivery_time ?? 0;
      const totalDays    = PRODUCAO_DIAS + shippingDays;
      const company      = s.company?.name ?? '';
      const name         = s.name ?? '';
      return {
        service:      `ME_${s.id}`,
        company,
        price:        round2(parseFloat(s.price)),
        deadlineDays: totalDays,
        label:        `${company} ${name} — até ${plural(totalDays)} (${PRODUCAO_DIAS} prod. + ${shippingDays} frete)`,
      };
    })
    .sort((a, b) => a.price - b.price);
}

// ── Correios (API em tempo real) ──────────────────────────────────────────────

async function calcCorreiosBox(cepDestino: string, pesoKg: number): Promise<{
  pac: number; pacDays: number; sedex: number | null; sedexDays: number | null;
}> {
  const qs = new URLSearchParams({
    nCdEmpresa: '', sDsSenha: '',
    nCdServico: `${PAC_CODE},${SEDEX_CODE}`,
    sCepOrigem: CEP_ORIGEM, sCepDestino: cepDestino,
    nVlPeso: pesoKg.toFixed(3), nCdFormato: '1',
    nVlComprimento: String(BOX_COMP), nVlAltura: String(BOX_ALT),
    nVlLargura: String(BOX_LARG), nVlDiametro: '0',
    sCdMaoPropria: 'N', nVlValorDeclarado: '0', sCdAvisoRecebimento: 'N',
  }).toString();

  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  let xml: string;
  try {
    const resp = await fetch(
      `http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx?${qs}`,
      { signal: ctrl.signal },
    );
    if (!resp.ok) throw new Error(`Correios HTTP ${resp.status}`);
    xml = await resp.text();
  } finally {
    clearTimeout(timer);
  }

  const blocks = xml.match(/<cServico>[\s\S]*?<\/cServico>/g) ?? [];
  if (!blocks.length) throw new Error('Resposta inválida dos Correios');

  let pac: { price: number; days: number } | null   = null;
  let sedex: { price: number; days: number } | null = null;

  for (const blk of blocks) {
    const tag   = (n: string) => blk.match(new RegExp(`<${n}>([^<]*)</${n}>`))?.[1]?.trim() ?? '';
    const code  = tag('Codigo');
    if (tag('Erro') !== '0') continue;
    const price = parseFloat(tag('Valor').replace(',', '.'));
    const days  = parseInt(tag('PrazoEntrega'), 10);
    if (!isFinite(price) || price <= 0 || !isFinite(days)) continue;
    if (code === PAC_CODE)   pac   = { price, days };
    if (code === SEDEX_CODE) sedex = { price, days };
  }

  if (!pac) throw new Error('PAC não disponível');
  return { pac: pac.price, pacDays: pac.days, sedex: sedex?.price ?? null, sedexDays: sedex?.days ?? null };
}

// ── Tabelas estáticas (último fallback) ───────────────────────────────────────

function getZone(uf: string): number {
  const u = uf.toUpperCase();
  if (['RS'].includes(u)) return 1;
  if (['SC', 'PR'].includes(u)) return 2;
  if (['SP', 'RJ', 'ES', 'MG'].includes(u)) return 3;
  if (['GO', 'MS', 'MT', 'DF'].includes(u)) return 4;
  if (['BA', 'SE', 'AL', 'PE', 'PB', 'RN', 'CE', 'PI'].includes(u)) return 5;
  if (['MA', 'TO', 'PA', 'AP'].includes(u)) return 6;
  return 7;
}

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

async function getUF(cep: string): Promise<string> {
  const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  if (!r.ok) throw new Error('CEP inválido');
  const d = await r.json();
  if (d.erro) throw new Error('CEP não encontrado');
  return d.uf as string;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { cepDestino, quantity, productId } = req.body as {
    cepDestino: string; quantity: number; productId: string;
  };

  const cleanCEP = String(cepDestino).replace(/\D/g, '');
  if (cleanCEP.length !== 8) return res.status(400).json({ error: 'CEP inválido' });
  if (!quantity || quantity < 1) return res.status(400).json({ error: 'Quantidade inválida' });

  const weightPerUnit      = productId === 'cuia-320' ? 173 : 268;
  const numBoxes           = Math.ceil(quantity / CUPS_PER_BOX);
  const realWeightPerBoxKg = (CUPS_PER_BOX * weightPerUnit + BOX_WEIGHT_G) / 1000;

  // Roda ME e Correios em paralelo, mostra tudo junto
  const [meResult, correiosResult] = await Promise.allSettled([
    process.env.MELHOR_ENVIO_TOKEN
      ? calcMelhorEnvio(cleanCEP, numBoxes, realWeightPerBoxKg)
      : Promise.resolve([] as ShippingResult[]),
    calcCorreiosBox(cleanCEP, realWeightPerBoxKg),
  ]);

  const combined: ShippingResult[] = [];

  if (meResult.status === 'fulfilled') {
    combined.push(...meResult.value);
  } else {
    console.error('[ME-ERRO]', meResult.reason);
  }

  if (correiosResult.status === 'fulfilled') {
    const box = correiosResult.value;
    // Só adiciona Correios se o ME não os retornou já
    const jaTemPAC   = combined.some(o => o.label.toLowerCase().includes('pac'));
    const jaTemSEDEX = combined.some(o => o.label.toLowerCase().includes('sedex'));
    if (!jaTemPAC) {
      const total = PRODUCAO_DIAS + box.pacDays;
      combined.push({
        service: 'PAC', company: 'Correios',
        price: round2(box.pac * numBoxes),
        deadlineDays: total,
        label: `Correios PAC — até ${plural(total)} (${PRODUCAO_DIAS} prod. + ${box.pacDays} frete)`,
      });
    }
    if (!jaTemSEDEX && box.sedex !== null && box.sedexDays !== null) {
      const total = PRODUCAO_DIAS + box.sedexDays;
      combined.push({
        service: 'SEDEX', company: 'Correios',
        price: round2(box.sedex * numBoxes),
        deadlineDays: total,
        label: `Correios SEDEX — até ${plural(total)} (${PRODUCAO_DIAS} prod. + ${box.sedexDays} frete)`,
      });
    }
  } else {
    console.warn('Correios API falhou, usando tabela estática');
    const uf      = await getUF(cleanCEP).catch(() => 'SP');
    const zone    = getZone(uf);
    const chargeG = Math.max(CUPS_PER_BOX * weightPerUnit + BOX_WEIGHT_G, BOX_CUBIC_G);
    const jaTemPAC   = combined.some(o => o.label.toLowerCase().includes('pac'));
    const jaTemSEDEX = combined.some(o => o.label.toLowerCase().includes('sedex'));
    if (!jaTemPAC) {
      const d = PAC_DEADLINE[zone - 1];
      const total = PRODUCAO_DIAS + d;
      combined.push({
        service: 'PAC', company: 'Correios',
        price: round2(staticPrice(PAC_TABLE, chargeG, zone) * numBoxes),
        deadlineDays: total,
        label: `Correios PAC — até ${plural(total)} (${PRODUCAO_DIAS} prod. + ${d} frete)`,
      });
    }
    if (!jaTemSEDEX) {
      const d = SEDEX_DEADLINE[zone - 1];
      const total = PRODUCAO_DIAS + d;
      combined.push({
        service: 'SEDEX', company: 'Correios',
        price: round2(staticPrice(SEDEX_TABLE, chargeG, zone) * numBoxes),
        deadlineDays: total,
        label: `Correios SEDEX — até ${plural(total)} (${PRODUCAO_DIAS} prod. + ${d} frete)`,
      });
    }
  }

  combined.sort((a, b) => a.price - b.price);

  return res.status(200).json({ options: combined, numBoxes, realWeightPerBoxKg });
}
