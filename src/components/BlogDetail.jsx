import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Chip, 
  Divider, 
  CircularProgress, 
  Button 
} from '@mui/material';
import { getBlogBySlug } from '../services/blogService';
import { generateBlogImage } from '../services/imageService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blogImage, setBlogImage] = useState(null);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const data = await getBlogBySlug(slug);
      setBlog(data);
      setLoading(false);
      
      // SEO meta etiketlerini güncelle
      document.title = data.title;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', data.summary);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error" variant="h6">
          Hata: {error}
        </Typography>
      </Box>
    );
  }

  if (!blog) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6">
          Blog yazısı bulunamadı.
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Geri Dönüş Butonu */}
      <Button
        component={Link}
        to="/blog"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 4 }}
      >
        Blog Listesine Dön
      </Button>

      {/* Kapak Görseli */}
      <Box 
        mb={4} 
        sx={{ 
          position: 'relative',
          height: '400px',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <img
          src={blog.coverImage && !blog.coverImage.includes('oaidalleapiprodscus.blob.core.windows.net') ? blog.coverImage : `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5WZXRlcmluZXIgQmxvZzwvdGV4dD4KPC9zdmc+Cg==`}
          alt={blog.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            e.target.src = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5WZXRlcmluZXIgQmxvZzwvdGV4dD4KPC9zdmc+Cg==`;
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
            padding: 3,
            color: 'white'
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            {blog.title}
          </Typography>
        </Box>
      </Box>

      {/* Blog Başlığı ve Meta Bilgiler */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          {blog.title}
        </Typography>

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Box display="flex" alignItems="center">
            <AccessTimeIcon sx={{ fontSize: 20, mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {new Date(blog.createdAt).toLocaleDateString('tr-TR')}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <CategoryIcon sx={{ fontSize: 20, mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {blog.category}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <AccessTimeIcon sx={{ fontSize: 20, mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {blog.readingTime} dk okuma
            </Typography>
          </Box>
        </Box>

        <Typography variant="subtitle1" color="text.secondary" paragraph>
          {blog.summary}
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Blog İçeriği */}
      <Box 
        className="blog-content"
        sx={{
          '& p': {
            mb: 2,
            lineHeight: 1.8
          }
        }}
      >
        {blog.content.split('\n').map((paragraph, index) => (
          <Typography key={index} paragraph>
            {paragraph}
          </Typography>
        ))}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Etiketler */}
      <Box mt={4}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <LocalOfferIcon color="action" />
          <Typography variant="h6">
            Etiketler
          </Typography>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          {blog.tags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              variant="outlined"
              size="small"
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Box>
      </Box>

      {/* Yazar Bilgisi */}
      <Box mt={4} p={3} bgcolor="background.paper" borderRadius={1}>
        <Typography variant="h6" gutterBottom>
          Yazar Hakkında
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {blog.author}
        </Typography>
      </Box>
    </Container>
  );
};

export default BlogDetail;