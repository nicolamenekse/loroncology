import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tab,
  Tabs,
  CircularProgress,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

const AdminDashboard = () => {
  const { token, logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Debug: Log user information
  console.log('AdminDashboard - Current user:', user);
  console.log('AdminDashboard - Token:', token);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [editBlogForm, setEditBlogForm] = useState({
    title: '',
    content: '',
    summary: '',
    category: ''
  });

  // Kullanıcıları getir
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('AdminDashboard - Fetching users with token:', token);

      if (!token) {
        throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
      }

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('AdminDashboard - Response status:', response.status);
      console.log('AdminDashboard - Response ok:', response.ok);

      if (response.status === 401) {
        logout();
        throw new Error('Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.');
      }

      if (response.status === 403) {
        throw new Error('Bu işlem için yetkiniz bulunmuyor.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kullanıcılar getirilemedi');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
      console.error('Kullanıcıları getirme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  // Blog yazılarını getir
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/blogs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        logout();
        throw new Error('Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Blog yazıları getirilemedi');
      }

      const data = await response.json();
      setBlogs(data);
    } catch (err) {
      setError(err.message);
      console.error('Blog yazılarını getirme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  // Blog düzenleme
  const handleEditBlog = (blog) => {
    setSelectedBlog(blog);
    setEditBlogForm({
      title: blog.title,
      content: blog.content,
      summary: blog.summary,
      category: blog.category
    });
    setEditDialog(true);
  };

  const handleEditBlogSubmit = async () => {
    try {
      const response = await fetch(`/api/blogs/${selectedBlog._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editBlogForm)
      });

      if (!response.ok) {
        throw new Error('Blog yazısı güncellenemedi');
      }

      await fetchBlogs();
      setEditDialog(false);
      setSelectedBlog(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Blog silme
  const handleDeleteBlog = async (blogId) => {
    if (window.confirm('Bu blog yazısını silmek istediğinize emin misiniz?')) {
      try {
        const response = await fetch(`/api/blogs/${blogId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Blog yazısı silinemedi');
        }

        await fetchBlogs();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  useEffect(() => {
    if (activeTab === 0) {
      fetchUsers();
    } else if (activeTab === 1) {
      fetchBlogs();
    }
  }, [activeTab]);

  // Kullanıcı düzenleme
  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setEditDialog(true);
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Kullanıcı güncellenemedi');
      }

      await fetchUsers();
      setEditDialog(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Kullanıcı silme
  const handleDelete = async (userId) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Kullanıcı silinemedi');
        }

        await fetchUsers();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // İstatistikler
  const stats = {
    totalUsers: users.length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    regularUsers: users.filter(u => u.role === 'user').length,
    totalBlogs: blogs.length,
    blogsByCategory: blogs.reduce((acc, blog) => {
      acc[blog.category] = (acc[blog.category] || 0) + 1;
      return acc;
    }, {})
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Paneli
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Genel İstatistikler
        </Typography>
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Box>
            <Typography variant="subtitle1">Toplam Kullanıcı</Typography>
            <Typography variant="h4">{stats.totalUsers}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1">Admin Kullanıcılar</Typography>
            <Typography variant="h4">{stats.adminUsers}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1">Normal Kullanıcılar</Typography>
            <Typography variant="h4">{stats.regularUsers}</Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box>
            <Typography variant="subtitle1">Blog Yazıları</Typography>
            <Typography variant="h4">{stats.totalBlogs}</Typography>
          </Box>
        </Box>

        {/* Blog Kategorileri İstatistikleri */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Blog Kategorileri
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {Object.entries(stats.blogsByCategory).map(([category, count]) => (
              <Chip
                key={category}
                label={`${category}: ${count}`}
                color="primary"
                variant="outlined"
                sx={{ m: 0.5 }}
              />
            ))}
          </Stack>
        </Box>
      </Paper>

      <Paper>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Kullanıcılar" />
          <Tab label="Blog Yönetimi" />
          <Tab label="Sistem Ayarları" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>İsim</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Rol</TableCell>
                        <TableCell>Kayıt Tarihi</TableCell>
                        <TableCell>Son Giriş</TableCell>
                        <TableCell>İşlemler</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                          </TableCell>
                          <TableCell>
                            {user.lastLogin
                              ? new Date(user.lastLogin).toLocaleDateString('tr-TR')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              color="primary"
                              onClick={() => handleEdit(user)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDelete(user._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}

          {activeTab === 1 && (
            <>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Başlık</TableCell>
                        <TableCell>Kategori</TableCell>
                        <TableCell>Yazar</TableCell>
                        <TableCell>Yayın Tarihi</TableCell>
                        <TableCell>İşlemler</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {blogs.map((blog) => (
                        <TableRow key={blog._id}>
                          <TableCell>{blog.title}</TableCell>
                          <TableCell>{blog.category}</TableCell>
                          <TableCell>{blog.author?.name || 'Bilinmiyor'}</TableCell>
                          <TableCell>
                            {new Date(blog.createdAt).toLocaleDateString('tr-TR')}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              color="primary"
                              onClick={() => handleEditBlog(blog)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteBlog(blog._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}

          {activeTab === 2 && (
            <Typography variant="h6">
              Sistem ayarları yakında eklenecek...
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Kullanıcı Düzenleme Dialog'u */}
      <Dialog 
        open={editDialog && selectedUser} 
        onClose={() => {
          setEditDialog(false);
          setSelectedUser(null);
        }}
      >
        <DialogTitle>Kullanıcı Düzenle</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="İsim"
            fullWidth
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Rol"
            fullWidth
            select
            SelectProps={{ native: true }}
            value={editForm.role}
            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
          >
            <option value="user">Kullanıcı</option>
            <option value="admin">Admin</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>İptal</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Blog Düzenleme Dialog'u */}
      <Dialog 
        open={editDialog && selectedBlog} 
        onClose={() => {
          setEditDialog(false);
          setSelectedBlog(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Blog Yazısı Düzenle</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Başlık"
            fullWidth
            value={editBlogForm.title}
            onChange={(e) => setEditBlogForm({ ...editBlogForm, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Özet"
            fullWidth
            multiline
            rows={3}
            value={editBlogForm.summary}
            onChange={(e) => setEditBlogForm({ ...editBlogForm, summary: e.target.value })}
          />
          <TextField
            margin="dense"
            label="İçerik"
            fullWidth
            multiline
            rows={10}
            value={editBlogForm.content}
            onChange={(e) => setEditBlogForm({ ...editBlogForm, content: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Kategori"
            fullWidth
            select
            SelectProps={{ native: true }}
            value={editBlogForm.category}
            onChange={(e) => setEditBlogForm({ ...editBlogForm, category: e.target.value })}
          >
            <option value="">Kategori Seçin</option>
            <option value="Onkoloji">Onkoloji</option>
            <option value="Tedavi Yöntemleri">Tedavi Yöntemleri</option>
            <option value="Hasta Bakımı">Hasta Bakımı</option>
            <option value="Araştırmalar">Araştırmalar</option>
            <option value="Genel">Genel</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditDialog(false);
            setSelectedBlog(null);
          }}>İptal</Button>
          <Button onClick={handleEditBlogSubmit} variant="contained">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
