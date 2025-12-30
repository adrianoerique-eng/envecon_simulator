
import { GoogleGenAI } from "@google/genai";

export const config = {
  maxDuration: 60, // Aumenta o timeout para processamento de imagem
};

export default async function handler(req: any, res: any) {
  // Apenas aceita requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { base64, mimeType } = req.body;

  if (!base64) {
    return res.status(400).json({ error: 'Dados da imagem ausentes' });
  }

  // A API_KEY deve estar configurada no painel da Vercel (Environment Variables)
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API_KEY não configurada no servidor Vercel' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Analise esta fatura de energia e extraia os dados estritamente no formato JSON.
    Campos necessários:
    {
      "nome": "Nome completo do titular",
      "uc": "Número da Unidade Consumidora",
      "distribuidora": "Nome da concessionária (ex: ENEL, COELCE, CPFL)",
      "mes_ref": "Mês de referência no formato MM/AAAA",
      "consumo_total_kwh": número (consumo total medido no mês),
      "tarifa_te": número (valor unitário da Tarifa de Energia - TE),
      "tarifa_tusd": número (valor unitário da Tarifa TUSD),
      "tarifa_bandeira_amarela": número (valor unitário adicional de bandeira amarela se houver),
      "tarifa_bandeira_vermelha": número (valor unitário adicional de bandeira vermelha se houver),
      "iluminacao_publica": número (valor total da taxa de iluminação pública/CIP/Cosip)
    }
    Importante: Retorne APENAS o objeto JSON puro, sem formatação markdown ou textos explicativos.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { data: base64, mimeType: mimeType || 'image/jpeg' } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("A IA retornou uma resposta vazia.");
    }

    // Limpeza simples caso a IA retorne blocos de código
    const cleanedJson = resultText.replace(/```json|```/g, '').trim();
    const extractedData = JSON.parse(cleanedJson);

    return res.status(200).json(extractedData);
  } catch (error: any) {
    console.error("Erro na Serverless Function:", error);
    return res.status(500).json({ 
      error: error.message || 'Erro ao processar a fatura com o servidor de IA' 
    });
  }
}
