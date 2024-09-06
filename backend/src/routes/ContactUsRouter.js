// Backend/Routes/ContactUsRouter.js

const express = require('express');
const { handleContactForm } = require('../controllers/ContactUsController'); // Use require instead of import

const router = express.Router();

router.post('/', handleContactForm);

module.exports = router;
