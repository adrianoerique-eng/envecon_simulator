
import React, { useState } from 'react';
import ReportForm from './components/ReportForm';
import ReportDisplay from './components/ReportDisplay';
import { generateEnvecomReport } from './services/geminiService';
import { BillInputs, ReportResult } from './types';
import { Sun, ArrowRight, AlertCircle, Printer, X, RefreshCcw } from 'lucide-react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (inputs: BillInputs) => {
    setIsLoading(true);
    setError(null);
    try {
      const report = await generateEnvecomReport(inputs);
      setResult(report);
      // Scroll suave para o relatório
      setTimeout(() => {
        document.getElementById('report-anchor')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error("Erro ao gerar:", err);
      setError("Ocorreu um erro ao processar sua fatura. Verifique os dados ou tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    // Dispara o print do navegador. O CSS no index.html cuidará de mostrar apenas o .only-print
    window.print();
  };

  const resetForm = () => {
    setResult(null);
    setShowPreview(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header Centralizado - Único ponto de controle */}
      <header className="bg-white border-b border-slate-100 py-4 no-print sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg flex-shrink-0">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-base md:text-lg font-black tracking-[0.1em] text-emerald-800 leading-none uppercase">
                ENVECOM
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-emerald-600/80 font-black mt-0.5">
                Simulador Oficial
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {result && (
              <>
                <button 
                  type="button"
                  onClick={resetForm}
                  className="p-2.5 text-slate-400 hover:text-emerald-600 transition-colors"
                  title="Novo Cálculo"
                >
                  <RefreshCcw className="w-5 h-5" />
                </button>
                <button 
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-black transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg active:scale-95 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> <span>Visualizar / PDF</span>
                </button>
              </>
            )}
            <a 
              href="https://wa.me/558586529126" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 text-white px-5 sm:px-7 py-2.5 rounded-full hover:bg-emerald-700 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg active:scale-95"
            >
              Associe-se <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow no-print">
        <div className="bg-emerald-700 text-white pt-24 pb-48 relative overflow-hidden text-center">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-12 leading-[1.1] tracking-tight uppercase">
              ASSOCIAÇÃO ENERGIA VERDE COMPARTILHADA
            </h2>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-10 pb-20">
          {!result && <ReportForm onSubmit={handleSubmit} isLoading={isLoading} />}

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-6 rounded-2xl flex items-start gap-4 mb-8">
              <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
              <p className="text-xs font-bold uppercase tracking-wide">{error}</p>
            </div>
          )}

          <div id="report-anchor" className="scroll-mt-24">
            {result && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <ReportDisplay result={result} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ÁREA DE IMPRESSÃO (Oculta na tela, visível apenas no @media print) */}
      {result && (
        <div className="only-print">
          <ReportDisplay result={result} />
        </div>
      )}

      {/* MODAL DE PREVIEW */}
      {showPreview && result && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 print:hidden animate-in fade-in">
          <div className="bg-slate-100 w-full max-w-5xl h-[95vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden border border-slate-700">
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
               <div>
                 <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Relatório de Viabilidade</h2>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Documento oficial ENVECOM</p>
               </div>
               <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowPreview(false)} 
                    className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors text-[10px] uppercase tracking-widest flex items-center gap-2"
                  >
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                  <button 
                    type="button" 
                    onClick={handlePrint} 
                    className="px-6 py-2 bg-emerald-600 text-white font-black hover:bg-emerald-700 rounded-xl transition-colors text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
                  </button>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-slate-300/50 p-4 sm:p-12 flex justify-center">
               <div className="bg-white shadow-2xl w-full max-w-[210mm] min-h-[297mm] p-2 sm:p-10 shrink-0 origin-top transform">
                   <ReportDisplay result={result} />
               </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-slate-900 text-slate-200 py-10 no-print">
        <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-600">
              © 2025 ENVECOM - ASSOCIAÇÃO ENERGIA VERDE COMPARTILHADA
            </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
