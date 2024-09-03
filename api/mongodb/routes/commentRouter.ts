import express from 'express';

import { addComment, getComments } from '../controllers/commentController';

const router = express.Router();

router.post('/getComment', getComments);
router.put('/addComment', addComment);

export default router;