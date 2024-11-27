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

// API function to fetch machines
const fetchMachines = async () => {
  const response = await fetch(
    `${BASE_URL}${API_PREFIX}/machines?page=1&limit=50`,
    {
      headers: getAuthHeaders()
    }
  );
  const result = await handleApiResponse<{ status: string; message: string; data: any[] }>(response);
  return result.data;
};

export const machineService = {
  // Get all machines
  getTransactions: async () => {
    try {
      checkAuthentication();
      return await fetchMachines();
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

  // Update machine status
  updateTransactionStatus: async (id: string, status: StatusType) => {
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
          body: JSON.stringify({ status: status.toLowerCase() })
        }
      );
      await handleApiResponse(response);
      
      // Refresh the list after update
      return await fetchMachines();
    } catch (error) {
      console.error('Error updating machine status:', error);
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
      
      // Refresh the list after deletion
      return await fetchMachines();
    } catch (error) {
      console.error('Error deleting machine:', error);
      throw error;
    }
  },
};

export default machineService;