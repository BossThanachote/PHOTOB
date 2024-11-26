import { getAuthHeaders } from '../utils/auth';

// Types
interface PhotoResponse {
  status: string;
  message: string;
  data: {
    id: string;
    MachineID: string;
    name: string;
    ImageUrl: string;
    status: string;
  };
}

interface PhotoUploadData {
  machine_code: string;
  file: File | Blob | string;
}

// Constants
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://watt-photo-booth-api-production.up.railway.app';
const API_PREFIX = '/api/v1/client';

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

const preparePhotoFormData = async (data: PhotoUploadData): Promise<FormData> => {
  const formData = new FormData();
  formData.append('machine_code', data.machine_code);

  try {
    if (data.file instanceof File || data.file instanceof Blob) {
      formData.append('file', data.file);
    } else if (typeof data.file === 'string' && data.file.startsWith('data:')) {
      // Handle base64 string
      const response = await fetch(data.file);
      const blob = await response.blob();
      formData.append('file', blob, 'photo.png');
    }

    // Log form data for debugging
    console.log('FormData prepared:', {
      machine_code: data.machine_code,
      hasFile: formData.has('file')
    });

    return formData;
  } catch (error) {
    console.error('Error preparing form data:', error);
    throw error;
  }
};

export const photoService = {
  // Upload photo
  uploadPhoto: async (data: PhotoUploadData): Promise<PhotoResponse> => {
    try {
      const formData = await preparePhotoFormData(data);

      console.log('Uploading photo:', {
        url: `${BASE_URL}${API_PREFIX}/photo/${data.machine_code}`,
        machine_code: data.machine_code
      });

      const response = await fetch(
        `${BASE_URL}${API_PREFIX}/photo/${data.machine_code}`,
        {
          method: 'POST',
          body: formData,
          headers: {
            // ไม่ใส่ Content-Type เพราะ FormData จะจัดการให้
            'Accept': 'application/json',
            ...getAuthHeaders()
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
      }

      const result = await handleApiResponse<PhotoResponse>(response);
      console.log('Upload success:', result);
      return result;

    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  },

  // Get photo by ID
  getPhotoById: async (id: string): Promise<PhotoResponse> => {
    try {
      console.log('Fetching photo with ID:', id);

      const response = await fetch(
        `${BASE_URL}${API_PREFIX}/photo/${id}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            ...getAuthHeaders()
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
      }

      const result = await handleApiResponse<PhotoResponse>(response);
      console.log('Fetch success:', result);
      return result;

    } catch (error) {
      console.error(`Error fetching photo ${id}:`, error);
      throw error;
    }
  }
};

export default photoService;