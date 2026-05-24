import { ShippingOption } from '../types';

const REGION_CONFIG: Record<string, { region: string; minDays: number; maxDays: number }> = {
  RS: { region: 'Sul',          minDays: 3,  maxDays: 5  },
  SC: { region: 'Sul',          minDays: 3,  maxDays: 5  },
  PR: { region: 'Sul',          minDays: 3,  maxDays: 5  },
  SP: { region: 'Sudeste',      minDays: 5,  maxDays: 8  },
  RJ: { region: 'Sudeste',      minDays: 5,  maxDays: 8  },
  MG: { region: 'Sudeste',      minDays: 5,  maxDays: 8  },
  ES: { region: 'Sudeste',      minDays: 5,  maxDays: 8  },
  DF: { region: 'Centro-Oeste', minDays: 8,  maxDays: 12 },
  GO: { region: 'Centro-Oeste', minDays: 8,  maxDays: 12 },
  MT: { region: 'Centro-Oeste', minDays: 8,  maxDays: 12 },
  MS: { region: 'Centro-Oeste', minDays: 8,  maxDays: 12 },
  BA: { region: 'Nordeste',     minDays: 12, maxDays: 18 },
  SE: { region: 'Nordeste',     minDays: 12, maxDays: 18 },
  AL: { region: 'Nordeste',     minDays: 12, maxDays: 18 },
  PE: { region: 'Nordeste',     minDays: 12, maxDays: 18 },
  PB: { region: 'Nordeste',     minDays: 12, maxDays: 18 },
  RN: { region: 'Nordeste',     minDays: 12, maxDays: 18 },
  CE: { region: 'Nordeste',     minDays: 12, maxDays: 18 },
  PI: { region: 'Nordeste',     minDays: 12, maxDays: 18 },
  MA: { region: 'Nordeste',     minDays: 12, maxDays: 18 },
  PA: { region: 'Norte',        minDays: 15, maxDays: 22 },
  AP: { region: 'Norte',        minDays: 15, maxDays: 22 },
  AM: { region: 'Norte',        minDays: 15, maxDays: 22 },
  RR: { region: 'Norte',        minDays: 15, maxDays: 22 },
  AC: { region: 'Norte',        minDays: 15, maxDays: 22 },
  RO: { region: 'Norte',        minDays: 15, maxDays: 22 },
  TO: { region: 'Norte',        minDays: 15, maxDays: 22 },
};

export function calcularFrete(orderValue: number, uf?: string): ShippingOption {
  const pct   = orderValue >= 1000 ? 0.07 : 0.10;
  const price = parseFloat((orderValue * pct).toFixed(2));

  const info    = uf ? REGION_CONFIG[uf.toUpperCase()] : null;
  const minDays = info?.minDays ?? 10;
  const maxDays = info?.maxDays ?? 18;
  const region  = info?.region  ?? 'Brasil';

  return {
    service:     'Transportadora',
    price,
    deadlineDays: maxDays,
    label:        `Transportadora — ${region} · ${minDays}–${maxDays} dias úteis`,
    company:      'Transportadora',
  };
}
