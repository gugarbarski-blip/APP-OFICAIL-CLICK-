import React from 'react';
import { Gift, Instagram, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary p-1.5 rounded-lg">
                <Gift size={18} className="text-white" />
              </div>
              <span className="font-poppins font-bold text-lg text-white">
                Click<span className="text-primary">Brindes</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Brindes personalizados de alta qualidade para fortalecer a identidade da sua empresa.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Navegação</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Produto', href: '#produto' },
                { label: 'Como Funciona', href: '#como-funciona' },
                { label: 'Diferenciais', href: '#diferenciais' },
              ].map(link => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Contato</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-primary flex-shrink-0" />
                contato@clickbrindes.com.br
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-primary flex-shrink-0" />
                (11) 99999-9999
              </li>
              <li className="flex items-center gap-2">
                <Instagram size={14} className="text-primary flex-shrink-0" />
                @clickbrindes
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-xs">
          © {year} Click Brindes. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};
