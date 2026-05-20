import React, { useRef, useState } from 'react';
import { X, ArrowRight, ArrowLeft, Zap, Printer, FileText, Loader } from 'lucide-react';
import { Customization, CustomizationType, ProductDef, SerigrafiaColor, SERIGRAFIA_COLORS, calcUnitPrice } from '../types';
import { ArtPreviewCanvas } from './ArtPreviewCanvas';

interface CustomizationStepProps {
  product: ProductDef;
  value: Customization;
  onChange: (c: Customization) => void;
  onBack: () => void;
  onNext: () => void;
}

const typeOptions: { key: CustomizationType; icon: React.ElementType }[] = [
  { key: 'serigrafia', icon: Printer },
  { key: 'laser', icon: Zap },
];

function removeWhiteBackground(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')!;
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px  = img.data;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    // Fully transparent: pure white / near-white
    if (r > 240 && g > 240 && b > 240) {
      px[i + 3] = 0;
    // Semi-transparent: light grays used in anti-aliasing edges
    } else if (r > 200 && g > 200 && b > 200) {
      px[i + 3] = Math.round(((255 - r) + (255 - g) + (255 - b)) / 3 * 2.5);
    }
  }
  ctx.putImageData(img, 0, 0);
}

async function renderPdfToUrl(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

  const buffer = await file.arrayBuffer();
  const pdf    = await pdfjsLib.getDocument({ data: buffer }).promise;
  const page   = await pdf.getPage(1);
  const vp     = page.getViewport({ scale: 3 });

  const canvas = document.createElement('canvas');
  canvas.width  = vp.width;
  canvas.height = vp.height;
  await page.render({ canvas, viewport: vp }).promise;
  removeWhiteBackground(canvas);
  return new Promise(res => canvas.toBlob(b => res(URL.createObjectURL(b!)), 'image/png'));
}

export const CustomizationStep: React.FC<CustomizationStepProps> = ({
  product, value, onChange, onBack, onNext,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError,   setPdfError]   = useState('');

  const handleTypeChange  = (type: CustomizationType)  => onChange({ ...value, type });
  const handleColorChange = (serigrafiaColor: SerigrafiaColor) => onChange({ ...value, serigrafiaColor });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (!isImage && !isPdf) {
      setPdfError('Formato não aceito. Use PDF, JPG, PNG ou WebP.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setPdfError('O arquivo não pode ultrapassar 20 MB.');
      return;
    }

    setPdfError('');
    setPdfLoading(true);

    try {
      if (value.artPreviewUrl) URL.revokeObjectURL(value.artPreviewUrl);
      let previewUrl: string;
      if (isPdf) {
        previewUrl = await renderPdfToUrl(file);
      } else {
        previewUrl = URL.createObjectURL(file);
      }
      onChange({ ...value, artFile: file, artPreviewUrl: previewUrl });
    } catch {
      setPdfError('Não foi possível processar o arquivo. Tente novamente.');
    } finally {
      setPdfLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveArt = () => {
    if (value.artPreviewUrl) URL.revokeObjectURL(value.artPreviewUrl);
    onChange({ ...value, artFile: null, artPreviewUrl: null });
    setPdfError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const serigrafiaHex = SERIGRAFIA_COLORS.find(c => c.key === value.serigrafiaColor)?.hex ?? '#1a1a1a';
  const canContinue   = value.artFile !== null && !pdfLoading;

  return (
    <div className="min-h-screen pt-16 bg-[#1a1917]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <button onClick={onBack} className="hover:text-[#D4AF37] transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Voltar
          </button>
          <span>/</span>
          <span className="text-white font-medium">Arte e Personalização</span>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center">✓</div>
            <span className="text-sm text-gray-500">Quantidade e Frete</span>
          </div>
          <div className="flex-1 h-0.5 bg-[#D4AF37] mx-1" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#D4AF37] text-gray-900 text-xs font-bold flex items-center justify-center">2</div>
            <span className="text-sm font-semibold text-[#D4AF37]">Arte e Personalização</span>
          </div>
          <div className="flex-1 h-0.5 bg-white/10 mx-1" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/10 text-gray-500 text-xs font-bold flex items-center justify-center">3</div>
            <span className="text-sm text-gray-500">Seus Dados</span>
          </div>
        </div>

        <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-white mb-1">
          Arte e Personalização
        </h2>
        <p className="text-gray-400 mb-8">Escolha o tipo de personalização e faça upload da sua arte</p>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* ── Left column: options ── */}
          <div className="space-y-6">
            {/* Tipo */}
            <div>
              <label className="block font-semibold text-white mb-3">Tipo de Personalização</label>
              <div className="grid grid-cols-2 gap-3">
                {typeOptions.map(({ key, icon: Icon }) => {
                  const opt      = product.customizations[key];
                  const selected = value.type === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleTypeChange(key)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selected ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-white/10 hover:border-white/20 bg-[#222019]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selected ? 'bg-[#D4AF37]' : 'bg-white/10'}`}>
                          <Icon size={20} className={selected ? 'text-gray-900' : 'text-gray-400'} />
                        </div>
                        {key === 'serigrafia' && (
                          <span className="text-[10px] font-semibold bg-amber-900/50 text-amber-400 px-2 py-0.5 rounded-full border border-amber-700/50">Mín. 25 un.</span>
                        )}
                      </div>
                      <p className="font-semibold text-white text-sm">{opt.label}</p>
                      <p className="text-gray-400 text-xs mt-1">{opt.description}</p>
                      <p className={`text-xs mt-2 font-medium ${selected ? 'text-[#F1C40F]' : 'text-gray-500'}`}>
                        R$ {calcUnitPrice(product, key).toFixed(2).replace('.', ',')} / un.
                        {opt.extraPrice === 0 && <span className="ml-1 text-green-400">(sem acréscimo)</span>}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 bg-blue-950/50 border border-blue-800/50 rounded-xl px-4 py-3 text-xs text-blue-300 leading-relaxed">
                <strong>ℹ️ Pedido mínimo:</strong> Serigrafia 1 Cor requer mínimo de <strong>25 unidades</strong>.
                Para pedidos de <strong>10 a 24 unidades</strong>, está disponível apenas a Gravação a Laser.
              </div>
            </div>

            {/* Cor da serigrafia */}
            {value.type === 'serigrafia' && (
              <div>
                <label className="block font-semibold text-white mb-3">Cor da Impressão</label>
                <div className="flex gap-3">
                  {SERIGRAFIA_COLORS.map(({ key, label, hex }) => {
                    const selected = value.serigrafiaColor === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleColorChange(key)}
                        title={label}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
                          selected ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span
                          className="w-8 h-8 rounded-full border border-white/20 block"
                          style={{ backgroundColor: hex }}
                        />
                        <span className={`text-xs font-medium ${selected ? 'text-[#D4AF37]' : 'text-gray-400'}`}>
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upload PDF */}
            <div>
              <label className="block font-semibold text-white mb-1">Sua Arte / Logo</label>
              <p className="text-gray-400 text-sm mb-3">
                Formatos aceitos: <strong className="text-gray-200">PDF, JPG, PNG, WebP</strong> (máx. 20 MB) — fundo transparente ou branco
              </p>

              {!value.artFile ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={pdfLoading}
                  className="w-full border-2 border-dashed border-white/15 hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/5 rounded-xl p-8 flex flex-col items-center gap-3 transition-colors disabled:opacity-60"
                >
                  <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center">
                    {pdfLoading
                      ? <Loader size={24} className="text-[#D4AF37] animate-spin" />
                      : <FileText size={24} className="text-[#D4AF37]" />
                    }
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-300">
                      {pdfLoading ? 'Processando arquivo…' : 'Clique para fazer upload'}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">PDF, JPG, PNG ou WebP</p>
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-3 bg-green-950/50 border border-green-800/50 rounded-xl p-4">
                  <div className="w-10 h-10 bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{value.artFile.name}</p>
                    <p className="text-gray-400 text-xs">{(value.artFile.size / 1024).toFixed(0)} KB · {value.artFile.type === 'application/pdf' ? 'PDF' : value.artFile.type.split('/')[1].toUpperCase()}</p>
                  </div>
                  <button onClick={handleRemoveArt} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                    <X size={18} />
                  </button>
                </div>
              )}

              {pdfError && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                  <X size={14} /> {pdfError}
                </p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf,image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl p-4 text-sm text-gray-300">
              <strong className="text-[#D4AF37]">📝 Dica:</strong> Nossa equipe revisará sua arte antes da produção e entrará em contato se houver ajustes necessários.
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-6 py-3 border border-white/15 rounded-xl text-gray-300 font-medium hover:bg-white/5 transition-colors"
              >
                <ArrowLeft size={16} /> Voltar
              </button>
              <button
                onClick={onNext}
                disabled={!canContinue}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-base transition-all ${
                  canContinue
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#d49924] hover:from-[#d49924] hover:to-[#c28511] text-gray-900 hover:shadow-lg hover:shadow-[#D4AF37]/30'
                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continuar — Dados do Pedido
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* ── Right column: preview ── */}
          <div className="flex flex-col items-center gap-4">
            <p className="font-semibold text-white text-sm">Preview da Arte no Copo</p>
            <div className={product.image === '/CopoPreview475.webp' ? 'w-[150px]' : 'w-full flex justify-center'}>
              <ArtPreviewCanvas
                artUrl={value.artPreviewUrl}
                cupImageUrl={product.image}
                customizationType={value.type}
                serigrafiaColorHex={serigrafiaHex}
              />
            </div>
            {value.artPreviewUrl && (
              <p className="text-xs text-gray-400 text-center">
                Preview ilustrativo · cor aplicada: <strong>{SERIGRAFIA_COLORS.find(c => c.key === value.serigrafiaColor)?.label}</strong>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
