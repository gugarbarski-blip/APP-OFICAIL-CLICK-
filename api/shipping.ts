import type { VercelRequest, VercelResponse } from '@vercel/node';

// ── Configuração ─────────────────────────────────────────────────────────────

const CEP_ORIGEM    = '91430221'; // Porto Alegre/RS
const CUPS_PER_BOX  = 20;
const BOX_WEIGHT_G  = 750;       // peso da caixa vazia
const BOX_COMP      = 45;        // comprimento (cm)
const BOX_ALT       = 36;        // altura (cm)
const BOX_LARG      = 33;        // largura (cm)
// Peso cúbico por caixa = 45×36×33 / 6000 = 8.910g
const BOX_CUBIC_G   = Math.round((BOX_COMP * BOX_ALT * BOX_LARG) / 6000 * 1000);

const PAC_CODE   = '04510';
const SEDEX_CODE = '04014';

// ── Tabelas estáticas (fallback quando a API dos Correios estiver indisponível) ─

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

const PAC_TABLE: { maxWeight: number; prices: number[] }[] = [
  { maxWeight:  1000, prices: [18.50, 20.00, 22.50, 25.00, 27.00, 32.00, 37.00] },
  { maxWeight:  2000, prices: [20.00, 22.00, 25.00, 28.00, 31.00, 37.00, 43.00] },
  { maxWeight:  3000, prices: [21.50, 24.00, 28.00, 32.00, 36.00, 43.00, 50.00] },
  { maxWeight:  5000, prices: [24.00, 27.00, 32.00, 37.00, 43.00, 52.00, 61.00] },
  { maxWeight: 10000, prices: [30.00, 35.00, 42.00, 50.00, 59.00, 72.00, 85.00] },
  { maxWeight: 15000, prices: [36.00, 43.00, 52.00, 63.00, 75.00, 92.00, 109.00] },
  { maxWeight: 20000, prices: [42.00, 51.00, 62.00, 76.00, 91.00, 112.00, 133.00] },
  { maxWeight: 30000, prices: [54.00, 67.00, 82.00, 102.00, 123.00, 152.00, 181.00] },
];

const SEDEX_TABLE: { maxWeight: number; prices: number[] }[] = [
  { maxWeight:  1000, prices: [25.00, 30.00, 38.00, 44.00, 51.00, 62.00, 73.00] },
  { maxWeight:  2000, prices: [29.00, 36.00, 47.00, 56.00, 65.00, 80.00, 95.00] },
  { maxWeight:  3000, prices: [33.00, 42.00, 56.00, 68.00, 79.00, 98.00, 117.00] },
  { maxWeight:  5000, prices: [41.00, 54.00, 74.00, 92.00, 107.00, 134.00, 161.00] },
  { maxWeight: 10000, prices: [61.00, 82.00, 116.00, 146.00, 171.00, 216.00, 261.00] },
  { maxWeight: 15000, prices: [81.00, 110.00, 158.00, 200.00, 235.00, 298.00, 361.00] },
  { maxWeight: 20000, prices: [101.00, 138.00, 200.00, 254.00, 299.00, 380.00, 461.00] },
  { maxWeight: 30000, prices: [141.00, 194.00, 284.00, 362.00, 427.00, 544.00, 661.00] },
];

const PAC_DEADLINE   = [5, 6, 7, 9, 11, 14, 17];
const SEDEX_DEADLINE = [1, 2, 3, 4,  4,  5,  5];

function staticPrice(table: typeof PAC_TABLE, weightGrams: number, zone: number): number {
  const row = table.find(r => weightGrams <= r.maxWeight) ?? table[table.length - 1];
  return row.prices[zone - 1];
}

async function getUF(cep: string): Promise<string> {
  const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  if (!r.ok) throw new Error('CEP inválido');
  const d = await r.json();
  if (d.erro) throw new Error('CEP não encontrado');
  return d.uf as string;
}

// ── Chamada à API de Preço e Prazo dos Correios ───────────────────────────────
// Calcula o preço para UMA caixa (33×36×45, peso real fornecido).
// O Correios aplica internamente o peso cúbico (8.910g) quando supera o real.

interface BoxPrice {
  pac: number;
  pacDays: number;
  sedex: number | null;
  sedexDays: number | null;
}

async function calcCorreiosBox(cepDestino: string, pesoKg: number): Promise<BoxPrice> {
  const qs = new URLSearchParams({
    nCdEmpresa:           '',
    sDsSenha:             '',
    nCdServico:           `${PAC_CODE},${SEDEX_CODE}`,
    sCepOrigem:           CEP_ORIGEM,
    sCepDestino:          cepDestino,
    nVlPeso:              pesoKg.toFixed(3),
    nCdFormato:           '1',               // caixa/pacote
    nVlComprimento:       String(BOX_COMP),
    nVlAltura:            String(BOX_ALT),
    nVlLargura:           String(BOX_LARG),
    nVlDiametro:          '0',
    sCdMaoPropria:        'N',
    nVlValorDeclarado:    '0',
    sCdAvisoRecebimento:  'N',
  }).toString();

  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);

  let xml: string;
  try {
    const resp = await fetch(
      `http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx?${qs}`,
      { signal: ctrl.signal }
    );
    if (!resp.ok) throw new Error(`Correios HTTP ${resp.status}`);
    xml = await resp.text();
  } finally {
    clearTimeout(timer);
  }

  const blocks = xml.match(/<cServico>[\s\S]*?<\/cServico>/g) ?? [];
  if (blocks.length === 0) throw new Error('Resposta inválida dos Correios');

  let pac: { price: number; days: number } | null   = null;
  let sedex: { price: number; days: number } | null = null;

  for (const blk of blocks) {
    const tag  = (name: string) =>
      blk.match(new RegExp(`<${name}>([^<]*)<\/${name}>`))?.[1]?.trim() ?? '';
    const code = tag('Codigo');
    if (tag('Erro') !== '0') continue;            // serviço indisponível / erro
    const price = parseFloat(tag('Valor').replace(',', '.'));
    const days  = parseInt(tag('PrazoEntrega'), 10);
    if (!isFinite(price) || price <= 0 || !isFinite(days)) continue;
    if (code === PAC_CODE)   pac   = { price, days };
    if (code === SEDEX_CODE) sedex = { price, days };
  }

  if (!pac) throw new Error('PAC não disponível na resposta');
  return {
    pac:       pac.price,
    pacDays:   pac.days,
    sedex:     sedex?.price    ?? null,
    sedexDays: sedex?.days     ?? null,
  };
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

  // Peso por unidade (copo + embalagem individual estimada)
  const weightPerUnit = productId === 'cuia-320' ? 173 : 268;
  const numBoxes      = Math.ceil(quantity / CUPS_PER_BOX);

  // Peso real de uma caixa cheia (20 copos + caixa)
  const realWeightPerBoxKg = (CUPS_PER_BOX * weightPerUnit + BOX_WEIGHT_G) / 1000;

  try {
    let boxPrice: BoxPrice;

    try {
      // ── Tenta API em tempo real dos Correios ──
      boxPrice = await calcCorreiosBox(cleanCEP, realWeightPerBoxKg);
    } catch {
      // ── Fallback: tabela estática por zona ──
      const uf     = await getUF(cleanCEP);
      const zone   = getZone(uf);
      const chargeG = Math.max(
        CUPS_PER_BOX * weightPerUnit + BOX_WEIGHT_G,
        BOX_CUBIC_G
      );
      boxPrice = {
        pac:       staticPrice(PAC_TABLE,   chargeG, zone),
        pacDays:   PAC_DEADLINE[zone - 1],
        sedex:     staticPrice(SEDEX_TABLE, chargeG, zone),
        sedexDays: SEDEX_DEADLINE[zone - 1],
      };
    }

    const round2 = (v: number) => Math.round(v * 100) / 100;
    const plural = (n: number) =>
      `${n} dia${n !== 1 ? 's' : ''} útil${n !== 1 ? 'is' : ''}`;

    const options = [
      {
        service:      'PAC',
        price:        round2(boxPrice.pac * numBoxes),
        deadlineDays: boxPrice.pacDays,
        label:        `PAC — até ${plural(boxPrice.pacDays)}`,
      },
    ];

    if (boxPrice.sedex !== null && boxPrice.sedexDays !== null) {
      options.push({
        service:      'SEDEX',
        price:        round2(boxPrice.sedex * numBoxes),
        deadlineDays: boxPrice.sedexDays,
        label:        `SEDEX — até ${plural(boxPrice.sedexDays)}`,
      });
    }

    return res.status(200).json({ options, numBoxes, realWeightPerBoxKg });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao calcular frete';
    return res.status(500).json({ error: msg });
  }
}
