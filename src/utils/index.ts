import type {
  DeepLeafResponse,
  SuccessResponse,
  UnsupportedDiseaseError,
  LowResolutionError,
  InvalidApiKeyError,
  UnpaidSubscriptionError,
} from '../types';

// Helper type guard functions
export const isSuccessResponse = (
  response: DeepLeafResponse
): response is SuccessResponse => {
  return 'diagnoses_detected' in response;
};

export const isUnsupportedDiseaseError = (
  response: DeepLeafResponse
): response is UnsupportedDiseaseError => {
  return (
    'status' in response && response.status === 'unsupported_disease_error'
  );
};

export const isLowResolutionError = (
  response: DeepLeafResponse
): response is LowResolutionError => {
  return 'status' in response && response.status === 'low_resolution_image';
};

export const isInvalidApiKeyError = (
  response: DeepLeafResponse
): response is InvalidApiKeyError => {
  return (
    'detail' in response && response.detail === 'Invalid or inactive API key'
  );
};

export const isUnpaidSubscriptionError = (
  response: DeepLeafResponse
): response is UnpaidSubscriptionError => {
  return (
    'detail' in response &&
    typeof response.detail === 'string' &&
    response.detail.includes('admin')
  );
};
