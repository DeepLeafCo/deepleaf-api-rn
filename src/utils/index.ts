import type {
  DeepLeafResponse,
  ErrorResponse,
  SuccessResponse,
} from '../types';

export const isSuccessResponse = (
  response: DeepLeafResponse
): response is SuccessResponse => {
  return 'success' in response && response.success === true;
};

export const isErrorResponse = (
  response: DeepLeafResponse
): response is ErrorResponse => {
  return 'success' in response && response.success === false;
};

export const isErrorWithCode = (
  response: DeepLeafResponse,
  code: string
): response is ErrorResponse => {
  return isErrorResponse(response) && response.error.code === code;
};
