export const createBlog = async (blogData) => {
  try {
    // Backend'de görsel oluşturma işlemi yapılacak
    const response = await fetch('/api/blogs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blogData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Blog kaydedilemedi');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Blog kaydedilirken hata:', error);
    throw error;
  }
};

export const getAllBlogs = async (filters = {}) => {
  try {
    const queryString = new URLSearchParams(filters).toString();
    const response = await fetch(`/api/blogs?${queryString}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Bloglar getirilemedi');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Bloglar getirilirken hata:', error);
    throw error;
  }
};

export const getBlogBySlug = async (slug) => {
  try {
    const response = await fetch(`/api/blogs/${slug}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Blog bulunamadı');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Blog getirilirken hata:', error);
    throw error;
  }
};

export const updateBlog = async (id, updateData) => {
  try {
    const response = await fetch(`/api/blogs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Blog güncellenemedi');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Blog güncellenirken hata:', error);
    throw error;
  }
};

export const deleteBlog = async (id) => {
  try {
    const response = await fetch(`/api/blogs/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Blog silinemedi');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Blog silinirken hata:', error);
    throw error;
  }
};