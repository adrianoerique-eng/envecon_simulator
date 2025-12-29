
import React from 'react';
import { ReportResult } from '../types';
import { TrendingUp, Zap, CreditCard, BarChart3, FileText, User, ArrowUpRight } from 'lucide-react';

interface Props {
  result: ReportResult;
}

const DashboardSection = ({ title, icon: Icon, children }: { title: string, icon: any, children?: React.ReactNode }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
      <Icon className="w-4 h-4 text-emerald-600" />
      <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{title}</h3>
    </div>
    {children}
  </div>
);

const ReportDisplay: React.FC<Props> = ({ result }) => {
  const data = result.json;

  const monthlySaving = data?.resumo?.economia_mensal_associado || 0;
  const accumulatedData = Array.from({ length: 12 }, (_, i) => ({
    mes: `mês ${i + 1}`,
    accumulado: monthlySaving * (i + 1)
  }));
  const totalAnual = accumulatedData[11].accumulado;

  const formatCurrency = (val: number | undefined | null) => 
    (val ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const renderChart = () => {
    const maxVal = totalAnual > 0 ? totalAnual * 1.15 : 100;
    return (
      <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-200 relative overflow-visible print:border-none print:p-0">
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest text-center">Projeção Acumulada de Economia</h4>
          </div>
          <div className="bg-emerald-600 text-white px-5 py-2.5 rounded-2xl shadow-xl shadow-emerald-100 flex items-center gap-3 border border-emerald-500 z-10 no-print">
            <div className="bg-white/20 p-2 rounded-lg">
                <ArrowUpRight className="w-4 h-4 text-white" />
            </div>
            <div>
                <p className="text-[9px] font-black uppercase opacity-90 leading-none mb-1 text-center">Economia Total (1 ano)</p>
                <p className="text-xl font-black tracking-tight leading-none text-center">{formatCurrency(totalAnual)}</p>
            </div>
          </div>
        </div>
        <div className="relative flex flex-col items-center">
          <div className="flex w-full h-80 relative">
            <div className="absolute -left-24 top-1/2 -translate-y-1/2 -rotate-90 origin-center whitespace-nowrap">
              <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Economia em R$ (acumulado)</span>
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
                  <div key={i} className="flex-1 flex flex-col items-center group relative z-10 h-full justify-end px-1 text-center">
                    <span className="text-[8px] font-black text-slate-500 mb-2 whitespace-nowrap">
                      R$ {item.accumulado.toFixed(2).replace('.', ',')}
                    </span>
                    <div 
                      className="w-full bg-[#a3d350] rounded-t-sm transition-all duration-500 shadow-sm group-hover:bg-emerald-500"
                      style={{ height: `${heightPercent || 1}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="w-full pl-16">
            <div className="flex justify-around border-t-2 border-slate-200 pt-4">
              {accumulatedData.map((_, i) => (
                <span key={i} className="text-[10px] font-black text-slate-500 flex-1 text-center uppercase">
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
      <div className="bg-white shadow-2xl mx-auto w-full max-w-[210mm] min-h-[297mm] p-[10mm] md:p-[15mm] border border-slate-200 print-report-container block overflow-visible">
        {/* Cabeçalho do Relatório */}
        <div className="flex flex-col items-center mb-10 pb-6 border-b-2 border-slate-900">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none text-center">SIMULAÇÃO</h1>
            <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.5em] mt-3 leading-none text-center">ENVECOM</p>
            <div className="h-1.5 w-24 bg-emerald-500 mt-5"></div>
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-6 text-center">GERADO EM: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        {data ? (
          <div className="space-y-6">
            {/* 1. Identificação do Projeto */}
            <DashboardSection title="1. Identificação do Projeto" icon={User}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Associado", val: data.identificacao?.cliente },
                  { label: "Unidade (UC)", val: data.identificacao?.uc },
                  { label: "Distribuidora", val: data.identificacao?.distribuidora },
                  { label: "Mês Ref.", val: data.identificacao?.mes_referencia },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">{item.label}</p>
                    <p className="text-sm font-normal text-slate-800 truncate leading-tight">{item.val}</p>
                  </div>
                ))}
              </div>
            </DashboardSection>

            {/* 2. Caracterização do Consumo */}
            <DashboardSection title="2. Caracterização do Consumo" icon={Zap}>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] font-normal text-slate-500 uppercase mb-1.5 text-center">Total Medido</p>
                  <p className="text-xl font-normal text-slate-800 text-center">{data.consumo?.total} <span className="text-xs font-normal">kWh</span></p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] font-normal text-slate-500 uppercase mb-1.5 text-center">Consumo mínimo</p>
                  <p className="text-xl font-normal text-slate-500 text-center">{data.consumo?.minimo} <span className="text-xs font-normal">kWh</span></p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                  <p className="text-[10px] font-black text-emerald-600 uppercase mb-1.5 text-center">Compensável</p>
                  <p className="text-xl font-black text-emerald-800 text-center">{data.consumo?.compensado} <span className="text-xs font-black">kWh</span></p>
                </div>
              </div>
            </DashboardSection>

            {/* 3. Detalhamento da Compensação */}
            <DashboardSection title="3. Detalhamento da Compensação" icon={CreditCard}>
              <div className="overflow-hidden border border-slate-200 rounded-xl">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="p-3 text-[10px] font-black text-slate-500 uppercase text-center">Descrição</th>
                      <th className="p-3 text-[10px] font-black text-slate-500 uppercase text-center">Consumo</th>
                      <th className="p-3 text-[10px] font-black text-slate-500 uppercase text-center">Tarifa</th>
                      <th className="p-3 text-[10px] font-black text-slate-500 uppercase text-center">Valor Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.itens_compensacao?.map((item: any, i: number) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 text-sm font-normal text-slate-800 text-center">{item.descricao}</td>
                        <td className="p-3 text-sm text-center font-normal text-slate-800">{item.consumo} kWh</td>
                        <td className="p-3 text-sm text-center font-normal text-slate-800">R$ {item.tarifa?.toFixed(5)}</td>
                        <td className="p-3 text-sm text-center font-normal text-slate-800">R$ {item.valor?.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="bg-emerald-50/50">
                      <td colSpan={3} className="p-4 text-[10px] font-black text-emerald-700 uppercase text-center">CRÉDITO GERADO PELA ENVECOM:</td>
                      <td className="p-4 text-base font-black text-emerald-800 text-center">{formatCurrency(data.resumo?.valor_credito_total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </DashboardSection>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-lg text-center">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Repasse ENVECOM (80%)</p>
                  <p className="text-3xl font-black leading-none">{formatCurrency(data.resumo?.repasse_envecom)}</p>
                  <p className="text-[8px] text-slate-400 mt-3 font-normal italic leading-tight">*Referente à gestão e manutenção da usina solar.</p>
               </div>
               <div className="bg-emerald-600 p-6 rounded-2xl text-white shadow-lg text-center">
                  <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-2">Economia Associado (20%)</p>
                  <p className="text-3xl font-black leading-none">{formatCurrency(data.resumo?.economia_mensal_associado)}</p>
                  <p className="text-[8px] text-emerald-100/70 mt-3 font-normal italic leading-tight">*Lucro direto garantido no seu bolso.</p>
               </div>
            </div>

            {/* 4. Resumo Comparativo Global */}
            <DashboardSection title="4. Resumo Comparativo Global" icon={TrendingUp}>
               <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-center justify-around gap-4 text-center">
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-2 text-center">Fatura Sem ENVECOM</p>
                    <p className="text-sm font-black text-slate-400 line-through decoration-red-400 leading-none text-center">{formatCurrency(data.comparativo?.fatura_atual)}</p>
                  </div>
                  <div className="w-px h-12 bg-slate-200"></div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-emerald-600 uppercase mb-2 text-center">Fatura Com ENVECOM</p>
                    <p className="text-2xl font-black text-emerald-700 leading-none text-center">{formatCurrency(data.comparativo?.novo_total_final)}</p>
                  </div>
                  <div className="w-px h-12 bg-slate-200"></div>
                  <div className="flex-1 border-2 border-red-500 rounded-xl p-3 bg-red-50/20 shadow-sm shadow-red-100/50">
                    <p className="text-[10px] font-black text-red-600 uppercase mb-2 text-center">REDUÇÃO FINAL</p>
                    <div className="flex justify-center">
                      <p className="bg-emerald-100 text-emerald-800 text-sm font-black px-4 py-2 rounded-full leading-none">-{data.resumo?.reducao_percentual}%</p>
                    </div>
                  </div>
               </div>
            </DashboardSection>

            {renderChart()}

            <div className="mt-16 pt-8 border-t border-slate-100 text-center">
               <p className="text-[11px] font-black text-emerald-700 uppercase tracking-[0.4em] text-center">
                 ENVECOM - CLUBE DE BENEFÍCIOS
               </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-slate-400 text-[10px] animate-pulse font-black uppercase tracking-widest text-center">Aguardando dados...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDisplay;
