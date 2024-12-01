import { getAuthHeaders, isAuthenticated } from '../utils/auth';
import {
  Frame,
  FrameResponse,
  FrameUpdateData,
  FrameUploadData,
  StatusType,
  QueryParams,
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

const mapFrameResponse = (apiFrame: any): Frame => ({
  id: apiFrame.id,
  no: apiFrame.code,
  frameName: apiFrame.name,
  frame: apiFrame.image_url,
  status: apiFrame.status.charAt(0).toUpperCase() + apiFrame.status.slice(1) as StatusType,
  shot: Number(apiFrame.shot) || 0,
  date: apiFrame.created_at || new Date().toISOString()
});

const isFileOrBlob = (value: any): value is File | Blob => {
  return value instanceof File || value instanceof Blob;
};

const isBase64String = (value: string): boolean => {
  return value.startsWith('data:');
};

const prepareFormData = async (data: FrameUploadData): Promise<FormData> => {
  const formData = new FormData();
  formData.append('name', data.frameName);
  formData.append('status', data.status.toLowerCase());
  
  // Make sure shot is being sent
  if (data.shot !== undefined) {
    formData.append('shot', data.shot.toString());
    console.log('Sending shot in formData:', data.shot);
  }

  if (isFileOrBlob(data.frame)) {
    formData.append('file', data.frame);
  } else if (typeof data.frame === 'string') {
    if (isBase64String(data.frame)) {
      const response = await fetch(data.frame);
      const blob = await response.blob();
      formData.append('file', blob, 'frame.png');
    } else {
      formData.append('file', data.frame);
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

export const frameService = {
  // Get all frames with pagination
  getFrames: async (params?: QueryParams): Promise<FrameResponse> => {
    try {
      checkAuthentication();

      const queryString = buildQueryString(params);
      const response = await fetch(
        `${BASE_URL}${API_PREFIX}/frames${queryString}`,
        {
          headers: getAuthHeaders()
        }
      );
      
      const result = await handleApiResponse<{ status: string; message: string; data: any[]; total: number; page: number; limit: number }>(response);
      
      return {
        items: result.data.map(mapFrameResponse),
        total: result.total,
        page: result.page,
        limit: result.limit
      };
    } catch (error) {
      console.error('Error fetching frames:', error);
      throw error;
    }
  },

  // Get single frame
  getFrameById: async (id: string): Promise<Frame> => {
    try {
      checkAuthentication();

      const response = await fetch(
        `${BASE_URL}${API_PREFIX}/frame/${id}`,
        {
          headers: getAuthHeaders()
        }
      );
      
      const result = await handleApiResponse<{ data: any }>(response);
      return mapFrameResponse(result.data);
    } catch (error) {
      console.error(`Error fetching frame ${id}:`, error);
      throw error;
    }
  },

  // Create new frame
  createFrame: async (data: FrameUploadData): Promise<Frame> => {
    try {
      checkAuthentication();
      
      const formData = await prepareFormData(data);

      const response = await fetch(
        `${BASE_URL}${API_PREFIX}/frame/upload`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData
        }
      );

      const result = await handleApiResponse<{ data: any }>(response);
      return mapFrameResponse(result.data);
    } catch (error) {
      console.error('Error creating frame:', error);
      throw error;
    }
  },

  // Update frame details
  updateFrame: async (id: string, data: FrameUpdateData): Promise<Frame> => {
    try {
      checkAuthentication();

      const response = await fetch(
        `${BASE_URL}${API_PREFIX}/frame/${id}`,
        {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: data.frameName,
            status: data.status?.toLowerCase(),
            shot: data.shot
          })
        }
      );

      const result = await handleApiResponse<{ status: string; message: string; data?: any }>(response);
      
      // ตรวจสอบว่ามี data กลับมาไหม
      if (!result.data) {
        // ถ้าไม่มี data แต่ status success ให้ fetch ข้อมูล frame ใหม่
        if (result.status === 'success') {
          const updatedFrame = await frameService.getFrameById(id);
          return updatedFrame;
        }
        throw new Error('Failed to update frame: No data returned');
      }

      return mapFrameResponse(result.data);
    } catch (error) {
      console.error(`Error updating frame ${id}:`, error);
      throw error;
    }
},

  // Update frame status
  updateFrameStatus: async (id: string, status: StatusType): Promise<Frame> => {
    try {
      const result = await frameService.updateFrame(id, { status });
      return result;
    } catch (error) {
      console.error(`Error updating frame status ${id}:`, error);
      throw error;
    }
  },

  // Update frame image
  updateFrameImage: async (id: string, imageData: File | Blob | string): Promise<Frame> => {
    try {
      checkAuthentication();

      const formData = new FormData();
      
      if (isFileOrBlob(imageData)) {
        formData.append('file', imageData);
      } else if (isBase64String(imageData)) {
        const response = await fetch(imageData);
        const blob = await response.blob();
        formData.append('file', blob, 'frame.png');
      } else {
        throw new Error('Invalid image format');
      }

      const response = await fetch(
        `${BASE_URL}${API_PREFIX}/frame/${id}/upload`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: formData
        }
      );

      const result = await handleApiResponse<{ data: any }>(response);
      return mapFrameResponse(result.data);
    } catch (error) {
      console.error(`Error updating frame image ${id}:`, error);
      throw error;
    }
  },

  // Delete frame
  deleteFrame: async (id: string): Promise<void> => {
    try {
      checkAuthentication();

      const response = await fetch(
        `${BASE_URL}${API_PREFIX}/frame/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders()
        }
      );

      await handleApiResponse(response);
    } catch (error) {
      console.error(`Error deleting frame ${id}:`, error);
      throw error;
    }
  }
};

export default frameService;