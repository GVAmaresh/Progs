import express from 'express';
import { login, logout, signup } from '../controllers/authController';

const router = express.Router();

router.post('/signup', signup);
router.put('/login', login);
router.delete('/logout', logout);

export default router;
