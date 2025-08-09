import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent,
  CardMedia, 
  Button, 
  Grid, 
  Chip, 
  CircularProgress 
} from '@mui/material';
import { getAllBlogs } from '../services/blogService';
import { generateBlogImage } from '../services/imageService';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blogImages, setBlogImages] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = ['Tümü', 'Onkoloji', 'Tedavi Yöntemleri', 'Hasta Bakımı', 'Araştırmalar', 'Genel'];

  useEffect(() => {
    fetchBlogs();
  }, [selectedCategory]);

  const fetchBlogs = async () => {
    try {
      const filters = selectedCategory && selectedCategory !== 'Tümü' ? { category: selectedCategory } : {};
      const data = await getAllBlogs(filters);
      setBlogs(data);

      setLoading(false);
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Blog Yazıları
        </Typography>
        <Button
          component={Link}
          to="/blog/yeni"
          variant="contained"
          color="primary"
        >
          Yeni Blog Yazısı
        </Button>
      </Box>

      {/* Kategori Filtreleme */}
      <Box mb={4}>
        <Grid container spacing={1}>
          {categories.map((category) => (
            <Grid item key={category}>
              <Chip
                label={category}
                onClick={() => setSelectedCategory(category)}
                color={selectedCategory === category ? "primary" : "default"}
                variant={selectedCategory === category ? "filled" : "outlined"}
                sx={{ cursor: 'pointer' }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Blog Kartları */}
      <Grid container spacing={3}>
        {blogs.map((blog) => (
          <Grid item xs={12} sm={6} md={4} key={blog._id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
            >
                              <CardMedia
                  component="img"
                  height="200"
                  image={blog.coverImage || 'https://images.unsplash.com/photo-1584486483122-af7d49cf2992?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1792&h=1024&fit=crop'}
                  alt={blog.title}
                sx={{
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box mb={2}>
                  <Typography variant="overline" color="text.secondary">
                    {new Date(blog.createdAt).toLocaleDateString('tr-TR')}
                  </Typography>
                  <Chip 
                    label={blog.category} 
                    size="small" 
                    color="primary" 
                    sx={{ ml: 1 }}
                  />
                </Box>

                <Typography 
                  variant="h6" 
                  component={Link}
                  to={`/blog/${blog.slug}`}
                  sx={{ 
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  {blog.title}
                </Typography>

                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mt: 2,
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {blog.summary}
                </Typography>

                <Box 
                  sx={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 'auto'
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {blog.readingTime} dk okuma
                  </Typography>
                  <Button
                    component={Link}
                    to={`/blog/${blog.slug}`}
                    size="small"
                    color="primary"
                  >
                    Devamını Oku →
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {blogs.length === 0 && (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="text.secondary">
            Henüz blog yazısı bulunmuyor.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default BlogList;
