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
  CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

const AdminDashboard = () => {
  const { token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: ''
  });

  // Kullanıcıları getir
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
      }

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

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

  useEffect(() => {
    fetchUsers();
  }, []);

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
    regularUsers: users.filter(u => u.role === 'user').length
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
        </Box>
      </Paper>

      <Paper>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Kullanıcılar" />
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
            <Typography variant="h6">
              Sistem ayarları yakında eklenecek...
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Düzenleme Dialog'u */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
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
    </Container>
  );
};

export default AdminDashboard;
