// src/types.ts

export interface DeepLeafConfig {
  apiKey: string;
  language?: string;
  endpoint?: string;
}

export interface ErrorDetail {
  code: string;
  message: string;
}

export interface ImageFeedback {
  distance: string;
  focus: string;
}

export interface DiagnosisInfo {
  common_name: string;
  scientific_name: string;
  diagnosis_likelihood: string;
  hosts: string[];
}

export interface MetaData {
  timestamp?: string;
  request_id?: string;
  language?: string;
  [key: string]: any;
}

export interface DeepLeafResponse {
  // Standard response fields
  success: boolean;
  status?: number;
  data?: any;
  error?: ErrorDetail;
  meta?: MetaData;
}
