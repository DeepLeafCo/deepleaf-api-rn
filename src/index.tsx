// src/index.ts

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { DeepLeafConfig, DeepLeafResponse } from './types';

const DEFAULT_ENDPOINT = 'https://api.deepleaf.io/';

export class DeepLeafAPI {
  private apiKey: string;
  private readonly client: AxiosInstance;
  private language: string;

  constructor(config: DeepLeafConfig) {
    this.apiKey = config.apiKey;
    this.language = config.language || 'en';

    this.client = axios.create({
      baseURL: config.endpoint || DEFAULT_ENDPOINT,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Upload an image for plant disease diagnosis
   * @param imageUri - Local URI of the image to upload
   * @returns Promise with the diagnosis response
   */
  async uploadImage(imageUri: string): Promise<DeepLeafResponse> {
    try {
      if (!imageUri) {
        return {
          success: false,
          error: { code: 'NO_IMAGE', message: 'No image URI provided' },
          data: null,
        };
      }

      const formData = new FormData();

      // Append image file
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'plant_image.jpg',
      });

      const response = await this.client.post<DeepLeafResponse>(
        `/analyze?language=${this.language}&api_key=${this.apiKey}`,
        formData
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // If the response contains API error data, return it directly
        if (error.response?.data) {
          return error.response.data as DeepLeafResponse;
        }

        // Basic error response
        return {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: error.message || 'Network error',
          },
          data: null,
          meta: {
            status: error.response?.status || 500,
          },
        };
      }

      // For non-Axios errors
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
        data: null,
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
        // If the response contains API error data, return it directly
        if (error.response?.data) {
          return error.response.data as DeepLeafResponse;
        }

        // Basic error response
        return {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: error.message || 'Network error',
          },
          data: null,
          meta: {
            status: error.response?.status || 500,
          },
        };
      }

      // For non-Axios errors
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
        data: null,
      };
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
      this.language = config.language;
    }
    if (config.endpoint) {
      this.client.defaults.baseURL = config.endpoint;
    }
  }
}

// Export type definitions
export * from './types';
