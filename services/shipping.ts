import { ShippingOption } from '../types';

const REGION_CONFIG: Record<string, { region: string; minDays: number; maxDays: number }> = {
  RS: { region: 'Sul',          minDays: 2,  maxDays: 4  },
  SC: { region: 'Sul',          minDays: 2,  maxDays: 4  },
  PR: { region: 'Sul',          minDays: 2,  maxDays: 4  },
  SP: { region: 'Sudeste',      minDays: 3,  maxDays: 5  },
  RJ: { region: 'Sudeste',      minDays: 3,  maxDays: 5  },
  MG: { region: 'Sudeste',      minDays: 3,  maxDays: 5  },
  ES: { region: 'Sudeste',      minDays: 3,  maxDays: 5  },
  DF: { region: 'Centro-Oeste', minDays: 4,  maxDays: 8  },
  GO: { region: 'Centro-Oeste', minDays: 4,  maxDays: 8  },
  MT: { region: 'Centro-Oeste', minDays: 4,  maxDays: 8  },
  MS: { region: 'Centro-Oeste', minDays: 4,  maxDays: 8  },
  BA: { region: 'Nordeste',     minDays: 8,  maxDays: 12 },
  SE: { region: 'Nordeste',     minDays: 8,  maxDays: 12 },
  AL: { region: 'Nordeste',     minDays: 8,  maxDays: 12 },
  PE: { region: 'Nordeste',     minDays: 8,  maxDays: 12 },
  PB: { region: 'Nordeste',     minDays: 8,  maxDays: 12 },
  RN: { region: 'Nordeste',     minDays: 8,  maxDays: 12 },
  CE: { region: 'Nordeste',     minDays: 8,  maxDays: 12 },
  PI: { region: 'Nordeste',     minDays: 8,  maxDays: 12 },
  MA: { region: 'Nordeste',     minDays: 8,  maxDays: 12 },
  PA: { region: 'Norte',        minDays: 14, maxDays: 20 },
  AP: { region: 'Norte',        minDays: 14, maxDays: 20 },
  AM: { region: 'Norte',        minDays: 14, maxDays: 20 },
  RR: { region: 'Norte',        minDays: 14, maxDays: 20 },
  AC: { region: 'Norte',        minDays: 14, maxDays: 20 },
  RO: { region: 'Norte',        minDays: 14, maxDays: 20 },
  TO: { region: 'Norte',        minDays: 14, maxDays: 20 },
};

export function calcularFrete(orderValue: number, uf?: string): ShippingOption {
  const pct   = orderValue >= 1000 ? 0.07 : 0.10;
  const price = parseFloat((orderValue * pct).toFixed(2));

  const info    = uf ? REGION_CONFIG[uf.toUpperCase()] : null;
  const minDays = info?.minDays ?? 10;
  const maxDays = info?.maxDays ?? 18;
  const region  = info?.region  ?? 'Brasil';

  return {
    service:     'Frete',
    price,
    deadlineDays: maxDays,
    label:        `Frete — 3 dias produção + ${minDays}–${maxDays} dias entrega`,
    company:      'Frete',
  };
}
