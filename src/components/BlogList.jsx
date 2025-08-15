import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Alert,
  IconButton,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
  Divider
} from '@mui/material';
import { 
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? 'https://loroncology.onrender.com' : 'http://localhost:5000');

const BlogList = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'Tümü');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [hasMore, setHasMore] = useState(true);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const categories = ['Tümü', 'Onkoloji', 'Tedavi Yöntemleri', 'Hasta Bakımı', 'Araştırmalar', 'Genel'];
  const sortOptions = [
    { value: 'newest', label: 'Yeni → Eski' },
    { value: 'oldest', label: 'Eski → Yeni' },
    { value: 'popular', label: 'En Çok Okunan' }
  ];

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // URL params sync
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.set('q', debouncedSearchTerm);
    if (selectedCategory !== 'Tümü') params.set('category', selectedCategory);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    setSearchParams(params);
  }, [debouncedSearchTerm, selectedCategory, sortBy, currentPage, setSearchParams]);

  useEffect(() => {
    fetchBlogs();
  }, [debouncedSearchTerm, selectedCategory, sortBy, currentPage]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      
      const filters = {};
      if (debouncedSearchTerm) filters.q = debouncedSearchTerm;
      if (selectedCategory && selectedCategory !== 'Tümü') filters.category = selectedCategory;
      if (sortBy) filters.sort = sortBy;
      if (currentPage > 1) filters.page = currentPage;

      const queryString = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_URL}/api/blogs?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Bloglar yüklenirken bir hata oluştu`);
      }

      const data = await response.json();
      
      if (currentPage === 1) {
        setBlogs(data.blogs || data);
      } else {
        setBlogs(prev => [...prev, ...(data.blogs || data)]);
      }
      
      // Check if there are more pages
      if (data.pagination) {
        setHasMore(data.pagination.hasMore);
      } else {
        setHasMore((data.blogs || data).length === 12);
      }
      
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Tümü');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Featured/Hero blog (first blog)
  const featuredBlog = blogs.length > 0 ? blogs[0] : null;
  const regularBlogs = blogs.slice(1);

  const renderSkeletonCards = () => (
    <Grid container spacing={3}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card sx={{ height: '100%', borderRadius: '16px' }}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '12px 12px 0 0' }} />
            <CardContent sx={{ p: 3 }}>
              <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="40%" height={16} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton variant="text" width="30%" height={16} />
                <Skeleton variant="text" width="20%" height={16} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderEmptyState = () => (
    <Box sx={{ 
      textAlign: 'center', 
      py: 8,
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      border: '1px solid #EAECF0'
    }}>
      <Box sx={{ fontSize: 64, color: '#98A2B3', mb: 2 }}>📝</Box>
      <Typography variant="h6" color="#101828" sx={{ mb: 1, fontWeight: 600 }}>
        Bu filtrede içerik bulunamadı
      </Typography>
      <Typography variant="body2" color="#667085" sx={{ mb: 3 }}>
        Arama kriterlerinize uygun blog yazısı bulunamadı.
      </Typography>
      <Button 
        onClick={clearFilters}
        variant="outlined"
        sx={{
          borderColor: '#1877F2',
          color: '#1877F2',
          textTransform: 'none',
          fontWeight: 500,
          px: 3,
          py: 1.5,
          borderRadius: '12px'
        }}
      >
        Filtreleri Temizle
      </Button>
    </Box>
  );

  const renderErrorState = () => (
    <Alert severity="error" sx={{ 
      mb: 3,
      borderRadius: '12px',
      border: '1px solid #FEE4E2',
      backgroundColor: '#FEF3F2'
    }}>
      <Typography variant="body2" color="#D92D20">
        {error}
      </Typography>
      <Button 
        size="small" 
        onClick={fetchBlogs}
        sx={{ 
          mt: 1,
          color: '#D92D20',
          borderColor: '#D92D20',
          '&:hover': { borderColor: '#B42318' }
        }}
        variant="outlined"
      >
        Tekrar Dene
      </Button>
    </Alert>
  );

  const renderBlogCard = (blog, isFeatured = false) => (
    <Card 
      component={Link}
      to={`/blog/${blog.slug}`}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        textDecoration: 'none',
        color: 'inherit',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        border: '1px solid #EAECF0',
        '&:hover': {
          boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
          transform: 'translateY(-2px)',
          '& .blog-image': {
            transform: 'scale(1.02)'
          }
        },
        '&:focus-within': {
          outline: '2px solid #1877F2',
          outlineOffset: '2px'
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height={isFeatured ? 300 : 200}
          image={blog.coverImage || `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5WZXRlcmluZXIgQmxvZzwvdGV4dD4KPC9zdmc+Cg==`}
          alt={blog.title}
          className="blog-image"
          sx={{
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            borderRadius: isFeatured ? '16px 16px 0 0' : '12px 12px 0 0'
          }}
          loading="lazy"
        />
        
        {/* Category Badge */}
        <Chip 
          label={blog.category} 
          size="small" 
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            backgroundColor: 'rgba(24, 119, 242, 0.9)',
            color: 'white',
            fontWeight: 500,
            fontSize: '11px',
            height: '20px'
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography 
          variant={isFeatured ? "h5" : "h6"} 
          sx={{ 
            color: '#101828',
            fontWeight: 600,
            fontSize: isFeatured ? '20px' : '16px',
            lineHeight: 1.3,
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {blog.title}
        </Typography>

        <Typography 
          variant="body2" 
          color="#667085" 
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.5
          }}
        >
          {blog.summary}
        </Typography>

        <Box sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 'auto'
        }}>
          <Typography variant="caption" color="#667085">
            {blog.readingTime} dk okuma · {new Date(blog.createdAt).toLocaleDateString('tr-TR')} · {blog.author}
          </Typography>
          
          <Typography 
            variant="caption" 
            color="#1877F2" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 500,
              '&:hover': { color: '#166FE0' }
            }}
          >
            Devamını Oku <ArrowForwardIcon sx={{ fontSize: 16, ml: 0.5 }} />
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: '#F8FAFC',
      pt: 10,
      pb: 4
    }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ 
              color: '#101828',
              fontWeight: 700,
              fontSize: '28px',
              mb: 0.5
            }}>
              Blog Yazıları
            </Typography>
            <Typography variant="body2" color="#667085">
              Veteriner onkoloji alanında güncel bilgiler ve araştırmalar
            </Typography>
          </Box>
          
          {user && (
            <Button
              component={Link}
              to="/blog/yeni"
              variant="contained"
              startIcon={<AddIcon />}
              size="large"
              fullWidth={isMobile}
              sx={{ 
                backgroundColor: '#1877F2',
                '&:hover': { backgroundColor: '#166FE0' },
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(24, 119, 242, 0.15)'
              }}
            >
              Yeni Blog Yazısı
            </Button>
          )}
        </Box>

        {/* Sticky Filter Bar */}
        <AppBar 
          position="sticky" 
          sx={{ 
            top: 64,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #EAECF0',
            borderRadius: '16px',
            mb: 4
          }}
          elevation={0}
        >
          <Toolbar sx={{ px: 3, py: 2 }}>
            <Grid container spacing={2} alignItems="center">
              {/* Category Chips */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {categories.map((category) => (
                    <Chip
                      key={category}
                      label={category}
                      onClick={() => handleCategoryChange(category)}
                      color={selectedCategory === category ? "primary" : "default"}
                      variant={selectedCategory === category ? "filled" : "outlined"}
                      sx={{ 
                        cursor: 'pointer',
                        '&.MuiChip-filled': {
                          backgroundColor: '#1877F2',
                          color: 'white'
                        },
                        '&.MuiChip-outlined': {
                          borderColor: '#EAECF0',
                          color: '#667085'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Grid>

              {/* Search and Sort */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <TextField
                    placeholder="Blog ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#667085' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      minWidth: 200,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '& fieldset': { borderColor: '#EAECF0' },
                        '&:hover fieldset': { borderColor: '#D0D5DD' },
                        '&.Mui-focused fieldset': { borderColor: '#1877F2' }
                      }
                    }}
                  />

                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel sx={{ color: '#667085' }}>Sırala</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      label="Sırala"
                      sx={{
                        borderRadius: '12px',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#EAECF0' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D0D5DD' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1877F2' }
                      }}
                    >
                      {sortOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>

        {/* Error State */}
        {error && renderErrorState()}

        {/* Featured/Hero Blog */}
        {!loading && featuredBlog && (
          <Box sx={{ mb: 6 }}>
            <Card 
              component={Link}
              to={`/blog/${featuredBlog.slug}`}
              sx={{ 
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
                color: 'inherit',
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                border: '1px solid #EAECF0',
                '&:hover': {
                  boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <Box sx={{ 
                flex: { xs: 'none', md: '0 0 50%' },
                position: 'relative'
              }}>
                <CardMedia
                  component="img"
                  height="100%"
                  image={featuredBlog.coverImage || `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5WZXRlcmluZXIgQmxvZzwvdGV4dD4KPC9zdmc+Cg==`}
                  alt={featuredBlog.title}
                  sx={{
                    objectFit: 'cover',
                    height: { xs: 300, md: '100%' },
                    minHeight: { xs: 300, md: 400 }
                  }}
                />
                
                <Chip 
                  label={featuredBlog.category} 
                  size="small" 
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    backgroundColor: 'rgba(24, 119, 242, 0.9)',
                    color: 'white',
                    fontWeight: 500
                  }}
                />
              </Box>

              <CardContent sx={{ 
                flex: 1, 
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: '#101828',
                    fontWeight: 700,
                    fontSize: { xs: '24px', md: '28px' },
                    lineHeight: 1.2,
                    mb: 2
                  }}
                >
                  {featuredBlog.title}
                </Typography>

                <Typography 
                  variant="body1" 
                  color="#667085" 
                  sx={{ 
                    mb: 3,
                    lineHeight: 1.6,
                    fontSize: '16px'
                  }}
                >
                  {featuredBlog.summary}
                </Typography>

                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3
                }}>
                  <Typography variant="body2" color="#667085">
                    {featuredBlog.readingTime} dk okuma · {new Date(featuredBlog.createdAt).toLocaleDateString('tr-TR')} · {featuredBlog.author}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#1877F2',
                    '&:hover': { backgroundColor: '#166FE0' },
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: '12px',
                    alignSelf: 'flex-start'
                  }}
                >
                  Devamını Oku
                </Button>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Blog Grid */}
        {loading ? (
          renderSkeletonCards()
        ) : regularBlogs.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <Grid container spacing={3}>
              {regularBlogs.map((blog) => (
                <Grid item xs={12} sm={6} md={4} key={blog._id}>
                  {renderBlogCard(blog)}
                </Grid>
              ))}
            </Grid>

            {/* Load More Button */}
            {hasMore && (
              <Box sx={{ textAlign: 'center', mt: 6 }}>
                <Button
                  onClick={handleLoadMore}
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: '#1877F2',
                    color: '#1877F2',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: '12px',
                    '&:hover': {
                      borderColor: '#166FE0',
                      backgroundColor: '#F0F9FF'
                    }
                  }}
                >
                  Daha Fazla Yükle
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default BlogList;