import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  const updated = '15 de maio de 2025';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-8 text-gray-700 text-sm leading-relaxed">
          <div>
            <h1 className="font-poppins text-2xl font-bold text-gray-900 mb-1">Política de Privacidade</h1>
            <p className="text-gray-400 text-xs">Última atualização: {updated}</p>
          </div>

          <p>
            A <strong>ImpreBrindes</strong> respeita sua privacidade e está comprometida com a proteção dos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
          </p>

          <Section title="1. Quais dados coletamos">
            <p>Coletamos apenas os dados necessários para processar seu pedido:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-gray-600">
              <li>Nome completo</li>
              <li>Endereço de e-mail</li>
              <li>Telefone</li>
              <li>Endereço de entrega (CEP, rua, número, complemento, cidade, estado)</li>
              <li>Dados do pagamento (processados diretamente pelo Mercado Pago — não armazenamos dados de cartão)</li>
              <li>Arquivos de arte enviados para personalização</li>
            </ul>
          </Section>

          <Section title="2. Como usamos seus dados">
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Processar e entregar seu pedido</li>
              <li>Enviar confirmações e atualizações de status por e-mail</li>
              <li>Entrar em contato para aprovação da arte antes da produção</li>
              <li>Cumprir obrigações legais e fiscais</li>
            </ul>
            <p className="mt-2">Não utilizamos seus dados para fins de marketing sem seu consentimento expresso.</p>
          </Section>

          <Section title="3. Compartilhamento de dados">
            <p>Seus dados são compartilhados apenas com terceiros essenciais para a prestação do serviço:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-gray-600">
              <li><strong>Mercado Pago</strong> — processamento de pagamento</li>
              <li><strong>Correios / transportadoras</strong> — entrega do pedido</li>
              <li><strong>Supabase</strong> — armazenamento seguro dos dados do pedido</li>
            </ul>
            <p className="mt-2">Nunca vendemos ou cedemos seus dados a terceiros para fins comerciais.</p>
          </Section>

          <Section title="4. Por quanto tempo armazenamos seus dados">
            <p>
              Mantemos seus dados pelo prazo necessário para cumprir obrigações legais e fiscais (mínimo de 5 anos conforme legislação tributária brasileira) ou enquanto necessário para a prestação do serviço.
            </p>
          </Section>

          <Section title="5. Seus direitos (LGPD)">
            <p>Você tem direito a:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-gray-600">
              <li>Confirmar a existência de tratamento dos seus dados</li>
              <li>Acessar seus dados</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários</li>
              <li>Revogar o consentimento a qualquer momento</li>
            </ul>
            <p className="mt-2">
              Para exercer qualquer um desses direitos, entre em contato pelo e-mail{' '}
              <a href="mailto:contato@imprebrindes.com.br" className="text-primary underline">
                contato@imprebrindes.com.br
              </a>.
            </p>
          </Section>

          <Section title="6. Segurança">
            <p>
              Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição. O tráfego de dados é criptografado via HTTPS e os pagamentos são processados em ambiente seguro pelo Mercado Pago.
            </p>
          </Section>

          <Section title="7. Cookies">
            <p>
              Este site não utiliza cookies de rastreamento ou publicidade. Utilizamos apenas dados essenciais para o funcionamento do serviço (ex: sessão de navegação).
            </p>
          </Section>

          <Section title="8. Contato">
            <p>
              Dúvidas sobre esta política? Entre em contato:<br />
              <strong>ImpreBrindes</strong><br />
              E-mail: <a href="mailto:contato@imprebrindes.com.br" className="text-primary underline">contato@imprebrindes.com.br</a>
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h2 className="font-poppins font-semibold text-gray-900 text-base mb-2">{title}</h2>
    {children}
  </div>
);
