import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

/* ------------------------- Multer: Avatar Upload ------------------------- */
const avatarDir = path.join(process.cwd(), 'uploads', 'avatars');
fs.mkdirSync(avatarDir, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '') || '.png';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const avatarFileFilter = (_req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new Error('Only image uploads are allowed'));
};

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

/* ------------------------------- Endpoints ------------------------------- */

// Get my profile
router.get('/me', requireAuth, async (req, res) => {
  const me = await prisma.user.findUnique({ where: { id: req.session.user.id } });
  if (!me) return res.status(404).json({ error: 'User not found' });
  const { passwordHash, ...rest } = me;
  res.json(rest);
});

// Update my profile
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { name, email, phone, about, city, state, country, languages, gender } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.session.user.id },
      data: { name, email, phone, about, city, state, country, languages, gender }
    });
    // keep session in sync for navbar, etc.
    req.session.user.name = updated.name;
    req.session.user.email = updated.email;
    const { passwordHash, ...rest } = updated;
    res.json(rest);
  } catch (e) {
    console.error('Profile update failed:', e);
    res.status(400).json({ error: 'Invalid profile data' });
  }
});

// Upload avatar
router.post('/avatar', requireAuth, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const fileUrl = `/uploads/avatars/${req.file.filename}`;
    const updated = await prisma.user.update({
      where: { id: req.session.user.id },
      data: { avatarUrl: fileUrl }
    });
    const { passwordHash, ...rest } = updated;
    res.json(rest);
  } catch (e) {
    console.error('Avatar upload failed:', e);
    res.status(500).json({ error: 'Avatar upload failed' });
  }
});

export default router;
