
import React, { useState } from 'react';
import { ReportResult } from '../types';
import { Copy, Check, Code, TrendingUp, Zap, CreditCard, BarChart3, FileText, User, ArrowUpRight } from 'lucide-react';

interface Props {
  result: ReportResult;
}

const DashboardSection = ({ title, icon: Icon, children }: { title: string, icon: any, children?: React.ReactNode }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-1.5">
      <Icon className="w-4 h-4 text-emerald-600" />
      <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{title}</h3>
    </div>
    {children}
  </div>
);

const ReportDisplay: React.FC<Props> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'json'>('report');
  const [copied, setCopied] = useState(false);

  const data = result.json;

  const monthlySaving = data?.resumo?.economia_mensal_associado || 0;
  const accumulatedData = Array.from({ length: 12 }, (_, i) => ({
    mes: `mês ${i + 1}`,
    accumulado: monthlySaving * (i + 1)
  }));
  const totalAnual = accumulatedData[11].accumulado;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result.json, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (val: number | undefined | null) => 
    (val ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const renderChart = () => {
    const maxVal = totalAnual > 0 ? totalAnual * 1.15 : 100;
    return (
      <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-200 relative overflow-visible print:border-none print:p-0">
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Projeção Acumulada de Economia</h4>
          </div>
          <div className="bg-emerald-600 text-white px-5 py-2.5 rounded-2xl shadow-xl shadow-emerald-100 flex items-center gap-3 border border-emerald-500 z-10 no-print">
            <div className="bg-white/20 p-2 rounded-lg">
                <ArrowUpRight className="w-4 h-4 text-white" />
            </div>
            <div>
                <p className="text-[9px] font-black uppercase opacity-90 leading-none mb-1">Economia Total (1 ano)</p>
                <p className="text-xl font-black tracking-tight leading-none">{formatCurrency(totalAnual)}</p>
            </div>
          </div>
        </div>
        <div className="relative flex flex-col items-center">
          <div className="flex w-full h-80 relative">
            <div className="absolute -left-24 top-1/2 -translate-y-1/2 -rotate-90 origin-center whitespace-nowrap">
              <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">Economia em R$ (acumulado)</span>
            </div>
            <div className="w-16 shrink-0 border-r-2 border-slate-200"></div>
            <div className="flex-grow flex items-end justify-around px-4 relative h-[250px]">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
                {[0, 1, 2, 3].map(v => <div key={v} className="w-full border-t border-slate-100"></div>)}
                <div className="w-full"></div>
              </div>
              {accumulatedData.map((item, i) => {
                const heightPercent = (item.accumulado / maxVal) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative z-10 h-full justify-end px-1">
                    <span className="text-[8px] font-black text-slate-700 mb-2 whitespace-nowrap">
                      R$ {item.accumulado.toFixed(2).replace('.', ',')}
                    </span>
                    <div 
                      className="w-full bg-[#a3d350] rounded-t-sm transition-all duration-500 shadow-sm group-hover:bg-emerald-500"
                      style={{ height: `${Math.max(heightPercent, 1)}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="w-full pl-16">
            <div className="flex justify-around border-t-2 border-slate-200 pt-4">
              {accumulatedData.map((_, i) => (
                <span key={i} className="text-[10px] font-bold text-slate-500 flex-1 text-center">
                  mês {i + 1}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 relative">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-2 flex flex-wrap items-center justify-between gap-3 no-print sticky top-[80px] z-[150]">
        <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                    onClick={() => setActiveTab('report')}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                    activeTab === 'report' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <FileText className="w-3.5 h-3.5" /> Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('json')}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                    activeTab === 'json' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Code className="w-3.5 h-3.5" /> JSON
                </button>
            </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={handleCopy} 
            className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-all cursor-pointer flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
            title="Copiar JSON"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado' : 'Copiar Dados'}
          </button>
        </div>
      </div>

      <div className={`bg-white shadow-2xl mx-auto w-full max-w-[210mm] min-h-[297mm] p-[10mm] md:p-[15mm] border border-slate-200 print-report-container ${activeTab === 'json' ? 'hidden print:block' : 'block'}`}>
        <div className="flex flex-col items-center mb-10 pb-6 border-b-2 border-slate-900">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none text-center">SIMULAÇÃO DE ECONOMIA</h1>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-[0.5em] mt-3 leading-none">ENVECOM</p>
            <div className="h-1.5 w-24 bg-emerald-500 mt-5"></div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-6">Simulação gerada em: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        {data ? (
          <div className="space-y-6">
            <DashboardSection title="1. Identificação do Projeto" icon={User}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Associado", val: data.identificacao?.cliente },
                  { label: "Unidade (UC)", val: data.identificacao?.uc },
                  { label: "Distribuidora", val: data.identificacao?.distribuidora },
                  { label: "Mês Ref.", val: data.identificacao?.mes_referencia },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{item.label}</p>
                    <p className="text-[10px] font-bold text-slate-800 truncate leading-tight">{item.val}</p>
                  </div>
                ))}
              </div>
            </DashboardSection>

            <DashboardSection title="2. Caracterização do Consumo" icon={Zap}>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Total Medido</p>
                  <p className="text-base font-black text-slate-800">{data.consumo?.total} <span className="text-[10px]">kWh</span></p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Consumo mínimo</p>
                  <p className="text-base font-black text-slate-500">{data.consumo?.minimo} <span className="text-[10px]">kWh</span></p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                  <p className="text-[8px] font-black text-emerald-600 uppercase mb-1">Compensável</p>
                  <p className="text-base font-black text-emerald-800">{data.consumo?.compensado} <span className="text-[10px]">kWh</span></p>
                </div>
              </div>
            </DashboardSection>

            <DashboardSection title="3. Detalhamento da Compensação" icon={CreditCard}>
              <div className="overflow-hidden border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="p-3 text-[9px] font-black text-slate-700 uppercase">Descrição</th>
                      <th className="p-3 text-[9px] font-black text-slate-700 uppercase text-center">Consumo</th>
                      <th className="p-3 text-[9px] font-black text-slate-700 uppercase text-right">Tarifa</th>
                      <th className="p-3 text-[9px] font-black text-slate-700 uppercase text-right">Valor Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.itens_compensacao?.map((item: any, i: number) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 text-[10px] font-medium text-slate-600">{item.descricao}</td>
                        <td className="p-3 text-[10px] text-center font-bold text-slate-800">{item.consumo} kWh</td>
                        <td className="p-3 text-[10px] text-right font-medium text-slate-500">R$ {item.tarifa?.toFixed(5)}</td>
                        <td className="p-3 text-[10px] text-right font-black text-slate-800">R$ {item.valor?.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="bg-emerald-50/50">
                      <td colSpan={3} className="p-4 text-[9px] font-black text-emerald-700 uppercase text-right">CRÉDITO GERADO PELA ENVECOM:</td>
                      <td className="p-4 text-sm font-black text-emerald-800 text-right">{formatCurrency(data.resumo?.valor_credito_total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </DashboardSection>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-900 p-5 rounded-2xl text-white shadow-xl">
                  <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1.5">Repasse ENVECOM (80%)</p>
                  <p className="text-2xl font-black leading-none">{formatCurrency(data.resumo?.repasse_envecom)}</p>
                  <p className="text-[7px] text-slate-400 mt-2.5 italic leading-tight">*Referente à gestão e manutenção da usina solar.</p>
               </div>
               <div className="bg-emerald-600 p-5 rounded-2xl text-white shadow-xl">
                  <p className="text-[8px] font-black text-emerald-100 uppercase tracking-widest mb-1.5">Economia Associado (20%)</p>
                  <p className="text-2xl font-black leading-none">{formatCurrency(data.resumo?.economia_mensal_associado)}</p>
                  <p className="text-[7px] text-emerald-100/70 mt-2.5 italic leading-tight">*Lucro direto garantido no seu bolso.</p>
               </div>
            </div>

            <DashboardSection title="4. Resumo Comparativo Global" icon={TrendingUp}>
               <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-around gap-4 text-center">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1.5">Fatura Sem ENVECOM</p>
                    <p className="text-sm font-black text-slate-400 line-through decoration-red-400 leading-none">{formatCurrency(data.comparativo?.fatura_atual)}</p>
                  </div>
                  <div className="w-px h-12 bg-slate-200"></div>
                  <div>
                    <p className="text-[8px] font-black text-emerald-600 uppercase mb-1.5">Fatura Com ENVECOM</p>
                    <p className="text-xl font-black text-emerald-700 leading-none">{formatCurrency(data.comparativo?.novo_total_final)}</p>
                  </div>
                  <div className="w-px h-12 bg-slate-200"></div>
                  <div>
                    <p className="text-[8px] font-black text-emerald-600 uppercase mb-1.5">REDUÇÃO REAL (GLOBAL)</p>
                    <p className="bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-1.5 rounded-full leading-none">-{data.resumo?.reducao_percentual}%</p>
                  </div>
               </div>
            </DashboardSection>

            {renderChart()}

            <div className="mt-16 pt-8 border-t border-slate-100 text-center">
               <p className="text-[11px] font-black text-emerald-700 uppercase tracking-[0.4em]">
                 ENVECOM - CLUBE DE BENEFÍCIOS
               </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-slate-400 text-xs animate-pulse font-black uppercase tracking-widest">Aguardando dados...</p>
          </div>
        )}
      </div>

      {activeTab === 'json' && (
        <div className="bg-slate-900 rounded-xl p-6 overflow-auto shadow-inner h-[600px] no-print">
            <pre className="text-emerald-400 text-xs font-mono leading-relaxed">
              {JSON.stringify(result.json, null, 2)}
            </pre>
        </div>
      )}
    </div>
  );
};

export default ReportDisplay;
