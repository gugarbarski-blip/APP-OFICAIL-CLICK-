import React from 'react';
import { Instagram, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-[0_2px_8px_rgba(212,175,55,0.4)] bg-[#514F4A] flex items-center justify-center">
                <img 
                  src="/Logo.pjg.png" 
                  alt="ImpreBrindes Logo"
                  className="w-[115%] h-[115%] max-w-none object-cover" 
                />
              </div>
              <span className="font-poppins font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F1C40F]">
                ImpreBrindes
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
                { label: 'Produtos', href: '#produto' },
                { label: 'Como Funciona', href: '#como-funciona' },
                { label: 'Diferenciais', href: '#diferenciais' },
              ].map(link => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-[#F1C40F] transition-colors">
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
                <Mail size={14} className="text-[#D4AF37] flex-shrink-0" />
                contato@imprebrindes.com.br
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-[#D4AF37] flex-shrink-0" />
                (11) 99999-9999
              </li>
              <li className="flex items-center gap-2">
                <Instagram size={14} className="text-[#D4AF37] flex-shrink-0" />
                @imprebrindes
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-xs">
          © {year} ImpreBrindes. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};
