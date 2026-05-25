import { Address } from '../types';

export async function lookupCEP(cep: string): Promise<Omit<Address, 'cep' | 'number' | 'complement'>> {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length !== 8) throw new Error('CEP inválido');

  // Tenta ViaCEP primeiro
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
    if (res.ok) {
      const data = await res.json();
      if (!data.erro) {
        return {
          street: data.logradouro ?? '',
          neighborhood: data.bairro ?? '',
          city: data.localidade ?? '',
          state: data.uf ?? '',
        };
      }
    }
  } catch (e) {
    console.warn('[CEP] ViaCEP falhou, tentando BrasilAPI:', e);
  }

  // Fallback: BrasilAPI
  const res2 = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleaned}`);
  if (!res2.ok) throw new Error('CEP não encontrado');
  const data2 = await res2.json();

  return {
    street: data2.street ?? '',
    neighborhood: data2.neighborhood ?? '',
    city: data2.city ?? '',
    state: data2.state ?? '',
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
