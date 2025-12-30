
import { BillInputs, ReportResult } from "../types";

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
      if (!ctx) return reject(new Error("Erro no canvas"));
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality).split(',')[1]);
    };
    img.onerror = () => reject(new Error("Erro ao carregar imagem para compressão"));
  });
};

/**
 * Agora chama a Serverless Function em /api/extract em vez de chamar o Google diretamente.
 * Isso protege a API Key e evita erros de CORS/Segurança no navegador.
 */
export const extractDataFromImage = async (base64Image: string, mimeType: string): Promise<Partial<BillInputs>> => {
  try {
    const response = await fetch('/api/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64: base64Image, mimeType }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "O servidor não conseguiu processar a imagem.");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Frontend Service Error:", error);
    throw new Error(error.message || "Não foi possível ler a fatura automaticamente. Por favor, preencha os campos manualmente.");
  }
};

export const generateEnvecomReport = async (inputs: BillInputs): Promise<ReportResult> => {
  const total = inputs.consumo_total_kwh || 0;
  const minimo = inputs.tipo_ligacao === 'mono' ? 30 : inputs.tipo_ligacao === 'bi' ? 50 : 100;
  const compensado = Math.max(0, total - minimo);
  
  const te = inputs.tarifa_te || 0;
  const tusdAjustada = (inputs.tarifa_tusd || 0) * 0.8; 
  const bAmarela = inputs.tarifa_bandeira_amarela || 0;
  const bVermelha = inputs.tarifa_bandeira_vermelha || 0;

  const valorTE = compensado * te;
  const valorTUSD = compensado * tusdAjustada;
  const valorAmarela = compensado * bAmarela;
  const valorVermelha = compensado * bVermelha;
  
  const valorCreditoTotal = valorTE + valorTUSD + valorAmarela + valorVermelha;
  const economiaAssociado = valorCreditoTotal * 0.20;
  const repasseEnvecom = valorCreditoTotal * 0.80;

  const tarifaCheia = te + (inputs.tarifa_tusd || 0) + bAmarela + bVermelha;
  const faturaAtual = (total * tarifaCheia) + (inputs.iluminacao_publica || 0);
  const novoTotalFinal = (faturaAtual - valorCreditoTotal) + repasseEnvecom;
  const reducaoPercentual = faturaAtual > 0 ? ((faturaAtual - novoTotalFinal) / faturaAtual * 100) : 0;

  const itensCompensacao = [
    { descricao: "Tarifa de Energia (TE)", consumo: compensado, valor: valorTE },
    { descricao: "TUSD (Ajustada -20%)", consumo: compensado, valor: valorTUSD }
  ];

  if (valorAmarela > 0) {
    itensCompensacao.push({ descricao: "Bandeira Amarela", consumo: compensado, valor: valorAmarela });
  }
  if (valorVermelha > 0) {
    itensCompensacao.push({ descricao: "Bandeira Vermelha", consumo: compensado, valor: valorVermelha });
  }

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
