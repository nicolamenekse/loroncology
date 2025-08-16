import { getToken } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const sendConnectionRequest = async (receiverId) => {
  try {
    const response = await fetch(`${API_URL}/api/colleagues/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ receiverId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return await response.json();
  } catch (error) {
    console.error('Bağlantı isteği gönderme hatası:', error);
    throw error;
  }
};

export const respondToConnectionRequest = async (connectionId, status) => {
  try {
    const response = await fetch(`${API_URL}/api/colleagues/respond`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ connectionId, status })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return await response.json();
  } catch (error) {
    console.error('Bağlantı isteği yanıtlama hatası:', error);
    throw error;
  }
};

export const getConnections = async () => {
  try {
    const response = await fetch(`${API_URL}/api/colleagues/connections`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return await response.json();
  } catch (error) {
    console.error('Bağlantıları getirme hatası:', error);
    throw error;
  }
};

// Tüm doktorları getir (meslektaş listesi için)
export const getAllDoctors = async () => {
  try {
    const response = await fetch(`${API_URL}/api/users/all-doctors`, {
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
    console.error('Tüm doktorlar getirilirken hata:', error);
    throw error;
  }
};

// Bağlantıyı kaldır
export const removeConnection = async (connectionId) => {
  try {
    const response = await fetch(`${API_URL}/api/colleagues/remove/${connectionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Bağlantı kaldırılamadı');
    }

    return await response.json();
  } catch (error) {
    console.error('Bağlantı kaldırılırken hata:', error);
    throw error;
  }
};

// Bekleyen arkadaşlık istekleri sayısını getir
export const getPendingConnectionCount = async () => {
  try {
    const response = await fetch(`${API_URL}/api/colleagues/pending-count`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Bekleyen istek sayısı getirilemedi');
    }

    return await response.json();
  } catch (error) {
    console.error('Bekleyen istek sayısı getirilirken hata:', error);
    return { pendingCount: 0 };
  }
};
