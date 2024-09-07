import express from 'express';
import { addVideo, editVideo, deleteVideo, getVideosByChannel, getAllVideosMongodb, getVideo } from '../controllers/videoController';

const router = express.Router();

router.post('/add-video', addVideo);
router.get("/get-all-videos", getAllVideosMongodb);
router.get("/get-video", getVideo)
router.post('/get-video-channel', getVideosByChannel);
router.put('/edit-video', editVideo);
router.delete('/delete-video', deleteVideo);

export default router;
