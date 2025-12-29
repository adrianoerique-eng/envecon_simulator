
import { GoogleGenAI } from "@google/genai";
import { BillInputs, ReportResult, ConnectionType } from "../types";

export const extractDataFromImage = async (base64Image: string, mimeType: string): Promise<Partial<BillInputs>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Extraia dados desta fatura para JSON: nome, uc, distribuidora, mes_ref, consumo_total_kwh, tarifa_te, tarifa_tusd, tarifa_bandeira_amarela, tarifa_bandeira_vermelha, iluminacao_publica. Retorne apenas JSON puro.`;

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
        temperature: 0,
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Erro na extração:", error);
    throw error;
  }
};

export const generateEnvecomReport = async (inputs: BillInputs): Promise<ReportResult> => {
  await new Promise(resolve => setTimeout(resolve, 300));

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
    text: "Simulação finalizada.",
    json: jsonResult
  };
};
