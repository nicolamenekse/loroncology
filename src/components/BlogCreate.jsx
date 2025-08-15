import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import { createBlog } from '../services/blogService';

const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? 'https://loroncology.onrender.com' : 'http://localhost:5000');

const BlogCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: '',
    tags: [],
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tagInput, setTagInput] = useState('');

  const categories = ['Onkoloji', 'Tedavi Yöntemleri', 'Hasta Bakımı', 'Araştırmalar', 'Genel'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Blog kaydediliyor ve görsel oluşturuluyor...');
      const savedBlog = await createBlog(formData);
      console.log('Blog başarıyla kaydedildi:', savedBlog);
      navigate(`/blog/${savedBlog.slug}`);
    } catch (err) {
      console.error('Blog kaydetme hatası:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ 
      py: 6,
      background: '#F8FAFC',
      minHeight: '100vh'
    }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        color: '#101828',
        fontWeight: 700,
        fontSize: '28px',
        mb: 2
      }}>
        Yeni Blog Yazısı
      </Typography>

      <Paper elevation={0} sx={{ 
        p: 4, 
        mt: 3,
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #EAECF0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
      }}>
        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={4}>
            {/* Görsel Önizleme */}
            {formData.category && (
              <Box
                sx={{
                  width: '100%',
                  height: '300px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  mb: 3,
                  position: 'relative',
                  background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #CBD5E1'
                }}
              >
                <Box textAlign="center" sx={{ p: 3 }}>
                  <Box sx={{ fontSize: 48, color: '#64748B', mb: 2 }}>🎨</Box>
                  <Typography variant="h6" color="#475569" gutterBottom sx={{ fontWeight: 600 }}>
                    {formData.category} Kategorisi
                  </Typography>
                  <Typography variant="body2" color="#64748B" sx={{ maxWidth: 400 }}>
                    Blog kaydedildiğinde "{formData.category}" kategorisine uygun, AI tarafından üretilen görsel otomatik olarak oluşturulacak ve kalıcı olarak kaydedilecektir.
                  </Typography>
                </Box>
                
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(24, 119, 242, 0.9) 0%, rgba(24, 119, 242, 0) 100%)',
                    p: 3,
                    color: 'white'
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    ✨ AI Görsel Üretimi Aktif
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Her blog için benzersiz, kategoriye uygun görsel
                  </Typography>
                </Box>
              </Box>
            )}

            <Alert severity="info" sx={{ 
              mb: 3,
              borderRadius: '12px',
              border: '1px solid #D0E7FF',
              backgroundColor: '#F0F9FF',
              '& .MuiAlert-icon': { color: '#1877F2' }
            }}>
              <Typography variant="body2" color="#0C4A6E">
                <strong>AI Görsel Üretimi:</strong> Blog kaydedildiğinde "{formData.category || 'seçilen kategori'}" kategorisine uygun görsel otomatik olarak oluşturulacak ve kalıcı olarak kaydedilecektir. Her blog için benzersiz, profesyonel görsel.
              </Typography>
            </Alert>

            <TextField
              name="title"
              label="Başlık"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '& fieldset': { borderColor: '#EAECF0' },
                  '&:hover fieldset': { borderColor: '#D0D5DD' },
                  '&.Mui-focused fieldset': { borderColor: '#1877F2' }
                }
              }}
            />

            <TextField
              name="summary"
              label="Özet"
              value={formData.summary}
              onChange={handleChange}
              required
              fullWidth
              multiline
              rows={2}
              helperText="150-200 karakter arası bir özet yazın"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '& fieldset': { borderColor: '#EAECF0' },
                  '&:hover fieldset': { borderColor: '#D0D5DD' },
                  '&.Mui-focused fieldset': { borderColor: '#1877F2' }
                }
              }}
            />

            <TextField
              name="content"
              label="İçerik"
              value={formData.content}
              onChange={handleChange}
              required
              fullWidth
              multiline
              rows={10}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '& fieldset': { borderColor: '#EAECF0' },
                  '&:hover fieldset': { borderColor: '#D0D5DD' },
                  '&.Mui-focused fieldset': { borderColor: '#1877F2' }
                }
              }}
            />

            <FormControl fullWidth required>
              <InputLabel>Kategori</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Kategori"
                sx={{
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#EAECF0' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D0D5DD' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1877F2' }
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <TextField
                label="Etiketler"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                fullWidth
                helperText="Enter tuşuna basarak etiket ekleyin"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': { borderColor: '#EAECF0' },
                    '&:hover fieldset': { borderColor: '#D0D5DD' },
                    '&.Mui-focused fieldset': { borderColor: '#1877F2' }
                  }
                }}
              />
              <Box display="flex" gap={1} flexWrap="wrap" mt={2} sx={{ minHeight: '40px' }}>
                {formData.tags.length === 0 ? (
                  <Typography variant="body2" color="#98A2B3" sx={{ fontStyle: 'italic' }}>
                    Henüz etiket eklenmedi
                  </Typography>
                ) : (
                  formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      sx={{
                        backgroundColor: '#F1F5F9',
                        color: '#475569',
                        '&:hover': { backgroundColor: '#E2E8F0' }
                      }}
                    />
                  ))
                )}
              </Box>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Durum</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Durum"
                sx={{
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#EAECF0' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D0D5DD' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1877F2' }
                }}
              >
                <MenuItem value="draft">Taslak</MenuItem>
                <MenuItem value="published">Yayınla</MenuItem>
              </Select>
            </FormControl>

            {error && (
              <Alert severity="error" sx={{ 
                mt: 2,
                borderRadius: '12px',
                border: '1px solid #FEE4E2',
                backgroundColor: '#FEF3F2'
              }}>
                <Typography variant="body2" color="#D92D20">
                  {error}
                </Typography>
              </Alert>
            )}

            <Box display="flex" gap={3} justifyContent="flex-end" sx={{ pt: 2 }}>
                          <Button
              type="button"
              variant="outlined"
              onClick={() => navigate('/blog')}
              disabled={loading}
              sx={{
                borderColor: '#667085',
                color: '#667085',
                textTransform: 'none',
                fontWeight: 500,
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                '&:hover': { 
                  borderColor: '#475569',
                  backgroundColor: '#F8FAFC'
                }
              }}
            >
              İptal
            </Button>
                          <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
              sx={{
                backgroundColor: '#1877F2',
                '&:hover': { backgroundColor: '#166FE0' },
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: '12px'
              }}
            >
              {loading ? 'Blog Kaydediliyor ve Görsel Oluşturuluyor...' : 'Blog Kaydet'}
            </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default BlogCreate;