const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getToken = () => localStorage.getItem('token');

export const updateProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Profil güncellenirken bir hata oluştu');
    }

    return await response.json();
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    throw error;
  }
};

export const fetchUserProfile = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Profil bilgileri alınamadı');
    }

    return await response.json();
  } catch (error) {
    console.error('Profil bilgileri getirme hatası:', error);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Giriş yapılırken bir hata oluştu');
    }

    return await response.json();
  } catch (error) {
    console.error('Giriş hatası:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Kayıt olurken bir hata oluştu');
    }

    return await response.json();
  } catch (error) {
    console.error('Kayıt hatası:', error);
    throw error;
  }
};