import type { SearchRequest, SearchResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const BACKEND_BEARER = import.meta.env.VITE_BACKEND_BEARER || 'change_me';

/**
 * Service class for handling API calls to the backend
 */
class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Check if the API is healthy
   * @returns Promise with health status
   */
  async checkHealth(): Promise<{ ok: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/healthz`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * Search for places using the backend API
   * @param searchRequest - The search parameters
   * @returns Promise with search results
   */
  async searchPlaces(searchRequest: SearchRequest): Promise<SearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/places/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BACKEND_BEARER}`,
        },
        body: JSON.stringify(searchRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Search places failed:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default ApiService;