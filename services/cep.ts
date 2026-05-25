import { Address } from '../types';

type CepResult = Omit<Address, 'cep' | 'number' | 'complement'>;

async function fromViaCEP(cleaned: string): Promise<CepResult> {
  const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
  if (!res.ok) throw new Error('viacep_error');
  const data = await res.json();
  if (data.erro) throw new Error('viacep_not_found');
  return {
    street: data.logradouro ?? '',
    neighborhood: data.bairro ?? '',
    city: data.localidade ?? '',
    state: data.uf ?? '',
  };
}

async function fromBrasilAPI(cleaned: string): Promise<CepResult> {
  const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleaned}`);
  if (!res.ok) throw new Error('brasilapi_error');
  const data = await res.json();
  if (!data.state) throw new Error('brasilapi_not_found');
  return {
    street: data.street ?? '',
    neighborhood: data.neighborhood ?? '',
    city: data.city ?? '',
    state: data.state ?? '',
  };
}

export async function lookupCEP(cep: string): Promise<CepResult> {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length !== 8) throw new Error('CEP inválido');

  try {
    return await fromViaCEP(cleaned);
  } catch {
    try {
      return await fromBrasilAPI(cleaned);
    } catch {
      throw new Error('CEP não encontrado');
    }
  }
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
