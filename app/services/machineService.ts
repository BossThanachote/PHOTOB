import { getAuthHeaders, isAuthenticated } from '../utils/auth';
import { StatusType } from '@/types/types';

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

export const machineService = {
  // Create new machine
 // Create new machine
createMachine: async (data: { 
  name: string; 
  status: string;
}) => {
  try {
    checkAuthentication();
    const response = await fetch(
      `${BASE_URL}${API_PREFIX}/machine`,
      {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          status: data.status.toLowerCase()
        })
      }
    );
    
    // ตรวจสอบและดึงข้อมูลจาก response
    const result = await handleApiResponse<{
      status: string;
      data: {
        id: string;
        code: string;
        name: string;
        status: StatusType;
      };
    }>(response);

    return result;
  } catch (error) {
    console.error('Error creating machine:', error);
    throw error;
  }
},

  // Get all machines
  getTransactions: async () => {
    try {
      checkAuthentication();
      const response = await fetch(
        `${BASE_URL}${API_PREFIX}/machines?page=1&limit=50`,
        {
          headers: getAuthHeaders()
        }
      );
      const result = await handleApiResponse<{ status: string; message: string; data: any[] }>(response);
      return result.data;
    } catch (error) {
      console.error('Error fetching machines:', error);
      throw error;
    }
  },

  // Get single machine
  getTransactionById: async (id: string) => {
    try {
      checkAuthentication();
      const response = await fetch(
        `${BASE_URL}${API_PREFIX}/machine/${id}`,
        {
          headers: getAuthHeaders()
        }
      );
      const result = await handleApiResponse<{ status: string; message: string; data: any }>(response);
      return result.data;
    } catch (error) {
      console.error('Error fetching machine:', error);
      throw error;
    }
  },

  // Update machine
  updateMachine: async (id: string, data: { 
    name: string; 
    status: string;
  }) => {
    try {
      checkAuthentication();
      const response = await fetch(
        `${BASE_URL}${API_PREFIX}/machine/${id}`,
        {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: data.name,
            status: data.status.toLowerCase()
          })
        }
      );
      const result = await handleApiResponse(response);
      return result;
    } catch (error) {
      console.error('Error updating machine:', error);
      throw error;
    }
  },

  // Update frame list for machine
  updateMachineFrames: async (id: string, frames: any[]) => {
    try {
      checkAuthentication();
      const response = await fetch(
        `${BASE_URL}${API_PREFIX}/machine/${id}/frames`,
        {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ frames })
        }
      );
      return await handleApiResponse(response);
    } catch (error) {
      console.error('Error updating machine frames:', error);
      throw error;
    }
  },

  // Update sticker list for machine
  updateMachineStickers: async (id: string, stickers: any[]) => {
    try {
      checkAuthentication();
      const response = await fetch(
        `${BASE_URL}${API_PREFIX}/machine/${id}/stickers`,
        {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ stickers })
        }
      );
      return await handleApiResponse(response);
    } catch (error) {
      console.error('Error updating machine stickers:', error);
      throw error;
    }
  },

  // Search machines
  searchTransactions: async (searchTerm: string) => {
    try {
      checkAuthentication();
      const response = await fetch(
        `${BASE_URL}${API_PREFIX}/machines?page=1&limit=50&query=${searchTerm}`,
        {
          headers: getAuthHeaders()
        }
      );
      const result = await handleApiResponse<{ status: string; message: string; data: any[] }>(response);
      return result.data;
    } catch (error) {
      console.error('Error searching machines:', error);
      throw error;
    }
  },

  // Delete machine
  deleteTransaction: async (id: string) => {
    try {
      checkAuthentication();
      const response = await fetch(
        `${BASE_URL}${API_PREFIX}/machine/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders()
        }
      );
      await handleApiResponse(response);
      return null;
    } catch (error) {
      console.error('Error deleting machine:', error);
      throw error;
    }
  }
};

export default machineService;