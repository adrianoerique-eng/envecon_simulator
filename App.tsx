
import React, { useState, useEffect } from 'react';
import ReportForm from './components/ReportForm';
import ReportDisplay from './components/ReportDisplay';
import { generateEnvecomReport } from './services/geminiService';
import { BillInputs, ReportResult } from './types';
import { Sun, ArrowRight, AlertCircle, RefreshCcw, Instagram, Phone, Mail, Key } from 'lucide-react';

// Define the AIStudio interface globally to align with potential platform definitions
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    // Ensuring the property type matches the AIStudio interface name to avoid conflicts
    aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      if (process.env.API_KEY) {
        setHasApiKey(true);
        return;
      }
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        setHasApiKey(false);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true); // Assume sucesso após o trigger
    } else {
      alert("Para rodar no browser fora do ambiente local, configure a variável GEMINI_API_KEY no seu provedor de hospedagem.");
    }
  };

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
      setError(err.message || "Ocorreu um erro ao processar sua fatura. Verifique os dados ou tente novamente.");
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
      {/* Header Centralizado */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 py-4 sticky top-0 z-50 shadow-sm px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-600 p-2 rounded-xl flex-shrink-0 shadow-lg shadow-emerald-100">
              <Sun className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-sm md:text-base font-black tracking-tighter text-slate-900 leading-none uppercase">
                ENVECOM
              </h1>
              <p className="text-[8px] md:text-[9px] uppercase tracking-widest text-emerald-600 font-bold mt-0.5">
                Simulador
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!hasApiKey && (
              <button 
                onClick={handleOpenKeySelector}
                className="flex items-center gap-2 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg font-black text-[9px] uppercase tracking-widest animate-pulse"
              >
                <Key className="w-3.5 h-3.5" /> 
                Configurar Chave
              </button>
            )}
            {result && (
              <button 
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-emerald-600 font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all active:scale-95"
              >
                <RefreshCcw className="w-3.5 h-3.5" /> 
                <span className="hidden sm:inline">Reiniciar</span>
              </button>
            )}
            <a 
              href="https://wa.me/558586529126" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full hover:bg-black transition-all text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg active:scale-95 whitespace-nowrap"
            >
              Consultor <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="bg-emerald-700 text-white pt-24 pb-48 md:pt-36 md:pb-64 relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="w-12 h-1 bg-emerald-400/30 rounded-full mb-2"></div>
            <p className="text-white text-xs md:text-sm font-black uppercase tracking-[0.5em] leading-relaxed">
              Associação Energia Verde Compartilhada
            </p>
            <div className="flex items-center gap-4 w-full max-w-xs">
              <div className="h-px flex-grow bg-gradient-to-r from-transparent to-emerald-400/20"></div>
              <Sun className="w-4 h-4 text-emerald-400/40" />
              <div className="h-px flex-grow bg-gradient-to-l from-transparent to-emerald-400/20"></div>
            </div>
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
            <div className="bg-red-50 border border-red-100 text-red-700 p-5 md:p-8 rounded-3xl flex items-start gap-4 mb-10 shadow-sm animate-in zoom-in-95">
              <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-1">Erro no Processamento</p>
                <p className="text-sm font-medium opacity-80">{error}</p>
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

      <footer className="bg-white border-t border-slate-100 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-8">
               <Sun className="w-6 h-6 text-emerald-600" />
               <span className="text-lg font-black tracking-tighter uppercase text-slate-900">ENVECOM</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-12 md:gap-20">
               <a 
                 href="https://www.instagram.com/envecom_/" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex flex-col items-center gap-2 group"
               >
                 <div className="bg-slate-50 p-3 rounded-full group-hover:bg-emerald-50 transition-colors">
                   <Instagram className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">Instagram</span>
               </a>

               <a 
                 href="tel:558586529126" 
                 className="flex flex-col items-center gap-2 group"
               >
                 <div className="bg-slate-50 p-3 rounded-full group-hover:bg-emerald-50 transition-colors">
                   <Phone className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">(85) 98652-9126</span>
               </a>

               <a 
                 href="mailto:contato@envecom.org" 
                 className="flex flex-col items-center gap-2 group"
               >
                 <div className="bg-slate-50 p-3 rounded-full group-hover:bg-emerald-50 transition-colors">
                   <Mail className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">E-mail</span>
               </a>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-50 w-full">
              <p className="text-[9px] uppercase tracking-[0.3em] font-black text-slate-300">
                ASSOCIAÇÃO ENERGIA VERDE COMPARTILHADA © 2025
              </p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
