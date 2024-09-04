import express from 'express';
// import { login, logout, signup } from '../controllers/authController';
import { deleteMe, getMe, updateMe } from '../controllers/userController';

const router = express.Router();

router.get("/getMe", getMe)
router.post("/addMe", updateMe)
router.post("/editMe", updateMe)
router.post("/deleteMe", deleteMe)

// router.post('/signup', signup);
// router.put('/login', login);
// router.delete('/logout', logout);

export default router;
