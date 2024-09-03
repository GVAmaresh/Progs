import express from 'express';
import { addVideo, editVideo, deleteVideo } from '../controllers/videoController';

const router = express.Router();

router.post('/videos', addVideo);
router.put('/videos/:id', editVideo);
router.delete('/videos/:id', deleteVideo);

export default router;
