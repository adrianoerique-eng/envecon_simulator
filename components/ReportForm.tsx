
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

  // inputClass alterado para font-normal (sem negrito)
  const inputClass = "w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-800 placeholder:text-slate-400 shadow-sm font-normal";
  // labelClass mantido como font-bold (negrito)
  const labelClass = "block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider";

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      <div className="bg-emerald-600 p-5 text-white flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Calculator className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold">Simulador de Economia</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={loadExampleData}
            className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase py-2 px-3 rounded-lg border border-white/20 transition-all flex items-center gap-2"
          >
            <MousePointer2 className="w-3 h-3" /> Exemplo
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
        {/* Identificação */}
        <section className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Nome do Associado:</label>
              <input required name="nome" value={formData.nome} onChange={handleChange} placeholder="Francinete Ferreira" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Número da UC:</label>
              <input required name="uc" value={formData.uc} onChange={handleChange} placeholder="5121900" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>Distribuidora:</label>
              <input required name="distribuidora" value={formData.distribuidora} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Mês de Referência:</label>
              <input required name="mes_ref" value={formData.mes_ref} onChange={handleChange} placeholder="12/2025" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tipo de Ligação:</label>
              <select name="tipo_ligacao" value={formData.tipo_ligacao} onChange={handleChange} className={inputClass}>
                <option value="mono">Monofásica</option>
                <option value="bi">Bifásica</option>
                <option value="tri">Trifásica</option>
              </select>
            </div>
          </div>
        </section>

        {/* Consumo e Tarifas */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <Zap className="w-4 h-4 text-emerald-500" />
            <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Consumo e Tarifas</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>Consumo (kWh):</label>
              <input required type="number" step="0.01" name="consumo_total_kwh" value={formData.consumo_total_kwh || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tarifa TE (R$/kWh):</label>
              <input required type="number" step="0.00001" name="tarifa_te" value={formData.tarifa_te || ''} onChange={handleChange} placeholder="0,32766" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tarifa TUSD (R$/kWh):</label>
              <input required type="number" step="0.00001" name="tarifa_tusd" value={formData.tarifa_tusd || ''} onChange={handleChange} placeholder="0,62154" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>Bandeira Amarela:</label>
              <input type="number" step="0.00001" name="tarifa_bandeira_amarela" value={formData.tarifa_bandeira_amarela || ''} onChange={handleChange} placeholder="0,02165" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Bandeira Vermelha:</label>
              <input type="number" step="0.00001" name="tarifa_bandeira_vermelha" value={formData.tarifa_bandeira_vermelha || ''} onChange={handleChange} placeholder="0,00782" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Ilum. Pública (R$):</label>
              <input type="number" step="0.01" name="iluminacao_publica" value={formData.iluminacao_publica || ''} onChange={handleChange} placeholder="24,39" className={inputClass} />
            </div>
          </div>

          {/* Upload Integrado */}
          <div className="flex flex-col items-center justify-center py-6 no-print bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
            <div className="w-full max-w-sm px-4">
              <div className="text-center mb-3">
                <p className="text-slate-800 font-bold text-sm tracking-tight">Anexar fatura</p>
                <p className="text-slate-500 text-[10px] mt-0.5">Nossa IA preencherá os dados automaticamente para você.</p>
              </div>
              
              <label className={`relative group flex items-center justify-center gap-3 py-2.5 px-6 border border-slate-200 rounded-lg transition-all cursor-pointer bg-white shadow-sm hover:border-emerald-500 ${
                isExtracting ? 'ring-2 ring-emerald-100 border-emerald-500' : ''
              }`}>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                
                {isExtracting ? (
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                ) : formData.consumo_total_kwh > 0 && !extractError ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <FileUp className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                )}
                
                <span className={`text-xs font-bold ${
                  isExtracting ? 'text-emerald-700' : extractError ? 'text-red-500' : 'text-slate-600 group-hover:text-emerald-700'
                }`}>
                  {isExtracting ? 'Lendo dados...' : extractError ? extractError : 'Escolha uma foto ou PDF'}
                </span>
              </label>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <label className={labelClass}>Outros Encargos ou Ajustes:</label>
          <textarea
            name="outros_itens_texto"
            value={formData.outros_itens_texto}
            onChange={handleChange}
            rows={2}
            className={`${inputClass} resize-none`}
            placeholder="Multas, juros ou outros itens..."
          />
        </section>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
            isLoading 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin"></div>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              Gerar Relatório de Economia
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReportForm;
