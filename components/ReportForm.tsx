
import React, { useState } from 'react';
import { BillInputs } from '../types';
import { extractDataFromImage } from '../services/geminiService';
import { Zap, Calculator, ShieldCheck, MousePointer2, FileUp, CheckCircle2 } from 'lucide-react';

interface Props {
  onSubmit: (data: BillInputs) => void;
  isLoading: boolean;
}

const ReportForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
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

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
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
        }
        setIsExtracting(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Erro no upload:", err);
      setExtractError("Falha na leitura. Tente manual.");
      setIsExtracting(false);
    }
  };

  const loadExampleData = () => {
    setFormData({
      nome: 'Francinete Ferreira',
      uc: '5121900',
      distribuidora: 'ENEL',
      mes_ref: '12/2025',
      tipo_ligacao: 'mono',
      consumo_total_kwh: 188,
      tarifa_te: 0.32766,
      tarifa_tusd: 0.62154,
      tarifa_bandeira_amarela: 0.02165,
      tarifa_bandeira_vermelha: 0.00782,
      iluminacao_publica: 24.39,
      outros_itens_texto: ''
    });
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
        {/* Identificação */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Identificação</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Nome do Associado:</label>
              <input required name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: João Silva" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Número da UC:</label>
              <input required name="uc" value={formData.uc} onChange={handleChange} placeholder="0000000" className={inputClass} />
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
            <div className="sm:col-span-2 lg:col-span-1">
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
        <section className="space-y-8">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <Zap className="w-4 h-4 text-emerald-500" />
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Consumo e Tarifas</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Consumo (kWh):</label>
              <input required type="number" step="0.01" name="consumo_total_kwh" value={formData.consumo_total_kwh || ''} onChange={handleChange} className={inputClass} />
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
              <label className={labelClass}>Ilum. Pública (R$):</label>
              <input type="number" step="0.01" name="iluminacao_publica" value={formData.iluminacao_publica || ''} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Upload Integrado */}
          <div className="flex flex-col items-center justify-center p-6 md:p-10 no-print bg-slate-50 rounded-2xl border-2 border-slate-100 border-dashed transition-colors hover:bg-slate-100/50">
            <div className="w-full max-w-md">
              <div className="text-center mb-6">
                <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-sm mx-auto mb-3">
                  <FileUp className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-slate-800 font-bold text-sm tracking-tight">Anexar fatura</p>
                <p className="text-slate-500 text-[10px] md:text-[11px] mt-1 max-w-[240px] mx-auto">Nossa IA preencherá os dados automaticamente para você.</p>
              </div>
              
              <label className={`relative group flex items-center justify-center gap-3 py-4 px-6 border border-slate-200 rounded-2xl transition-all cursor-pointer bg-white shadow-sm hover:border-emerald-500 active:scale-95 ${
                isExtracting ? 'ring-2 ring-emerald-100 border-emerald-500' : ''
              }`}>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                
                {isExtracting ? (
                  <div className="w-5 h-5 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                ) : formData.consumo_total_kwh > 0 && !extractError ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <FileUp className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                )}
                
                <span className={`text-sm font-bold ${
                  isExtracting ? 'text-emerald-700' : extractError ? 'text-red-500' : 'text-slate-600 group-hover:text-emerald-700'
                }`}>
                  {isExtracting ? 'Lendo dados...' : extractError ? extractError : 'Escolha uma foto'}
                </span>
              </label>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <label className={labelClass}>Outros Encargos ou Ajustes:</label>
          <textarea
            name="outros_itens_texto"
            value={formData.outros_itens_texto}
            onChange={handleChange}
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Ex: Multas, juros, etc..."
          />
        </section>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${
            isLoading 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-200 active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-3 border-slate-300 border-t-emerald-600 rounded-full animate-spin"></div>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              Gerar Relatório Completo
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReportForm;
