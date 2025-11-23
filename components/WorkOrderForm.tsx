import React, { useState, useEffect } from 'react';
import { WorkOrder, WorkOrderFormData } from '../types';
import { Button } from './Button';
import { Input, Select } from './Input';
import { X } from 'lucide-react';

interface WorkOrderFormProps {
  initialData?: WorkOrder;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorkOrderFormData) => Promise<void>;
}

export const WorkOrderForm: React.FC<WorkOrderFormProps> = ({ 
  initialData, 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<WorkOrderFormData>({
    numeroOs: '',
    loja: '',
    vendedor: '',
    prazoLimite: '',
    metodoEntrega: 'Retirar na Sede'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      const { id, concluida, createdAt, ...rest } = initialData;
      setFormData(rest);
    } else {
      setFormData({
        numeroOs: '',
        loja: '',
        vendedor: '',
        prazoLimite: '',
        metodoEntrega: 'Retirar na Sede'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error saving OS:", error);
      alert("Erro ao salvar. Verifique o console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            {initialData ? 'Editar OS' : 'Nova Ordem de Serviço'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <Input
              label="Número da OS"
              name="numeroOs"
              value={formData.numeroOs}
              onChange={handleChange}
              placeholder="Ex: 10245"
              required
            />
            
            <Input
              label="Loja"
              name="loja"
              value={formData.loja}
              onChange={handleChange}
              placeholder="Ex: Filial Centro"
              required
            />

            <Input
              label="Vendedor"
              name="vendedor"
              value={formData.vendedor}
              onChange={handleChange}
              placeholder="Nome do vendedor"
              required
            />

            <Input
              label="Prazo Limite"
              type="date"
              name="prazoLimite"
              value={formData.prazoLimite}
              onChange={handleChange}
              required
            />

            <Select
              label="Método de Entrega"
              name="metodoEntrega"
              value={formData.metodoEntrega}
              onChange={handleChange}
              options={[
                { value: 'Retirar na Sede', label: 'Retirar na Sede' },
                { value: 'Entrega na Loja', label: 'Entrega na Loja' }
              ]}
            />
          </div>

          <div className="mt-6 flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar OS'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
