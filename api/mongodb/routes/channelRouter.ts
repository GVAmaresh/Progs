import express from 'express';
import { createChannel, deleteChannel, getAllChannels, updateChannel } from '../controllers/channelController';


const router = express.Router();

router.post('/addChannel', createChannel);
router.post("/getChannel", getAllChannels);
router.put('/updateComment', updateChannel);
router.post('/deleteChannel', deleteChannel);

export default router;