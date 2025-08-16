import { getToken } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Okunmamış konsültasyon sayısını getir
export const getUnreadConsultationCount = async () => {
  try {
    const response = await fetch(`${API_URL}/api/consultations/unread-count`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Bildirim sayısı getirilemedi');
    }

    return await response.json();
  } catch (error) {
    console.error('Bildirim sayısı getirilirken hata:', error);
    return { unreadCount: 0 };
  }
};

// Konsültasyonu okundu olarak işaretle
export const markConsultationAsRead = async (consultationId) => {
  try {
    const response = await fetch(`${API_URL}/api/consultations/${consultationId}/mark-read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Konsültasyon okundu olarak işaretlenemedi');
    }

    return await response.json();
  } catch (error) {
    console.error('Konsültasyon okundu olarak işaretlenirken hata:', error);
    throw error;
  }
};

// Tüm konsültasyonları okundu olarak işaretle
export const markAllConsultationsAsRead = async () => {
  try {
    const response = await fetch(`${API_URL}/api/consultations/mark-all-read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Konsültasyonlar okundu olarak işaretlenemedi');
    }

    return await response.json();
  } catch (error) {
    console.error('Konsültasyonlar okundu olarak işaretlenirken hata:', error);
    throw error;
  }
};
