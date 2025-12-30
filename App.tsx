
import React, { useState } from 'react';
import ReportForm from './components/ReportForm';
import ReportDisplay from './components/ReportDisplay';
import { generateEnvecomReport } from './services/geminiService';
import { BillInputs, ReportResult } from './types';
import { Sun, ArrowRight, AlertCircle, RefreshCcw, Instagram, Phone, Mail } from 'lucide-react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (inputs: BillInputs) => {
    setIsLoading(true);
    setError(null);
    try {
      const report = await generateEnvecomReport(inputs);
      setResult(report);
      setTimeout(() => {
        const anchor = document.getElementById('report-anchor');
        if (anchor) {
          const yOffset = -100; 
          const y = anchor.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    } catch (err: any) {
      console.error("Erro ao gerar:", err);
      setError(err.message || "Erro ao processar fatura. Verifique os dados ou tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-emerald-100 selection:text-emerald-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 py-4 sticky top-0 z-50 shadow-sm px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-100">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tighter text-slate-900 uppercase leading-none">
                ENVECOM
              </h1>
              <p className="text-[9px] uppercase tracking-widest text-emerald-600 font-bold mt-0.5">
                Simulador Profissional
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {result && (
              <button 
                onClick={resetForm}
                className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-emerald-600 font-black text-[10px] uppercase tracking-widest transition-all"
              >
                <RefreshCcw className="w-4 h-4" /> 
                <span className="hidden sm:inline">Nova Simulação</span>
              </button>
            )}
            <a 
              href="https://wa.me/558586529126" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-black transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg"
            >
              Consultor <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="bg-emerald-700 text-white pt-20 pb-48 md:pt-32 md:pb-64 relative overflow-hidden flex flex-col items-center justify-center text-center px-6">
          <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-1000">
            <p className="text-white text-xs md:text-sm font-black uppercase tracking-[0.5em]">
              Associação Energia Verde Compartilhada
            </p>
            <div className="w-12 h-1 bg-emerald-400/30 rounded-full"></div>
          </div>
          
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
             <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-400 rounded-full blur-[140px]"></div>
             <div className="absolute top-1/2 -right-32 w-[30rem] h-[30rem] bg-emerald-500 rounded-full blur-[160px]"></div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-24 md:-mt-40 relative z-10 pb-24">
          {!result && (
            <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
              <ReportForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-6 rounded-3xl flex items-start gap-4 mb-10 shadow-sm animate-in zoom-in-95">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-1">Aviso</p>
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <div id="report-anchor" className="scroll-mt-24">
            {result && (
              <ReportDisplay result={result} />
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-8">
               <Sun className="w-6 h-6 text-emerald-600" />
               <span className="text-lg font-black tracking-tighter uppercase text-slate-900">ENVECOM</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-10 md:gap-20 mb-12">
               <a href="https://www.instagram.com/envecom_/" className="flex flex-col items-center gap-2 group">
                 <Instagram className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Instagram</span>
               </a>
               <a href="tel:558586529126" className="flex flex-col items-center gap-2 group">
                 <Phone className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">(85) 98652-9126</span>
               </a>
               <a href="mailto:contato@envecom.org" className="flex flex-col items-center gap-2 group">
                 <Mail className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">E-mail</span>
               </a>
            </div>

            <p className="text-[9px] uppercase tracking-[0.3em] font-black text-slate-300">
              ASSOCIAÇÃO ENERGIA VERDE COMPARTILHADA © 2025
            </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
