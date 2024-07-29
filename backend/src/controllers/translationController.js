const { speechToText } = require('../services/googleSpeechService');
const { translateText } = require('../services/googleTranslateService');
const { textToSpeech } = require('../services/googleTextToSpeechService');
const { openAITranslate } = require('../services/openAIService');

const handleVoiceInput = async (req, res) => {
  try {
    const { audioData } = req.body;
    const text = await speechToText(audioData);
    res.json({ text });
  } catch (error) {
    res.status(500).json({ error: 'Error processing voice input' });
  }
};

const handleTranslation = async (req, res) => {
  try {
    const { text, targetLanguage, useOpenAI } = req.body;
    const translatedText = useOpenAI ? await openAITranslate(text, targetLanguage) : await translateText(text, targetLanguage);
    res.json({ translatedText });
  } catch (error) {
    res.status(500).json({ error: 'Error translating text' });
  }
};

const handleTextToSpeech = async (req, res) => {
  try {
    const { text, languageCode } = req.body;
    const audioData = await textToSpeech(text, languageCode);
    res.json({ audioData });
  } catch (error) {
    res.status(500).json({ error: 'Error converting text to speech' });
  }
};

module.exports = {
  handleVoiceInput,
  handleTranslation,
  handleTextToSpeech
};
