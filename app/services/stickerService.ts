import { getAuthHeaders, isAuthenticated } from '../utils/auth';
import {
  APISticker,
  Sticker,
  StickerResponse,
  StickerService,
  StickerUpdateData,
  StickerUploadData,
  StatusType,
  QueryParams,
  ApiError
} from '@/types/types';

// Constants
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://watt-photo-booth-api-production.up.railway.app';
const API_PREFIX = '/api/v1/admin';

// Helper Functions
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText;
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

const checkAuthentication = () => {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }
};

const mapStickerResponse = (apiSticker: APISticker): Sticker => ({
  id: apiSticker.id,
  no: apiSticker.code,
  stickerName: apiSticker.name,
  sticker: apiSticker.image_url,
  status: apiSticker.status.charAt(0).toUpperCase() + apiSticker.status.slice(1) as StatusType,
  date: apiSticker.created_at || new Date().toISOString()
});

const isFileOrBlob = (value: any): value is File | Blob => {
  return value instanceof File || value instanceof Blob;
};

const isBase64String = (value: string): boolean => {
  return value.startsWith('data:');
};

const prepareFormData = async (data: StickerUploadData): Promise<FormData> => {
  const formData = new FormData();
  formData.append('name', data.stickerName);
  formData.append('status', data.status.toLowerCase());

  if (isFileOrBlob(data.sticker)) {
    formData.append('file', data.sticker);
  } else if (typeof data.sticker === 'string') {
    if (isBase64String(data.sticker)) {
      const response = await fetch(data.sticker);
      const blob = await response.blob();
      formData.append('file', blob, 'sticker.png');
    } else {
      formData.append('file', data.sticker);
    }
  }

  return formData;
};

const buildQueryString = (params?: QueryParams): string => {
  if (!params) return '';

  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.status) queryParams.append('status', params.status.toLowerCase());
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);

  return queryParams.toString() ? `?${queryParams.toString()}` : '';
};

export const stickerService: StickerService = {
  // Get all stickers with pagination
  getStickers: async (params?: QueryParams): Promise<StickerResponse> => {
    try {
      checkAuthentication();

      const queryString = buildQueryString(params);
      const response = await fetch(
        `${BASE_URL}${API_PREFIX}/stickers${queryString}`,
        {
          headers: getAuthHeaders()
        }
      );
      
      const result = await handleApiResponse<{ status: string; message: string; data: APISticker[]; total: number; page: number; limit: number }>(response);
      
      return {
        items: result.data.map(mapStickerResponse),
        total: result.total,
        page: result.page,
        limit: result.limit
      };
    } catch (error) {
      console.error('Error fetching stickers:', error);
      throw error;
    }
  },

  // Get single sticker
  getStickerById: async (id: string): Promise<Sticker> => {
    try {
      checkAuthentication();

      const response = await fetch(
        `${BASE_URL}${API_PREFIX}/sticker/${id}`,
        {
          headers: getAuthHeaders()
        }
      );
      
      const result = await handleApiResponse<{ data: APISticker }>(response);
      return mapStickerResponse(result.data);
    } catch (error) {
      console.error(`Error fetching sticker ${id}:`, error);
      throw error;
    }
  },

  // Create new sticker
  createSticker: async (data: StickerUploadData): Promise<Sticker> => {
    try {
      checkAuthentication();
      
      const formData = await prepareFormData(data);

      const response = await fetch(
        `${BASE_URL}${API_PREFIX}/sticker/upload`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData
        }
      );

      const result = await handleApiResponse<{ data: APISticker }>(response);
      return mapStickerResponse(result.data);
    } catch (error) {
      console.error('Error creating sticker:', error);
      throw error;
    }
  },

  // Update sticker details
  updateSticker: async (id: string, data: StickerUpdateData): Promise<Sticker> => {
    try {
      checkAuthentication();

      const response = await fetch(
        `${BASE_URL}${API_PREFIX}/sticker/${id}`,
        {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: data.stickerName,
            status: data.status?.toLowerCase()
          })
        }
      );

      const result = await handleApiResponse<{ data: APISticker }>(response);
      return mapStickerResponse(result.data);
    } catch (error) {
      console.error(`Error updating sticker ${id}:`, error);
      throw error;
    }
  },

  // Update sticker status
  updateStickerStatus: async (id: string, status: StatusType): Promise<Sticker> => {
    try {
      const result = await stickerService.updateSticker(id, { status });
      return result;
    } catch (error) {
      console.error(`Error updating sticker status ${id}:`, error);
      throw error;
    }
  },

  // Update sticker image
  updateStickerImage: async (id: string, imageData: File | Blob | string): Promise<Sticker> => {
    try {
      checkAuthentication();

      const formData = new FormData();
      
      if (isFileOrBlob(imageData)) {
        formData.append('file', imageData);
      } else if (isBase64String(imageData)) {
        const response = await fetch(imageData);
        const blob = await response.blob();
        formData.append('file', blob, 'sticker.png');
      } else {
        throw new Error('Invalid image format');
      }

      const response = await fetch(
        `${BASE_URL}${API_PREFIX}/sticker/${id}/upload`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: formData
        }
      );

      const result = await handleApiResponse<{ data: APISticker }>(response);
      return mapStickerResponse(result.data);
    } catch (error) {
      console.error(`Error updating sticker image ${id}:`, error);
      throw error;
    }
  },

  // Delete sticker
  deleteSticker: async (id: string): Promise<void> => {
    try {
      checkAuthentication();

      const response = await fetch(
        `${BASE_URL}${API_PREFIX}/sticker/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders()
        }
      );

      await handleApiResponse(response);
    } catch (error) {
      console.error(`Error deleting sticker ${id}:`, error);
      throw error;
    }
  }
};

export default stickerService;