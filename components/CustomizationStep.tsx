import React, { useRef } from 'react';
import { Upload, X, ArrowRight, ArrowLeft, Zap, Printer } from 'lucide-react';
import { Customization, CustomizationType, ProductDef, calcUnitPrice } from '../types';
import { ArtPreviewCanvas } from './ArtPreviewCanvas';

interface CustomizationStepProps {
  product: ProductDef;
  value: Customization;
  onChange: (v: Customization) => void;
  onBack: () => void;
  onNext: () => void;
}

const typeOptions: { key: CustomizationType; icon: React.FC<{ size: number; className?: string }>; }[] = [
  { key: 'serigrafia', icon: Printer },
  { key: 'laser', icon: Zap },
];

export const CustomizationStep: React.FC<CustomizationStepProps> = ({ product, value, onChange, onBack, onNext }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTypeChange = (type: CustomizationType) => onChange({ ...value, type });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (value.artPreviewUrl) URL.revokeObjectURL(value.artPreviewUrl);
    onChange({ ...value, artFile: file, artPreviewUrl: url });
  };

  const handleRemoveArt = () => {
    if (value.artPreviewUrl) URL.revokeObjectURL(value.artPreviewUrl);
    onChange({ ...value, artFile: null, artPreviewUrl: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const canContinue = value.artFile !== null;

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <button onClick={onBack} className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft size={14} />
            Voltar
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Personalização</span>
        </div>

        <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Personalize seu {product.name}</h2>
        <p className="text-gray-500 mb-8">Escolha o tipo de personalização e faça upload da sua arte</p>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div className="space-y-6">
            <div>
              <label className="block font-semibold text-gray-900 mb-3">Tipo de Personalização</label>
              <div className="grid grid-cols-2 gap-3">
                {typeOptions.map(({ key, icon: Icon }) => {
                  const opt = product.customizations[key];
                  const selected = value.type === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleTypeChange(key)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center ${selected ? 'bg-primary' : 'bg-gray-100'}`}>
                        <Icon size={20} className={selected ? 'text-white' : 'text-gray-500'} />
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{opt.label}</p>
                      <p className="text-gray-500 text-xs mt-1">{opt.description}</p>
                      <p className={`text-xs mt-2 font-medium ${selected ? 'text-primary' : 'text-gray-400'}`}>
                        R$ {calcUnitPrice(product, key).toFixed(2).replace('.', ',')} / un.
                        {opt.extraPrice === 0 && <span className="ml-1 text-green-600">(sem acréscimo)</span>}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-900 mb-1">Sua Arte / Logo</label>
              <p className="text-gray-500 text-sm mb-3">Formatos aceitos: PNG, JPG, PDF, AI (máx. 10MB)</p>
              {!value.artFile ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 rounded-xl p-8 flex flex-col items-center gap-3 transition-colors"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Upload size={24} className="text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-700">Clique para fazer upload</p>
                    <p className="text-gray-400 text-sm mt-1">ou arraste o arquivo aqui</p>
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Upload size={18} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{value.artFile.name}</p>
                    <p className="text-gray-500 text-xs">{(value.artFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button onClick={handleRemoveArt} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                    <X size={18} />
                  </button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg,.pdf,.ai,.svg" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-sm text-gray-700">
              <strong className="text-accent">📝 Dica:</strong> Nossa equipe revisará sua arte antes da produção e entrará em contato se houver ajustes necessários.
            </div>

            <div className="flex gap-3">
              <button onClick={onBack} className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                <ArrowLeft size={16} />
                Voltar
              </button>
              <button
                onClick={onNext}
                disabled={!canContinue}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-base transition-all ${
                  canContinue ? 'bg-primary hover:bg-primaryDark text-white hover:shadow-lg hover:shadow-primary/30' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continuar para o Pedido
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <p className="font-semibold text-gray-900 text-sm">Preview da Arte no Copo</p>
            <ArtPreviewCanvas artUrl={value.artPreviewUrl} cupImageUrl={product.image} />
            {value.artPreviewUrl && (
              <p className="text-xs text-gray-400 text-center">Preview ilustrativo. Arte final pode variar levemente.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
