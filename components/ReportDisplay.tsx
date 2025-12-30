
import React from 'react';
import { ReportResult } from '../types';
import { TrendingUp, Zap, CreditCard, BarChart3, User, ArrowUpRight, Sun } from 'lucide-react';

interface Props {
  result: ReportResult;
}

const DashboardSection = ({ title, icon: Icon, children }: { title: string, icon: any, children?: React.ReactNode }) => (
  <div className="mb-10 last:mb-0">
    <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-3">
      <div className="bg-emerald-50 p-2 rounded-xl">
        <Icon className="w-4 h-4 text-emerald-600" />
      </div>
      <h3 className="text-[11px] md:text-xs font-black text-slate-900 uppercase tracking-widest">{title}</h3>
    </div>
    <div className="px-0.5">
      {children}
    </div>
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
      <div className="mt-6 bg-white p-5 md:p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Projeção 12 Meses</h4>
          </div>
          <div className="w-full sm:w-auto bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg shadow-emerald-100 flex items-center justify-between sm:justify-center gap-4 border border-emerald-500">
            <div className="text-left">
                <p className="text-[8px] font-black uppercase opacity-80 leading-none mb-1">Economia Anual</p>
                <p className="text-xl font-black tracking-tight leading-none">{formatCurrency(totalAnual)}</p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-white shrink-0" />
          </div>
        </div>
        <div className="relative flex flex-col items-center">
          <div className="flex w-full h-40 md:h-56 relative">
            <div className="w-10 md:w-14 shrink-0 border-r border-slate-50"></div>
            <div className="flex-grow flex items-end justify-around px-1 md:px-3 relative h-full">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
                {[0, 1, 2, 3].map(v => <div key={v} className="w-full border-t border-slate-50"></div>)}
                <div className="w-full"></div>
              </div>
              {accumulatedData.map((item, i) => {
                const heightPercent = (item.accumulado / maxVal) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative z-10 h-full justify-end px-0.5 md:px-1.5">
                    <div 
                      className="w-full bg-emerald-400 rounded-t-lg transition-all duration-500 shadow-sm group-hover:bg-emerald-600 relative"
                      style={{ height: `${heightPercent || 2}%` }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] px-2 py-1 rounded-lg font-bold whitespace-nowrap z-20 shadow-xl pointer-events-none">
                        {formatCurrency(item.accumulado)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="w-full pl-10 md:pl-14">
            <div className="flex justify-around border-t border-slate-100 pt-3">
              {accumulatedData.map((_, i) => (
                <span key={i} className="text-[8px] font-black text-slate-300 flex-1 text-center">
                  M{i + 1}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
      <div className="p-6 sm:p-10 md:p-16">
        {/* Cabeçalho do Relatório */}
        <div className="flex flex-col items-center mb-16 text-center">
            <div className="w-16 h-1.5 bg-emerald-600 rounded-full mb-8"></div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">SIMULAÇÃO</h1>
            <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-[0.6em] mt-5">
                GERADO EM {new Date().toLocaleDateString('pt-BR')}
            </p>
        </div>

        {data ? (
          <div className="space-y-16">
            {/* 1. Identificação */}
            <DashboardSection title="1. Identificação do Projeto" icon={User}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                  { label: "Associado", val: data.identificacao?.cliente },
                  { label: "Unidade (UC)", val: data.identificacao?.uc },
                  { label: "Distribuidora", val: data.identificacao?.distribuidora },
                  { label: "Mês Ref.", val: data.identificacao?.mes_referencia },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-2 leading-none tracking-widest">{item.label}</p>
                    <p className="text-[11px] md:text-xs font-bold text-slate-800 break-words w-full px-1">{item.val}</p>
                  </div>
                ))}
              </div>
            </DashboardSection>

            {/* 2. Consumo */}
            <DashboardSection title="2. Caracterização do Consumo" icon={Zap}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-3 tracking-widest">Total Medido</p>
                  <p className="text-3xl font-black text-slate-800 leading-none">{data.consumo?.total} <span className="text-sm font-medium">kWh</span></p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-3 tracking-widest">Disponibilidade</p>
                  <p className="text-3xl font-black text-slate-800 leading-none">{data.consumo?.minimo} <span className="text-sm font-medium">kWh</span></p>
                </div>
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex flex-col items-center text-center">
                  <p className="text-[9px] font-black text-emerald-600 uppercase mb-3 tracking-widest">Compensável</p>
                  <p className="text-3xl font-black text-emerald-800 leading-none">{data.consumo?.compensado} <span className="text-sm font-bold">kWh</span></p>
                </div>
              </div>
            </DashboardSection>

            {/* 3. Tabela de Detalhamento */}
            <DashboardSection title="3. Detalhamento da Compensação" icon={CreditCard}>
              <div className="overflow-hidden border border-slate-100 rounded-[2rem] shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-5 text-[9px] font-black text-slate-400 uppercase text-center tracking-widest">Descrição</th>
                        <th className="p-5 text-[9px] font-black text-slate-400 uppercase text-center tracking-widest">kWh</th>
                        <th className="p-5 text-[9px] font-black text-slate-400 uppercase text-center tracking-widest">Tarifa</th>
                        <th className="p-5 text-[9px] font-black text-slate-400 uppercase text-center tracking-widest">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.itens_compensacao?.map((item: any, i: number) => (
                        <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                          <td className="p-5 text-xs font-semibold text-slate-800 text-center">{item.descricao}</td>
                          <td className="p-5 text-xs text-center font-semibold text-slate-800 whitespace-nowrap">{item.consumo}</td>
                          <td className="p-5 text-xs text-center font-semibold text-slate-800 whitespace-nowrap">R$ {item.tarifa?.toFixed(5)}</td>
                          <td className="p-5 text-xs text-center font-semibold text-slate-800 whitespace-nowrap">R$ {item.valor?.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="bg-emerald-600 text-white shadow-xl">
                        <td colSpan={3} className="p-6 text-[10px] font-black uppercase text-center tracking-[0.2em]">Crédito Gerado Envecom:</td>
                        <td className="p-6 text-xl font-black text-center whitespace-nowrap">{formatCurrency(data.resumo?.valor_credito_total)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </DashboardSection>

            {/* Cards de Repasse e Economia */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl flex flex-col items-center justify-center text-center transform transition hover:scale-[1.01] active:scale-95 cursor-default">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-5">Repasse (80%)</p>
                  <p className="text-4xl font-black leading-none">{formatCurrency(data.resumo?.repasse_envecom)}</p>
                  <p className="text-[9px] text-slate-500 mt-5 font-bold uppercase tracking-widest">Contribuição Associação</p>
               </div>
               <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-2xl flex flex-col items-center justify-center text-center transform transition hover:scale-[1.01] active:scale-95 cursor-default">
                  <p className="text-[10px] font-black text-emerald-50 uppercase tracking-widest mb-5">Sua Economia (20%)</p>
                  <p className="text-4xl font-black leading-none">{formatCurrency(data.resumo?.economia_mensal_associado)}</p>
                  <p className="text-[9px] text-emerald-100/60 mt-5 font-bold uppercase tracking-widest">Lucro Líquido Mensal</p>
               </div>
            </div>

            {/* 4. Resumo Comparativo */}
            <DashboardSection title="4. Resumo Comparativo Global" icon={TrendingUp}>
               <div className="bg-slate-50/50 border border-slate-100 rounded-[2.5rem] p-8 md:p-12 flex flex-col sm:flex-row items-center justify-around gap-12 text-center relative overflow-hidden">
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase mb-4 tracking-widest">Fatura Original</p>
                    <div className="relative inline-block">
                        <span className="text-2xl font-black text-slate-300 px-2 italic">{formatCurrency(data.comparativo?.fatura_atual)}</span>
                        <div className="absolute top-[50%] left-0 right-0 h-[2px] bg-red-400/30 -rotate-3"></div>
                    </div>
                  </div>
                  
                  <div className="hidden sm:block w-px h-20 bg-slate-200"></div>
                  
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-[10px] font-black text-emerald-600 uppercase mb-4 tracking-widest">Novo Valor Final</p>
                    <p className="text-4xl font-black text-emerald-700 leading-none">{formatCurrency(data.comparativo?.novo_total_final)}</p>
                  </div>
                  
                  <div className="hidden lg:block w-px h-20 bg-slate-200"></div>
                  
                  <div className="w-full lg:flex-1 flex flex-col items-center justify-center border-2 border-emerald-500/10 rounded-3xl py-6 px-8 bg-white shadow-sm">
                    <p className="text-[9px] font-black text-emerald-500 uppercase mb-2 tracking-widest">Redução Total</p>
                    <p className="text-4xl font-black text-emerald-600 leading-none">-{data.resumo?.reducao_percentual}%</p>
                  </div>
               </div>
            </DashboardSection>

            {renderChart()}

            <div className="pt-16 pb-6 border-t border-slate-50 text-center">
               <div className="flex items-center justify-center gap-2 mb-6">
                  <Sun className="w-5 h-5 text-emerald-400" />
                  <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.8em]">
                    ENVECOM
                  </p>
               </div>
               <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] leading-relaxed max-w-sm mx-auto">
                 ASSOCIAÇÃO DE ENERGIA VERDE COMPARTILHADA <br/> INOVAÇÃO • SUSTENTABILIDADE • ECONOMIA
               </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 border-4 border-slate-50 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
            <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em]">Gerando inteligência financeira...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDisplay;
