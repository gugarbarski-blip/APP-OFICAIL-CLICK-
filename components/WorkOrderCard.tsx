import React from 'react';
import { WorkOrder } from '../types';
import { Calendar, User, Store, Truck, CheckCircle, Circle, Edit2, Trash2 } from 'lucide-react';
import { Button } from './Button';

interface WorkOrderCardProps {
  order: WorkOrder;
  onEdit: (order: WorkOrder) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (order: WorkOrder) => void;
}

export const WorkOrderCard: React.FC<WorkOrderCardProps> = ({ 
  order, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}) => {
  // Logic to determine urgency status
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = order.prazoLimite < today;
  const isDueToday = order.prazoLimite === today;

  // Visual classes based on status
  const cardBorderClass = order.concluida
    ? 'border-gray-200 bg-gray-50 opacity-75'
    : isOverdue
    ? 'border-l-4 border-l-red-500 border-y border-r border-gray-200 bg-white'
    : isDueToday
    ? 'border-l-4 border-l-orange-400 border-y border-r border-gray-200 bg-white'
    : 'border-l-4 border-l-blue-500 border-y border-r border-gray-200 bg-white';

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className={`rounded-lg shadow-sm p-4 transition-all hover:shadow-md ${cardBorderClass}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${order.concluida ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              #{order.numeroOs}
            </span>
            {isOverdue && !order.concluida && (
              <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded">
                Atrasada
              </span>
            )}
             {isDueToday && !order.concluida && (
              <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                Hoje
              </span>
            )}
          </div>
          <h3 className={`text-lg font-bold mt-1 ${order.concluida ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {order.loja}
          </h3>
        </div>
        
        <button 
          onClick={() => onToggleStatus(order)}
          className={`focus:outline-none transition-colors ${order.concluida ? 'text-green-600 hover:text-green-700' : 'text-gray-300 hover:text-green-600'}`}
          title={order.concluida ? "Marcar como pendente" : "Marcar como concluída"}
        >
          {order.concluida ? <CheckCircle size={28} /> : <Circle size={28} />}
        </button>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <User size={16} className="text-gray-400" />
          <span>Vendedor: <span className="font-medium text-gray-800">{order.vendedor}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className={isOverdue && !order.concluida ? 'text-red-500' : 'text-gray-400'} />
          <span className={isOverdue && !order.concluida ? 'text-red-600 font-bold' : ''}>
            Prazo: {formatDate(order.prazoLimite)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Truck size={16} className="text-gray-400" />
          <span>{order.metodoEntrega}</span>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-3 border-t border-gray-100">
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEdit(order)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Edit2 size={16} className="mr-1" /> Editar
        </Button>
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
                if(window.confirm('Tem certeza que deseja excluir esta OS?')) {
                    onDelete(order.id);
                }
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 size={16} className="mr-1" /> Excluir
        </Button>
      </div>
    </div>
  );
};
