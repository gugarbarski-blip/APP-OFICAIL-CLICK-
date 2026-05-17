import React from 'react';
import { Trophy, Zap, Truck } from 'lucide-react';

const items = [
  { icon: Trophy, text: 'Um dos menores preços do Brasil' },
  { icon: Zap,    text: 'Copo Térmico 475ml a partir de R$ 23,00/un.' },
  { icon: Truck,  text: 'Entrega para todo o Brasil' },
  { icon: Trophy, text: 'Um dos menores preços do Brasil' },
  { icon: Zap,    text: 'Copo Térmico 475ml a partir de R$ 23,00/un.' },
  { icon: Truck,  text: 'Entrega para todo o Brasil' },
];

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
