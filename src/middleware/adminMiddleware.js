export const adminMiddleware = (req, res, next) => {
  console.log('=== adminMiddleware called ===');
  console.log('req.user:', req.user);
  console.log('req.user.role:', req.user?.role);
  
  if (req.user && req.user.role === 'admin') {
    console.log('Admin access granted');
    next();
  } else {
    console.log('Admin access denied');
    res.status(403).json({ message: 'Bu işlem için admin yetkisi gerekiyor' });
  }
};
