
import React, { useState } from 'react';
import ReportForm from './components/ReportForm';
import ReportDisplay from './components/ReportDisplay';
import { generateEnvecomReport } from './services/geminiService';
import { BillInputs, ReportResult } from './types';
import { Sun, Leaf, ArrowRight, AlertCircle, Instagram, Zap, Shield, CheckCircle } from 'lucide-react';

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
        document.getElementById('report-anchor')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
      setError("Ocorreu um erro ao processar sua fatura. Verifique os dados ou tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 py-4 no-print sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg flex-shrink-0 shadow-sm shadow-emerald-100">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-base md:text-lg font-black tracking-[0.1em] text-emerald-800 leading-none uppercase whitespace-nowrap">
                ENVECOM
              </h1>
              <p className="text-[10px] md:text-[11px] uppercase tracking-widest text-emerald-600/80 font-black mt-0.5">
                Simulador Oficial
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <a 
              href="https://wa.me/558586529126" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 text-white px-5 sm:px-7 py-2.5 rounded-full hover:bg-emerald-700 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-100 whitespace-nowrap active:scale-95"
            >
              Associe-se <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-emerald-700 text-white pt-24 pb-48 no-print relative overflow-hidden">
          {/* Decorative Leaf */}
          <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none translate-x-1/4 -translate-y-1/4">
            <Leaf className="w-full h-full rotate-45" />
          </div>
          
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-12 leading-[1.1] tracking-tight uppercase">
              ASSOCIAÇÃO ENERGIA VERDE COMPARTILHADA
            </h2>
            
            {/* Benefits Labels */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-8 max-w-5xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-300" /> SEM INVESTIMENTO
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-300" /> ZERO BUROCRACIA
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-300" /> ECONOMIA NO MÊS SEGUINTE
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-emerald-300" /> 100% SUSTENTÁVEL
              </div>
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-10 pb-20 space-y-16">
          
          {/* Form Container */}
          <div className="no-print">
            <ReportForm 
              onSubmit={handleSubmit} 
              isLoading={isLoading} 
            />
          </div>

          {/* Objective "How it Works" Section */}
          <section id="como-funciona" className="py-12 no-print">
            <div className="text-center mb-12">
              <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-3">Metodologia</h3>
              <h4 className="text-2xl font-bold text-slate-800">Como funciona o Clube de Benefícios ENVECOM</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <UploadCloud className="w-6 h-6" />,
                  title: "1. Diagnóstico",
                  desc: "Analisamos sua conta atual para identificar o potencial de economia através de créditos solares."
                },
                {
                  icon: <Sun className="w-6 h-6" />,
                  title: "2. Geração Verde",
                  desc: "Nossas usinas injetam energia limpa na rede, que se transforma em créditos reais para você."
                },
                {
                  icon: <Leaf className="w-6 h-6" />,
                  title: "3. Compensação",
                  desc: "Você recebe o desconto direto na sua fatura da distribuidora, pagando menos todos os meses."
                }
              ].map((step, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center transition-all hover:shadow-md">
                  <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6">
                    {step.icon}
                  </div>
                  <h5 className="font-bold text-slate-800 mb-3 uppercase text-xs tracking-wider">{step.title}</h5>
                  <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-6 rounded-2xl flex items-start gap-4 animate-in fade-in zoom-in no-print">
              <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0 text-red-400" />
              <div>
                <p className="font-bold text-sm uppercase tracking-wide">Erro no processamento</p>
                <p className="text-xs opacity-90 mt-1">{error}</p>
              </div>
            </div>
          )}

          <div id="report-anchor" className="scroll-mt-24">
            {result && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="mb-8 flex items-center justify-between no-print px-2">
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">Estudo de Viabilidade Concluído</h3>
                  <button 
                    onClick={() => {
                      setResult(null);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest border-b-2 border-emerald-100"
                  >
                    Nova Simulação
                  </button>
                </div>
                <ReportDisplay result={result} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-200 py-20 no-print">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-600 p-2 rounded-lg flex-shrink-0">
                  <Sun className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base md:text-xl font-black text-white tracking-widest uppercase leading-none">
                    ENVECOM
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-black mt-1.5">
                    Simulador Oficial
                  </span>
                </div>
              </div>
              <p className="text-sm leading-relaxed max-w-sm text-slate-400">
                A ENVECOM democratiza a energia solar através do cooperativismo e inovação tecnológica. Economia inteligente e 100% sustentável.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-black mb-8 uppercase text-[11px] tracking-[0.2em] border-l-2 border-emerald-500 pl-4">Atendimento</h4>
              <ul className="space-y-6">
                <li className="flex flex-col">
                  <span className="text-[10px] uppercase text-emerald-500 font-black tracking-widest mb-1">E-mail Corporativo</span>
                  <a href="mailto:envecomce@gmail.com" className="text-slate-200 font-medium hover:text-emerald-400 transition-colors text-sm">envecomce@gmail.com</a>
                </li>
                <li className="flex flex-col">
                  <span className="text-[10px] uppercase text-emerald-500 font-black tracking-widest mb-1">WhatsApp</span>
                  <a href="https://wa.me/558586529126" target="_blank" rel="noopener noreferrer" className="text-slate-200 font-medium hover:text-emerald-400 transition-colors text-sm">(85) 8652-9126</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-black mb-8 uppercase text-[11px] tracking-[0.2em] border-l-2 border-emerald-500 pl-4">Informações</h4>
              <div className="space-y-6">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-emerald-500 font-black tracking-widest mb-1">Localização</span>
                  <p className="text-slate-200 text-sm font-medium">Sede: Fortaleza-CE</p>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-emerald-500 font-black tracking-widest mb-1">Instagram</span>
                  <a 
                    href="https://www.instagram.com/envecomce?igsh=NjI1OGdrZ2NhOHp0" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-slate-200 font-medium hover:text-emerald-400 transition-colors text-sm flex items-center gap-2"
                  >
                    <Instagram className="w-4 h-4" /> @envecomce
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-10 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-600">
              © 2025 ENVECOM - ASSOCIAÇÃO ENERGIA VERDE COMPARTILHADA
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Simple icon for landing page steps
const UploadCloud: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19a5.5 5.5 0 0 0 2.5-10.5 8.5 8.5 0 1 0-14.5 4.5"/><path d="m12 13-3 3"/><path d="m12 13 3 3"/><path d="M12 21v-8"/></svg>
);

export default App;
