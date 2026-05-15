import { ShippingOption } from '../types';

export async function calcularFrete(
  cepDestino: string,
  quantity: number,
  productId: string
): Promise<ShippingOption[]> {
  const res = await fetch('/api/shipping', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cepDestino, quantity, productId }),
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error ?? 'Erro ao calcular frete');
  }

  const data = await res.json();
  return data.options as ShippingOption[];
}
