import { NativeModules, Platform } from 'react-native';
import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  DeepLeafConfig,
  DeepLeafResponse,
  PositionData,
  UploadImageError,
} from './types';
import { isSuccessResponse, isErrorResponse, isErrorWithCode } from './utils';

const LINKING_ERROR =
  `The package 'deepleaf-api-rn' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const DeepleafApiRn = NativeModules.DeepleafApiRn
  ? NativeModules.DeepleafApiRn
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const DEFAULT_ENDPOINT = 'https://api.deepleaf.io/';

export class DeepLeafAPI {
  private apiKey: string;
  private readonly client: AxiosInstance;
  private readonly language: string;
  private readonly nativeModule: typeof DeepleafApiRn;

  constructor(config: DeepLeafConfig) {
    this.apiKey = config.apiKey;
    this.language = config.language || 'en';
    this.nativeModule = DeepleafApiRn;

    this.client = axios.create({
      baseURL: config.endpoint || DEFAULT_ENDPOINT,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
        'User-Agent': `DeepLeaf-RN-SDK/${Platform.OS}`,
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          const errorData = error.response.data as DeepLeafResponse;
          if (isErrorWithCode(errorData, 'API_KEY_NOT_FOUND')) {
            throw new Error('Invalid API key provided');
          } else if (isErrorWithCode(errorData, 'INSUFFICIENT_BALANCE')) {
            throw new Error('Subscription payment required');
          }
        }
        throw error;
      }
    );
  }

  /**
   * Upload an image for plant disease diagnosis
   * @param imageUri - Local URI of the image to upload
   * @param location - Optional location data
   * @returns Promise with the diagnosis response
   */
  async uploadImage(
    imageUri: string,
    location?: PositionData
  ): Promise<DeepLeafResponse | UploadImageError> {
    try {
      if (!imageUri) {
        return { error: 'No image URI provided' };
      }

      const formData = new FormData();

      // Append image file
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'plant_image.jpg',
      });

      let url = `/analyze?language=${this.language}&api_key=${this.apiKey}`;

      // Append location data as query parameters if available
      if (location) {
        url += `&lat=${location.latitude}&lon=${location.longitude}`;
      }

      const response = await this.client.post<DeepLeafResponse>(
        url, // Use the constructed URL with lat/lon as query parameters
        formData
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorResponse = error.response?.data as DeepLeafResponse;

        if (isErrorResponse(errorResponse)) {
          return errorResponse;
        }

        return {
          error: `API request failed: ${error.response?.status} ${error.response?.statusText}`,
        };
      }

      return {
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get previous diagnosis by image ID
   * @param imageId - ID of the previously uploaded image
   * @returns Promise with the diagnosis response
   */
  async getDiagnosis(imageId: string): Promise<DeepLeafResponse> {
    try {
      const response = await this.client.get<DeepLeafResponse>(
        `/diagnoses/${imageId}?language=${this.language}&api_key=${this.apiKey}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to fetch diagnosis: ${error.response?.status} ${error.response?.statusText}`
        );
      }
      throw error;
    }
  }

  /**
   * Update API configuration
   * @param config - New configuration options
   */
  updateConfig(config: Partial<DeepLeafConfig>): void {
    if (config.apiKey) {
      this.apiKey = config.apiKey;
    }
    if (config.language) {
      this.client.defaults.headers['Accept-Language'] = config.language;
    }
    if (config.endpoint) {
      this.client.defaults.baseURL = config.endpoint;
    }
  }

  /**
   * Check if the response indicates a successful diagnosis
   * @param response - The API response to check
   * @returns boolean indicating if diagnosis was successful
   */
  static isSuccessful(response: DeepLeafResponse): boolean {
    return isSuccessResponse(response) && response.data.diagnoses_detected;
  }

  multiply(a: number, b: number): Promise<number> {
    return this.nativeModule.multiply(a, b);
  }
}

// Export type definitions and hooks
export * from './types';
export * from './hooks/useAppState';
export * from './hooks/useLocationService';
export * from './hooks/usePermissions';
export * from './utils';
