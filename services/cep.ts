import { Address } from '../types';

export async function lookupCEP(cep: string): Promise<Omit<Address, 'cep' | 'number' | 'complement'>> {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length !== 8) throw new Error('CEP inválido');

  const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
  if (!res.ok) throw new Error('Erro ao buscar CEP');

  const data = await res.json();
  if (data.erro) throw new Error('CEP não encontrado');

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
