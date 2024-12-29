// src/types.ts
export interface DeepLeafConfig {
  apiKey: string;
  language?: string;
  endpoint?: string;
}

// Success Response Type (200/201)
export interface ImageFeedback {
  distance: 'good' | 'bad' | 'very_bad' | 'no_plant';
  focus: 'good' | 'bad';
  sample_images: string[] | null;
}

export interface Diagnosis {
  common_name: string;
  diagnosis_likelihood: string;
  eppo_code: string;
  hosts: string[];
  image_references: string[];
  pathogen_class: string;
  peat_id: number;
  preventive_measures: string[];
  scientific_name: string;
  symptoms: string;
  symptoms_short: string[];
  treatment_chemical: string;
  treatment_organic: string;
  trigger: string;
}

export interface SuccessResponse {
  crops: string[];
  diagnoses_detected: boolean;
  errors: string[];
  image_feedback: ImageFeedback;
  image_id: string;
  predicted_diagnoses: Diagnosis[];
  deepleaf_trace_id: string;
}

// Error Response Types
export interface UnsupportedDiseaseError {
  status: 'unsupported_disease_error';
  message: string;
  errors: Array<{
    message: string;
    type: 'unknown_disease';
    user_message: string | null;
  }>;
}

export interface LowResolutionError {
  status: 'low_resolution_image';
  message: string;
}

export interface InvalidApiKeyError {
  detail: 'Invalid or inactive API key';
}

export interface UnpaidSubscriptionError {
  detail: string; // Message about contacting admin
}

// Combined Response Type
export type DeepLeafResponse =
  | SuccessResponse
  | UnsupportedDiseaseError
  | LowResolutionError
  | InvalidApiKeyError
  | UnpaidSubscriptionError;

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
