
import React, { useState, useRef } from 'react';
import { BillInputs } from '../types';
import { extractDataFromImage } from '../services/geminiService';
import { Zap, Calculator, ShieldCheck, MousePointer2, FileUp, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface Props {
  onSubmit: (data: BillInputs) => void;
  isLoading: boolean;
}

const ReportForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [isDataReviewing, setIsDataReviewing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<BillInputs>({
    nome: '',
    uc: '',
    distribuidora: 'ENEL',
    mes_ref: '',
    tipo_ligacao: 'mono',
    consumo_total_kwh: 0,
    tarifa_te: 0,
    tarifa_tusd: 0,
    tarifa_bandeira_amarela: 0,
    tarifa_bandeira_vermelha: 0,
    iluminacao_publica: 0,
    outros_itens_texto: ''
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setExtractError(null);
    setIsDataReviewing(false);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const extracted = await extractDataFromImage(base64, file.type);
          
          if (extracted) {
            setFormData(prev => ({
              ...prev,
              ...extracted,
              consumo_total_kwh: Number(extracted.consumo_total_kwh) || 0,
              tarifa_te: Number(extracted.tarifa_te) || 0,
              tarifa_tusd: Number(extracted.tarifa_tusd) || 0,
              tarifa_bandeira_amarela: Number(extracted.tarifa_bandeira_amarela) || 0,
              tarifa_bandeira_vermelha: Number(extracted.tarifa_bandeira_vermelha) || 0,
              iluminacao_publica: Number(extracted.iluminacao_publica) || 0,
            }));
            setIsDataReviewing(true);
          }
        } catch (err) {
          setExtractError("Não conseguimos ler os dados automaticamente. Por favor, preencha manualmente.");
        } finally {
          setIsExtracting(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setExtractError("Erro ao processar arquivo.");
      setIsExtracting(false);
    }
  };

  const loadExampleData = () => {
    // Gerando dados aleatórios para privacidade e demonstração dinâmica
    const randomId = Math.floor(Math.random() * 9000) + 1000;
    const randomUC = Math.floor(Math.random() * 8999999) + 1000000;
    const randomConsumo = Math.floor(Math.random() * 450) + 150;
    const now = new Date();
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    
    setFormData({
      nome: `ASSOCIADO EXEMPLO ${randomId}`,
      uc: randomUC.toString(),
      distribuidora: 'ENEL',
      mes_ref: `${currentMonth}/${now.getFullYear()}`,
      tipo_ligacao: (['mono', 'bi', 'tri'] as const)[Math.floor(Math.random() * 3)],
      consumo_total_kwh: randomConsumo,
      tarifa_te: parseFloat((0.32 + Math.random() * 0.05).toFixed(5)),
      tarifa_tusd: parseFloat((0.61 + Math.random() * 0.05).toFixed(5)),
      tarifa_bandeira_amarela: 0.02165,
      tarifa_bandeira_vermelha: 0,
      iluminacao_publica: parseFloat((18 + Math.random() * 15).toFixed(2)),
      outros_itens_texto: ''
    });
    setIsDataReviewing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const inputClass = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-800 placeholder:text-slate-400 shadow-sm font-normal text-base md:text-sm";
  const labelClass = "block text-[10px] md:text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-widest";

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      <div className="bg-emerald-600 p-5 md:p-6 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-xl">
            <Calculator className="w-5 h-5" />
          </div>
          <h2 className="text-lg md:text-xl font-black uppercase tracking-tight">Simulador</h2>
        </div>
        <button 
          type="button"
          onClick={loadExampleData}
          className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase py-2.5 px-4 rounded-xl border border-white/20 transition-all flex items-center gap-2 active:scale-95"
        >
          <MousePointer2 className="w-3 h-3" /> Exemplo
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-10">
        
        {/* Banner de Instrução/Aviso */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-start gap-4">
          <div className="bg-emerald-100 p-2 rounded-lg shrink-0">
            <Info className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-1">Dica de Especialista</p>
            <p className="text-sm text-slate-600 leading-snug">
              Clique em <strong>“Escolher uma foto”</strong>, anexe a fatura e revise os dados preenchidos automaticamente pela IA.
            </p>
          </div>
        </div>

        {/* Upload Integrado - Destaque */}
        <div className="no-print">
          <div 
            onClick={triggerFileUpload}
            className={`flex flex-col items-center justify-center p-8 md:p-12 bg-emerald-50/50 rounded-3xl border-2 border-dashed transition-all cursor-pointer group hover:bg-emerald-50 hover:border-emerald-300 ${
              isExtracting ? 'border-emerald-500 ring-4 ring-emerald-100' : 'border-emerald-200'
            }`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
              isExtracting ? 'bg-emerald-600 shadow-xl' : 'bg-white shadow-md'
            }`}>
              {isExtracting ? (
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileUp className={`w-7 h-7 ${isDataReviewing ? 'text-emerald-600' : 'text-slate-400'}`} />
              )}
            </div>

            <div className="text-center">
              <h3 className="text-slate-900 font-black text-lg uppercase tracking-tight mb-1">
                {isExtracting ? 'Lendo sua fatura...' : 'Escolher uma foto'}
              </h3>
              <p className="text-slate-500 text-xs font-medium">
                {isExtracting 
                  ? 'Aguarde um instante enquanto processamos os dados.' 
                  : 'Arraste ou clique para anexar a imagem da fatura.'}
              </p>
            </div>
          </div>
          
          {extractError && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3 text-amber-800 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {extractError}
            </div>
          )}

          {isDataReviewing && !isExtracting && (
            <div className="mt-4 p-4 bg-emerald-600 text-white rounded-xl flex items-center gap-3 shadow-lg animate-bounce-short">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p className="text-sm font-bold">Dados extraídos com sucesso! Revise os campos abaixo antes de continuar.</p>
            </div>
          )}
        </div>

        {/* Identificação */}
        <section className={`space-y-6 transition-opacity duration-500 ${isExtracting ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Identificação do Associado</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className={isDataReviewing ? "ring-2 ring-emerald-500/10 rounded-xl" : ""}>
              <label className={labelClass}>Nome Completo:</label>
              <input required name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: João Silva" className={`${inputClass} ${isDataReviewing ? 'border-emerald-200' : ''}`} />
            </div>
            <div className={isDataReviewing ? "ring-2 ring-emerald-500/10 rounded-xl" : ""}>
              <label className={labelClass}>Unidade Consumidora (UC):</label>
              <input required name="uc" value={formData.uc} onChange={handleChange} placeholder="0000000" className={`${inputClass} ${isDataReviewing ? 'border-emerald-200' : ''}`} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Distribuidora:</label>
              <input required name="distribuidora" value={formData.distribuidora} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Mês de Referência:</label>
              <input required name="mes_ref" value={formData.mes_ref} onChange={handleChange} placeholder="MM/AAAA" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tipo de Ligação:</label>
              <select name="tipo_ligacao" value={formData.tipo_ligacao} onChange={handleChange} className={inputClass}>
                <option value="mono">Monofásica (Mín. 30kWh)</option>
                <option value="bi">Bifásica (Mín. 50kWh)</option>
                <option value="tri">Trifásica (Mín. 100kWh)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Consumo e Tarifas */}
        <section className={`space-y-8 transition-opacity duration-500 ${isExtracting ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <Zap className="w-4 h-4 text-emerald-500" />
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Consumo e Tarifas Técnicas</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={isDataReviewing ? "ring-2 ring-emerald-500/10 rounded-xl" : ""}>
              <label className={labelClass}>Consumo Total (kWh):</label>
              <input required type="number" step="0.01" name="consumo_total_kwh" value={formData.consumo_total_kwh || ''} onChange={handleChange} className={`${inputClass} font-bold text-emerald-700`} />
            </div>
            <div>
              <label className={labelClass}>Tarifa TE (R$/kWh):</label>
              <input required type="number" step="0.00001" name="tarifa_te" value={formData.tarifa_te || ''} onChange={handleChange} placeholder="0,00000" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tarifa TUSD (R$/kWh):</label>
              <input required type="number" step="0.00001" name="tarifa_tusd" value={formData.tarifa_tusd || ''} onChange={handleChange} placeholder="0,00000" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Bandeira Amarela:</label>
              <input type="number" step="0.00001" name="tarifa_bandeira_amarela" value={formData.tarifa_bandeira_amarela || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Bandeira Vermelha:</label>
              <input type="number" step="0.00001" name="tarifa_bandeira_vermelha" value={formData.tarifa_bandeira_vermelha || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Iluminação Pública (R$):</label>
              <input type="number" step="0.01" name="iluminacao_publica" value={formData.iluminacao_publica || ''} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </section>

        <section className={`space-y-4 transition-opacity duration-500 ${isExtracting ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
          <label className={labelClass}>Ajustes Finais ou Outros Encargos:</label>
          <textarea
            name="outros_itens_texto"
            value={formData.outros_itens_texto}
            onChange={handleChange}
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Ex: Multas, juros de atraso ou descontos comerciais..."
          />
        </section>

        <button
          type="submit"
          disabled={isLoading || isExtracting}
          className={`w-full py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${
            isLoading || isExtracting
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
              : isDataReviewing 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-200 ring-4 ring-emerald-100'
                : 'bg-slate-900 hover:bg-black text-white shadow-xl active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-3 border-slate-300 border-t-emerald-600 rounded-full animate-spin"></div>
          ) : (
            <>
              {isDataReviewing ? <CheckCircle2 className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              {isDataReviewing ? 'Confirmar Dados e Gerar Relatório' : 'Gerar Relatório Completo'}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReportForm;
