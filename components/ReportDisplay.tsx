
import React, { useRef, useState } from 'react';
import { ReportResult } from '../types';
import { TrendingUp, Zap, CreditCard, BarChart3, User, ArrowUpRight, Sun, FileDown } from 'lucide-react';

interface Props {
  result: ReportResult;
}

const DashboardSection = ({ title, icon: Icon, children }: { title: string, icon: any, children?: React.ReactNode }) => (
  <div className="mb-8 last:mb-0">
    <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-2">
      <div className="bg-emerald-50 p-2 rounded-xl">
        <Icon className="w-5 h-5 text-emerald-600" />
      </div>
      <h3 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-widest">{title}</h3>
    </div>
    <div className="px-0">
      {children}
    </div>
  </div>
);

const ReportDisplay: React.FC<Props> = ({ result }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const data = result.json;

  const monthlySaving = data?.resumo?.economia_mensal_associado || 0;
  const accumulatedData = Array.from({ length: 12 }, (_, i) => ({
    mes: `mês ${i + 1}`,
    accumulado: monthlySaving * (i + 1)
  }));
  const totalAnual = accumulatedData[11].accumulado;

  const formatCurrency = (val: number | undefined | null) => 
    (val ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatNumber = (val: number | undefined | null, decimals = 2) =>
    (val ?? 0).toLocaleString('pt-BR', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPDF(true);
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      await new Promise(resolve => setTimeout(resolve, 400));

      const canvas = await html2canvas(reportRef.current, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 1024,
        onclone: (clonedDoc) => {
          const btn = clonedDoc.getElementById('pdf-download-btn');
          if (btn) btn.style.display = 'none';
          
          const container = clonedDoc.getElementById('report-container');
          if (container) {
            container.style.width = '1000px';
            container.style.borderRadius = '0px';
            container.style.boxShadow = 'none';
            container.style.border = 'none';
          }
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const marginX = 8;
      const marginY = 8;
      const targetWidth = pdfWidth - (marginX * 2);
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = targetWidth / imgWidth;
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;

      const finalScale = finalHeight > (pdfHeight - marginY * 2) 
        ? (pdfHeight - marginY * 2) / finalHeight 
        : 1;

      pdf.addImage(
        imgData, 
        'JPEG', 
        (pdfWidth - finalWidth * finalScale) / 2, 
        marginY, 
        finalWidth * finalScale, 
        finalHeight * finalScale
      );
      
      pdf.save(`Relatorio_ENVECOM_${data.identificacao?.cliente || 'Simulacao'}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Houve um erro ao gerar o PDF. Tente novamente.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const renderChart = () => {
    const maxVal = totalAnual > 0 ? totalAnual * 1.15 : 100;
    return (
      <div className="mt-8 bg-white p-4 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 px-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Projeção 12 Meses</h4>
          </div>
          <div className="w-full sm:w-auto bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-emerald-100 flex items-center justify-between sm:justify-center gap-5 border border-emerald-500">
            <div className="text-left">
                <p className="text-[9px] font-black uppercase opacity-80 leading-none mb-1.5">Economia Anual</p>
                <p className="text-2xl font-black tracking-tight leading-none">{formatCurrency(totalAnual)}</p>
            </div>
            <ArrowUpRight className="w-6 h-6 text-white shrink-0" />
          </div>
        </div>
        
        <div className="relative flex flex-col items-center w-full px-2">
          <div className="flex w-full h-48 md:h-64 relative">
            <div className="w-8 md:w-10 shrink-0 border-r border-slate-50"></div>
            
            <div className="flex-grow flex items-end justify-around px-0 relative h-full">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
                {[0, 1, 2, 3].map(v => <div key={v} className="w-full border-t border-slate-50"></div>)}
                <div className="w-full"></div>
              </div>
              
              {accumulatedData.map((item, i) => {
                const heightPercent = (item.accumulado / maxVal) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative z-10 h-full justify-end px-0.5 md:px-1">
                    <div 
                      className="w-full bg-emerald-400 rounded-t-lg transition-all duration-500 shadow-sm group-hover:bg-emerald-600 relative"
                      style={{ height: `${heightPercent || 2}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded-lg font-bold whitespace-nowrap z-20 shadow-xl pointer-events-none">
                        {formatCurrency(item.accumulado)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="w-full pl-8 md:pl-10">
            <div className="flex justify-around border-t border-slate-100 pt-3">
              {accumulatedData.map((_, i) => (
                <span key={i} className="text-[9px] font-black text-slate-300 flex-1 text-center">
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
    <div 
      ref={reportRef}
      id="report-container"
      className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-500 relative mx-auto w-full max-w-5xl"
    >
      <div className="px-4 py-8 md:px-14 md:py-16">
        <div id="pdf-download-btn" className="absolute top-6 right-6 no-print z-50">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className={`flex items-center gap-2 px-5 py-3 md:px-7 md:py-4 rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
              isGeneratingPDF 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
            }`}
          >
            {isGeneratingPDF ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <FileDown className="w-5 h-5" />
                Salvar PDF
              </>
            )}
          </button>
        </div>

        {/* Cabeçalho - Corrigido para evitar sobreposição */}
        <div className="flex flex-col items-center mb-16 md:mb-24 text-center px-4">
            <div className="w-16 md:w-24 h-1.5 md:h-2 bg-emerald-600 rounded-full mb-10 md:mb-14"></div>
            <div className="flex flex-col items-center gap-6 md:gap-10">
              <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-tight">
                SIMULAÇÃO
              </h1>
              <p className="text-[10px] md:text-[14px] text-slate-400 font-bold uppercase tracking-[0.4em] md:tracking-[0.6em] border-t border-slate-100 pt-6 md:pt-8 w-full max-w-xs">
                  GERADO EM {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
        </div>

        {data ? (
          <div className="space-y-10 md:space-y-14">
            <DashboardSection title="1. Identificação do Projeto" icon={User}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
                {[
                  { label: "Associado", val: data.identificacao?.cliente },
                  { label: "Unidade (UC)", val: data.identificacao?.uc },
                  { label: "Distribuidora", val: data.identificacao?.distribuidora },
                  { label: "Mês Ref.", val: data.identificacao?.mes_referencia },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50/50 p-4 md:p-5 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase mb-1.5 md:mb-2 leading-none tracking-widest">{item.label}</p>
                    <p className="text-[10px] md:text-sm font-bold text-slate-800 break-words w-full px-1">{item.val}</p>
                  </div>
                ))}
              </div>
            </DashboardSection>

            <DashboardSection title="2. Caracterização do Consumo" icon={Zap}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5">
                <div className="bg-slate-50 p-5 md:p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase mb-2 md:mb-3 tracking-widest">Total Medido</p>
                  <p className="text-3xl md:text-4xl font-black text-slate-800 leading-none">{formatNumber(data.consumo?.total, 0)} <span className="text-base font-medium">kWh</span></p>
                </div>
                <div className="bg-slate-50 p-5 md:p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase mb-2 md:mb-3 tracking-widest">Disponibilidade</p>
                  <p className="text-3xl md:text-4xl font-black text-slate-800 leading-none">{formatNumber(data.consumo?.minimo, 0)} <span className="text-base font-medium">kWh</span></p>
                </div>
                <div className="bg-emerald-50 p-5 md:p-6 rounded-3xl border border-emerald-100 flex flex-col items-center text-center">
                  <p className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase mb-2 md:mb-3 tracking-widest">Compensável</p>
                  <p className="text-3xl md:text-4xl font-black text-emerald-800 leading-none">{formatNumber(data.consumo?.compensado, 0)} <span className="text-base font-bold">kWh</span></p>
                </div>
              </div>
            </DashboardSection>

            <DashboardSection title="3. Detalhamento da Compensação" icon={CreditCard}>
              <div className="overflow-hidden border border-slate-100 rounded-[2rem] md:rounded-[2.5rem] shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-4 md:p-5 text-[9px] md:text-[10px] font-black text-slate-400 uppercase text-center tracking-widest">Descrição</th>
                        <th className="p-4 md:p-5 text-[9px] md:text-[10px] font-black text-slate-400 uppercase text-center tracking-widest">kWh</th>
                        <th className="p-4 md:p-5 text-[9px] md:text-[10px] font-black text-slate-400 uppercase text-center tracking-widest">Tarifa</th>
                        <th className="p-4 md:p-5 text-[9px] md:text-[10px] font-black text-slate-400 uppercase text-center tracking-widest">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.itens_compensacao?.map((item: any, i: number) => (
                        <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                          <td className="p-4 md:p-5 text-[11px] md:text-sm font-semibold text-slate-800 text-center">{item.descricao}</td>
                          <td className="p-4 md:p-5 text-[11px] md:text-sm text-center font-semibold text-slate-800 whitespace-nowrap">{formatNumber(item.consumo, 0)}</td>
                          <td className="p-4 md:p-5 text-[11px] md:text-sm text-center font-semibold text-slate-800 whitespace-nowrap">R$ {formatNumber(item.tarifa, 5)}</td>
                          <td className="p-4 md:p-5 text-[11px] md:text-sm text-center font-semibold text-slate-800 whitespace-nowrap">R$ {formatNumber(item.valor, 2)}</td>
                        </tr>
                      ))}
                      <tr className="bg-emerald-600 text-white shadow-xl">
                        <td colSpan={3} className="p-5 md:p-6 text-[10px] md:text-[11px] font-black uppercase text-center tracking-[0.1em] md:tracking-[0.2em]">Crédito Gerado Envecom:</td>
                        <td className="p-5 md:p-6 text-xl md:text-2xl font-black text-center whitespace-nowrap">{formatCurrency(data.resumo?.valor_credito_total)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </DashboardSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
               <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] text-white shadow-2xl flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] md:text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-3 md:mb-4">Repasse (80%)</p>
                  <p className="text-3xl md:text-5xl font-black leading-none">{formatCurrency(data.resumo?.repasse_envecom)}</p>
                  <p className="text-[9px] md:text-[10px] text-slate-500 mt-3 md:mt-4 font-bold uppercase tracking-widest">Contribuição Associação</p>
               </div>
               <div className="bg-emerald-600 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] text-white shadow-2xl flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] md:text-[11px] font-black text-emerald-50 uppercase tracking-widest mb-3 md:mb-4">Sua Economia (20%)</p>
                  <p className="text-3xl md:text-5xl font-black leading-none">{formatCurrency(data.resumo?.economia_mensal_associado)}</p>
                  <p className="text-[9px] md:text-[10px] text-emerald-100/60 mt-3 md:mt-4 font-bold uppercase tracking-widest">Lucro Líquido Mensal</p>
               </div>
            </div>

            <DashboardSection title="4. Resumo Comparativo Global" icon={TrendingUp}>
               <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] md:rounded-[3rem] p-4 md:p-8 flex flex-wrap lg:flex-nowrap items-center justify-center lg:justify-between gap-6 md:gap-4 text-center relative overflow-visible">
                  <div className="flex-1 min-w-[200px] flex flex-col items-center justify-center py-2">
                    <p className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase mb-2 md:mb-3 tracking-widest">Fatura Original</p>
                    <div className="relative inline-flex items-center justify-center">
                        <span className="text-3xl md:text-4xl font-black text-slate-300 px-3 italic leading-none">{formatCurrency(data.comparativo?.fatura_atual)}</span>
                        <div className="absolute w-[110%] h-[3px] md:h-[4px] bg-red-500/70 -rotate-3 pointer-events-none top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                  </div>
                  
                  <div className="hidden lg:block w-px h-12 bg-slate-200 shrink-0"></div>
                  
                  <div className="flex-1 min-w-[200px] flex flex-col items-center justify-center py-2">
                    <p className="text-[9px] md:text-[11px] font-black text-emerald-600 uppercase mb-2 md:mb-3 tracking-widest">Novo Valor Final</p>
                    <p className="text-3xl md:text-4xl font-black text-emerald-700 leading-none">{formatCurrency(data.comparativo?.novo_total_final)}</p>
                  </div>
                  
                  <div className="hidden lg:block w-px h-12 bg-slate-200 shrink-0"></div>
                  
                  <div className="w-full lg:flex-1 min-w-[220px] flex flex-col items-center justify-center border-2 border-emerald-500/10 rounded-[1.5rem] md:rounded-[2rem] py-4 md:py-6 px-4 md:px-5 bg-white shadow-sm shrink-0">
                    <p className="text-[8px] md:text-[10px] font-black text-emerald-500 uppercase mb-1 md:mb-2 tracking-widest">Redução Total</p>
                    <p className="text-3xl md:text-4xl font-black text-emerald-600 leading-none whitespace-nowrap">-{formatNumber(data.resumo?.reducao_percentual, 2)}%</p>
                  </div>
               </div>
            </DashboardSection>

            {renderChart()}

            <div className="pt-8 md:pt-12 pb-4 text-center">
               <div className="flex items-center justify-center gap-2.5 mb-4 md:mb-6">
                  <Sun className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
                  <p className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-[0.4em] md:tracking-[0.8em]">
                    ENVECOM
                  </p>
               </div>
               <p className="text-[8px] md:text-[10px] font-bold text-slate-300 uppercase tracking-[0.1em] md:tracking-[0.2em] leading-relaxed max-w-sm mx-auto">
                 ASSOCIAÇÃO DE ENERGIA VERDE COMPARTILHADA <br/> INOVAÇÃO • SUSTENTABILIDADE • ECONOMIA
               </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 md:py-24 text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-slate-50 border-t-emerald-600 rounded-full animate-spin mb-6 md:mb-8"></div>
            <p className="text-slate-400 text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Gerando inteligência financeira...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDisplay;
