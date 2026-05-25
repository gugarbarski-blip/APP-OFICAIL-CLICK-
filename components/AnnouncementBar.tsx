import React from 'react';
import { Trophy, Zap, Truck, BookOpen, ShoppingBag } from 'lucide-react';

const BASE_ITEMS = [
  { icon: Zap,        text: 'Copos Térmicos a partir de R$ 23,00/un.' },
  { icon: ShoppingBag,text: 'Ecobag Algodão a partir de R$ 11,00/un.' },
  { icon: BookOpen,   text: 'Caderneta Moleskine a partir de R$ 24,00/un.' },
  { icon: Trophy,     text: 'Qualidade premium com o melhor preço' },
  { icon: Truck,      text: 'Entrega para todo o Brasil' },
];

const items = [...BASE_ITEMS, ...BASE_ITEMS];

export const AnnouncementBar: React.FC = () => (
  <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-[#D4AF37] via-[#F1C40F] to-[#D4AF37] overflow-hidden h-8 flex items-center">
    <style>{`
      @keyframes marquee {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .marquee-track {
        display: flex;
        width: max-content;
        animation: marquee 22s linear infinite;
      }
      .marquee-track:hover {
        animation-play-state: paused;
      }
    `}</style>
    <div className="marquee-track">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <div key={i} className="flex items-center gap-2 px-8 text-gray-900 whitespace-nowrap">
            <Icon size={13} className="flex-shrink-0" />
            <span className="text-xs font-bold tracking-wide">{item.text}</span>
            <span className="text-gray-700 mx-2">·</span>
          </div>
        );
      })}
    </div>
  </div>
);
