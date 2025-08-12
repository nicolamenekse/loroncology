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
      // Backend'de görsel oluşturma işlemi yapılacak
      const savedBlog = await createBlog(formData);
      navigate(`/blog/${savedBlog.slug}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Yeni Blog Yazısı
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Görsel Önizleme */}
            {formData.category && (
              <Box
                sx={{
                  width: '100%',
                  height: '300px',
                  borderRadius: 2,
                  overflow: 'hidden',
                  mb: 2,
                  position: 'relative',
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Box textAlign="center">
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {formData.category}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Blog kaydedildiğinde kategoriye uygun görsel otomatik oluşturulacak
                  </Typography>
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                    p: 2,
                    color: 'white'
                  }}
                >
                  <Typography variant="caption">
                    Kapak Görseli (Otomatik Oluşturulacak)
                  </Typography>
                </Box>
              </Box>
            )}

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Blog kaydedildiğinde kategoriye uygun görsel otomatik olarak oluşturulacak ve kalıcı olarak kaydedilecektir.
              </Typography>
            </Alert>

            <TextField
              name="title"
              label="Başlık"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
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
            />

            <FormControl fullWidth required>
              <InputLabel>Kategori</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Kategori"
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
              />
              <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                  />
                ))}
              </Box>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Durum</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Durum"
              >
                <MenuItem value="draft">Taslak</MenuItem>
                <MenuItem value="published">Yayınla</MenuItem>
              </Select>
            </FormControl>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate('/blog')}
                disabled={loading}
              >
                İptal
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default BlogCreate;