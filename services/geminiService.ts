
import { GoogleGenAI } from "@google/genai";
import { BillInputs, ReportResult } from "../types";

/**
 * Comprime a imagem mantendo alta resolução e nitidez para leitura de texto (OCR).
 */
export const compressImage = async (base64Str: string, maxWidth = 2560, quality = 0.95): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxWidth) {
          width *= maxWidth / height;
          height = maxWidth;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error("Erro no processamento da imagem"));
      
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl.split(',')[1]);
    };
    img.onerror = () => reject(new Error("Erro ao carregar arquivo de imagem"));
  });
};

export const extractDataFromImage = async (base64Image: string, mimeType: string): Promise<Partial<BillInputs>> => {
  // Instanciação dentro da função conforme diretrizes para evitar stale closures da chave
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analise esta fatura de energia e extraia os seguintes dados exatamente no formato JSON abaixo. 
  Importante: capture apenas os números decimais usando ponto (ex: 0.75832) e ignore símbolos de moeda (R$).
  
  Campos necessários:
  {
    "nome": "Nome do cliente",
    "uc": "Número da Unidade Consumidora",
    "distribuidora": "Nome da empresa de energia",
    "mes_ref": "Mês/Ano de referência (ex: 01/2025)",
    "consumo_total_kwh": 0,
    "tarifa_te": 0,
    "tarifa_tusd": 0,
    "tarifa_bandeira_amarela": 0,
    "tarifa_bandeira_vermelha": 0,
    "iluminacao_publica": 0
  }
  
  Retorne apenas o código JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } }
        ]
      },
      config: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("A IA não conseguiu ler os dados da imagem.");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Erro Gemini:", error);
    if (error.message?.includes("API key not found") || error.message?.includes("API_KEY")) {
      throw new Error("Chave API não configurada. Por favor, clique no botão de configuração no topo.");
    }
    throw new Error("Não foi possível extrair os dados. Tente tirar uma foto mais de perto e com melhor iluminação.");
  }
};

export const generateEnvecomReport = async (inputs: BillInputs): Promise<ReportResult> => {
  const total = inputs.consumo_total_kwh || 0;
  let minimo = inputs.tipo_ligacao === 'mono' ? 30 : inputs.tipo_ligacao === 'bi' ? 50 : 100;

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

  if (bAmarela > 0) itensCompensacao.push({ descricao: "Bandeira Amarela", consumo: compensado, tarifa: bAmarela, valor: valorAmarela });
  if (bVermelha > 0) itensCompensacao.push({ descricao: "Bandeira Vermelha", consumo: compensado, tarifa: bVermelha, valor: valorVermelha });

  return {
    text: "Sucesso",
    json: {
      identificacao: { cliente: inputs.nome, uc: inputs.uc, distribuidora: inputs.distribuidora, mes_referencia: inputs.mes_ref, tipo_ligacao: inputs.tipo_ligacao },
      consumo: { total, minimo, compensado },
      itens_compensacao: itensCompensacao,
      resumo: { valor_credito_total: valorCreditoTotal, economia_mensal_associado: economiaAssociado, repasse_envecom: repasseEnvecom, reducao_percentual: parseFloat(reducaoPercentual.toFixed(2)) },
      comparativo: { fatura_atual: faturaAtual, novo_total_final: novoTotalFinal }
    }
  };
};
