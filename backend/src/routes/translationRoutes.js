const express = require('express');
const { handleVoiceInput, handleTranslation, handleTextToSpeech } = require('../controllers/translationController');

const router = express.Router();

router.post('/voice-input', handleVoiceInput);
router.post('/translate', handleTranslation);
router.post('/text-to-speech', handleTextToSpeech);

module.exports = router;
