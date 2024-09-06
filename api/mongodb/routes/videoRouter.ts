import express from 'express';
import { addVideo, editVideo, deleteVideo, getVideosByChannel } from '../controllers/videoController';

const router = express.Router();

router.post('/add-video', addVideo);
router.post('/get-video-channel', getVideosByChannel);
router.put('/edit-video', editVideo);
router.delete('/delete-video', deleteVideo);

export default router;
