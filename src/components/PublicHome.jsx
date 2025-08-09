import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ScienceIcon from '@mui/icons-material/Science';

function PublicHome() {
  return (
    <Box sx={{ bgcolor: '#F8FAFC', width: '100%', position: 'relative' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
          pt: { xs: 2, md: 4 },
          pb: { xs: 6, md: 10 },
          position: 'relative',
          zIndex: 1
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 700,
                  color: '#1E293B',
                  mb: 2
                }}
              >
                Veteriner Onkoloji Merkezi
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  color: '#64748B',
                  mb: 4,
                  fontWeight: 400
                }}
              >
                Evcil dostlarınızın sağlığı için uzman kadromuz ve modern teknolojimizle yanınızdayız.
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
              >
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: '#3B82F6',
                    fontSize: '1rem',
                    py: 1.5,
                    px: 4,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: '#2563EB'
                    }
                  }}
                >
                  Hemen Başlayın
                </Button>
                <Button
                  component={Link}
                  to="/blog"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: '#3B82F6',
                    color: '#3B82F6',
                    fontSize: '1rem',
                    py: 1.5,
                    px: 4,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#2563EB',
                      bgcolor: 'rgba(59, 130, 246, 0.1)'
                    }
                  }}
                >
                  Blog'u Keşfedin
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/images/hero/veterinary-clinic.jpg"
                alt="Veteriner Kliniği"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Grid container spacing={4}>
          {[
            {
              icon: <LocalHospitalIcon sx={{ fontSize: 40, color: '#3B82F6' }} />,
              title: 'Uzman Onkoloji Tedavisi',
              description: 'Deneyimli veteriner hekimlerimiz ile evcil dostlarınız için özel onkoloji tedavi hizmetleri.'
            },
            {
              icon: <ScienceIcon sx={{ fontSize: 40, color: '#3B82F6' }} />,
              title: 'Modern Laboratuvar',
              description: 'Son teknoloji laboratuvar ekipmanlarımız ile hızlı ve doğru teşhis imkanı.'
            },
            {
              icon: <PetsIcon sx={{ fontSize: 40, color: '#3B82F6' }} />,
              title: 'Özel Bakım',
              description: 'Her hastamıza özel tedavi planı ve sürekli takip sistemi.'
            }
          ].map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  bgcolor: 'transparent',
                  textAlign: 'center'
                }}
              >
                <CardContent>
                  {feature.icon}
                  <Typography
                    variant="h6"
                    sx={{
                      mt: 2,
                      mb: 1,
                      fontWeight: 600,
                      color: '#1E293B'
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#64748B'
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: '#1E293B',
          color: 'white',
          py: { xs: 6, md: 8 },
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '1.75rem', md: '2.25rem' },
              fontWeight: 700,
              mb: 3
            }}
          >
            Evcil Dostunuz İçin En İyi Bakım
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.1rem' },
              mb: 4,
              color: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            Uzman kadromuz ve modern teknolojimizle evcil dostlarınızın sağlığı için buradayız.
          </Typography>
          <Button
            component={Link}
            to="/register"
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#3B82F6',
              fontSize: '1rem',
              py: 1.5,
              px: 6,
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#2563EB'
              }
            }}
          >
            Hemen Başlayın
          </Button>
        </Container>
      </Box>
    </Box>
  );
}

export default PublicHome;