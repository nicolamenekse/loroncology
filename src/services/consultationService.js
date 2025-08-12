import { getToken } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Doktorları getir
export const getDoctors = async () => {
  try {
    const response = await fetch(`${API_URL}/api/users/doctors`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Doktorlar getirilemedi');
    }

    return await response.json();
  } catch (error) {
    console.error('Doktorlar getirilirken hata:', error);
    throw error;
  }
};

// Konsültasyon gönderme
export const sendConsultation = async (consultationData) => {
  try {
    console.log('=== Service Konsültasyon Debug ===');
    console.log('Gönderilecek veri:', consultationData);
    console.log('API URL:', `${API_URL}/api/consultations`);
    
    const response = await fetch(`${API_URL}/api/consultations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(consultationData)
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const error = await response.json();
      console.log('Response error:', error);
      throw new Error(error.message || 'Konsültasyon gönderilemedi');
    }

    return await response.json();
  } catch (error) {
    console.error('Konsültasyon gönderilirken hata:', error);
    throw error;
  }
};

// Gelen konsültasyonları getir
export const getIncomingConsultations = async () => {
  try {
    const response = await fetch(`${API_URL}/api/consultations/incoming`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Konsültasyonlar getirilemedi');
    }

    return await response.json();
  } catch (error) {
    console.error('Konsültasyonlar getirilirken hata:', error);
    throw error;
  }
};

// Gönderilen konsültasyonları getir
export const getSentConsultations = async () => {
  try {
    const response = await fetch(`${API_URL}/api/consultations/sent`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Konsültasyonlar getirilemedi');
    }

    return await response.json();
  } catch (error) {
    console.error('Konsültasyonlar getirilirken hata:', error);
    throw error;
  }
};

// Konsültasyon durumunu güncelle
export const updateConsultationStatus = async (consultationId, status) => {
  try {
    const response = await fetch(`${API_URL}/api/consultations/${consultationId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Konsültasyon durumu güncellenemedi');
    }

    return await response.json();
  } catch (error) {
    console.error('Konsültasyon durumu güncellenirken hata:', error);
    throw error;
  }
};

// Konsültasyona mesaj gönder
export const sendMessage = async (consultationId, messageData) => {
  try {
    const response = await fetch(`${API_URL}/api/consultations/${consultationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(messageData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Mesaj gönderilemedi');
    }

    return await response.json();
  } catch (error) {
    console.error('Mesaj gönderilirken hata:', error);
    throw error;
  }
};

// Konsültasyon mesajlarını getir
export const getConsultationMessages = async (consultationId) => {
  try {
    const response = await fetch(`${API_URL}/api/consultations/${consultationId}/messages`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Mesajlar getirilemedi');
    }

    return await response.json();
  } catch (error) {
    console.error('Mesajlar getirilirken hata:', error);
    throw error;
  }
};

// Tüm konsültasyonları getir (gelen kutusu için)
export const getConsultationInbox = async () => {
  try {
    const response = await fetch(`${API_URL}/api/consultations/inbox`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Konsültasyonlar getirilemedi');
    }

    return await response.json();
  } catch (error) {
    console.error('Konsültasyonlar getirilirken hata:', error);
    throw error;
  }
};