import { Address } from '../types';

export async function lookupCEP(cep: string): Promise<Omit<Address, 'cep' | 'number' | 'complement'>> {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length !== 8) throw new Error('CEP inválido');

  let res: Response;
  try {
    res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
  } catch (e) {
    console.error('[CEP] fetch falhou (rede/CORS):', e);
    throw new Error('NETWORK');
  }
  if (!res.ok) throw new Error('NETWORK');

  const data = await res.json();
  console.log('[CEP] resposta ViaCEP:', data);
  if (data.erro) throw new Error('NOT_FOUND');

  return {
    street: data.logradouro ?? '',
    neighborhood: data.bairro ?? '',
    city: data.localidade ?? '',
    state: data.uf ?? '',
  };
}

export function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length > 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length > 6) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  if (digits.length > 2) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return digits;
}
