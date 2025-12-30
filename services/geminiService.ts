
import { GoogleGenAI } from "@google/genai";
import { BillInputs, ReportResult, ConnectionType } from "../types";

export const extractDataFromImage = async (base64Image: string, mimeType: string): Promise<Partial<BillInputs>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analise esta fatura de energia e extraia os seguintes campos exatamente para este formato JSON. 
  Importante: extraia valores numéricos puros (ex: 0.32 em vez de "R$ 0,32"). 
  Campos:
  - nome: Nome completo do cliente
  - uc: Número da Unidade Consumidora (UC)
  - distribuidora: Nome da empresa (ex: ENEL, EQUATORIAL)
  - mes_ref: Mês/Ano de referência (ex: 12/2024)
  - consumo_total_kwh: Total de kWh consumidos no mês
  - tarifa_te: Valor da Tarifa de Energia (TE) por kWh
  - tarifa_tusd: Valor da Tarifa de Uso do Sistema (TUSD) por kWh
  - tarifa_bandeira_amarela: Valor da bandeira amarela (se houver)
  - tarifa_bandeira_vermelha: Valor da bandeira vermelha (se houver)
  - iluminacao_publica: Valor total da Contribuição de Iluminação Pública (CIP/COSIP)
  
  Retorne APENAS o JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { data: base64Image, mimeType } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Erro na extração Gemini:", error);
    throw error;
  }
};

export const generateEnvecomReport = async (inputs: BillInputs): Promise<ReportResult> => {
  // Simulação de processamento para UX
  await new Promise(resolve => setTimeout(resolve, 800));

  const total = inputs.consumo_total_kwh || 0;
  let minimo = 0;
  
  if (inputs.tipo_ligacao === 'mono') minimo = 30;
  else if (inputs.tipo_ligacao === 'bi') minimo = 50;
  else if (inputs.tipo_ligacao === 'tri') minimo = 100;

  const compensado = Math.max(0, total - minimo);
  
  const te = inputs.tarifa_te || 0;
  const tusdOriginal = inputs.tarifa_tusd || 0;
  const tusdAjustada = tusdOriginal * 0.8; 
  const bAmarela = inputs.tarifa_bandeira_amarela || 0;
  const bVermelha = inputs.tarifa_bandeira_vermelha || 0;

  const valorTE = compensado * te;
  const valorTUSD = compensado * tusdAjustada;
  const valorAmarela = compensado * bAmarela;
  const valorVermelha = compensado * bVermelha;
  
  const valorCreditoTotal = valorTE + valorTUSD + valorAmarela + valorVermelha;
  const economiaAssociado = valorCreditoTotal * 0.20;
  const repasseEnvecom = valorCreditoTotal * 0.80;

  const tarifaCheia = te + tusdOriginal + bAmarela + bVermelha;
  const faturaAtual = (total * tarifaCheia) + (inputs.iluminacao_publica || 0);
  const novoTotalFinal = (faturaAtual - valorCreditoTotal) + repasseEnvecom;
  
  const reducaoPercentual = faturaAtual > 0 ? ((faturaAtual - novoTotalFinal) / faturaAtual * 100) : 0;

  const itensCompensacao = [
    { descricao: "Tarifa de Energia (TE)", consumo: compensado, tarifa: te, valor: valorTE },
    { descricao: "TUSD (Ajustada -20% ICMS)", consumo: compensado, tarifa: tusdAjustada, valor: valorTUSD }
  ];

  if (bAmarela > 0) {
    itensCompensacao.push({ descricao: "Bandeira Amarela", consumo: compensado, tarifa: bAmarela, valor: valorAmarela });
  }
  if (bVermelha > 0) {
    itensCompensacao.push({ descricao: "Bandeira Vermelha", consumo: compensado, tarifa: bVermelha, valor: valorVermelha });
  }

  const jsonResult = {
    identificacao: {
      cliente: inputs.nome,
      uc: inputs.uc,
      distribuidora: inputs.distribuidora,
      mes_referencia: inputs.mes_ref,
      tipo_ligacao: inputs.tipo_ligacao
    },
    consumo: { total, minimo, compensado },
    itens_compensacao: itensCompensacao,
    resumo: {
      valor_credito_total: valorCreditoTotal,
      economia_mensal_associado: economiaAssociado,
      repasse_envecom: repasseEnvecom,
      reducao_percentual: parseFloat(reducaoPercentual.toFixed(2))
    },
    comparativo: {
      fatura_atual: faturaAtual,
      novo_total_final: novoTotalFinal
    }
  };

  return {
    text: "Relatório gerado com sucesso.",
    json: jsonResult
  };
};