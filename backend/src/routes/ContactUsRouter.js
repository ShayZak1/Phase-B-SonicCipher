// Backend/Routes/ContactUsRouter.js

import { Router } from 'express';
import { handleContactForm } from '../controllers/ContactUsController.js';

const router = Router();

router.post('/', handleContactForm);

export default router;
