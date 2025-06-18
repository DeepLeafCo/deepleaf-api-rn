// src/types.ts

export interface DeepLeafConfig {
  apiKey: string;
  language?: string;
  endpoint?: string;
}

export interface ImageFeedback {
  distance: 'good' | 'bad' | 'very_bad' | 'no_plant';
  focus: 'good' | 'bad';
}

export interface Diagnosis {
  common_name: string;
  diagnosis_likelihood: string;
  hosts: string[];
  pathogen_class: string;
  preventive_measures: string[];
  scientific_name: string;
  symptoms: string;
  symptoms_short: string[];
  treatment_chemical: string;
  treatment_organic: string;
  trigger: string;
  deepleaf_id: number;
}

// Nested data structure for success response
export interface SuccessData {
  crops: string[];
  diagnoses_detected: boolean;
  image_feedback: ImageFeedback;
  predicted_diagnoses: Diagnosis[];
}

export interface BillingStatus {
  // Define billing status fields based on your needs
  [key: string]: any;
}

// Main Success Response Type
export interface SuccessResponse {
  success: true;
  status: number;
  data: SuccessData;
  billing_status: BillingStatus;
}

// Error Response Types
export interface ErrorDetail {
  code: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  status: string | number;
  error: ErrorDetail;
}

// Combined Response Type
export type DeepLeafResponse = SuccessResponse | ErrorResponse;

export interface UploadImageError {
  error: string;
}

export interface PositionData {
  latitude: number;
  longitude: number;
}

export type DistanceState =
  | 'GOOD_DISTANCE'
  | 'APPROACH'
  | 'BAD_DISTANCE'
  | 'VERY_BAD_DISTANCE'
  | 'NO_PLANT'
  | 'SKIP';

export interface DistanceLabels {
  GOOD_DISTANCE: string;
  APPROACH: string;
  BAD_DISTANCE: string;
  VERY_BAD_DISTANCE: string;
  NO_PLANT: string;
  SKIP: string;
}

// Default English labels
export const DEFAULT_DISTANCE_LABELS: DistanceLabels = {
  GOOD_DISTANCE: '👍 Good distance',
  APPROACH: '🤏 Approach a bit',
  BAD_DISTANCE: '❌ Bad distance',
  VERY_BAD_DISTANCE: '❌ Very bad distance',
  NO_PLANT: '🚫🌿 There is no plant in the frame',
  SKIP: 'skip',
};
