import express from 'express';
import { createChannel, deleteChannel, updateChannel } from '../controllers/channelController';


const router = express.Router();

router.post('/addChannel', createChannel);
router.put('/updateComment', updateChannel);
router.post('/deleteChannel', deleteChannel);

export default router;