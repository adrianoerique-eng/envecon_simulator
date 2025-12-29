
export type ConnectionType = 'mono' | 'bi' | 'tri';

export interface BillInputs {
  nome: string;
  uc: string;
  distribuidora: string;
  mes_ref: string;
  tipo_ligacao: ConnectionType;
  consumo_total_kwh: number;
  tarifa_te: number;
  tarifa_tusd: number;
  tarifa_bandeira_amarela: number;
  tarifa_bandeira_vermelha: number;
  iluminacao_publica: number;
  outros_itens_texto: string;
}

export interface ReportResult {
  text: string;
  json: any;
}
