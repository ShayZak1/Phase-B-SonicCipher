import contactUsRouter from './src/controllers/ContactUsController'; // Import the ContactUs router

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

// Middleware to enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

const TRANSLATE_API_KEY = process.env.TRANSLATE_API_KEY;
const SPEECH_API_KEY = process.env.SPEECH_API_KEY;
const TEXT_TO_SPEECH_API_KEY = process.env.TEXT_TO_SPEECH_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.post('/translate', async (req, res) => {
  const { q, source, target } = req.body;

  try {
    const response = await axios.post(`https://translation.googleapis.com/language/translate/v2?key=${TRANSLATE_API_KEY}`, {
      q,
      source,
      target,
      format: 'text',
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error translating text:', error);
    res.status(500).json({ error: 'Failed to translate text' });
  }
});

app.post('/speech-to-text', async (req, res) => {
  const { audioBase64, languageCode } = req.body;

  try {
    const response = await axios.post(`https://speech.googleapis.com/v1/speech:recognize?key=${SPEECH_API_KEY}`, {
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode,
      },
      audio: {
        content: audioBase64,
      },
    });

    if (response.data.results) {
      res.json(response.data);
    } else {
      res.status(500).json({ error: 'Unexpected response format', details: response.data });
    }
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: 'Failed to transcribe audio', details: error.message });
  }
});

app.post('/text-to-speech', async (req, res) => {
  const { text, languageCode } = req.body;

  if (!text || !languageCode) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await axios.post(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${TEXT_TO_SPEECH_API_KEY}`, {
      input: { text },
      voice: { languageCode, ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error converting text to speech:', error);
    res.status(500).json({ error: 'Failed to convert text to speech', details: error.message });
  }
});

// New OpenAI Translation Route using v1/chat/completions
app.post('/openai-translate', async (req, res) => {
  const { q, source, target, format, additionalText } = req.body;

  if (!q || !source || !target || !format) {
    console.log('Missing required fields'); // Log missing fields error
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const prompt = `You are an expert translator specializing in translating text from ${source} to ${target}. Please provide a translation that accurately reflects the original meaning and incorporates the following specifications: ${additionalText}.\n\n
    Examples of translations:
    English: "How are you?" -> Hebrew (formal): "מה שלומך?"
    English: "How are you?" -> Hebrew (slang): "מה קורה?"
    Only return the translated text.
    Now translate the following text:
    "${q}"`;

    console.log('Generated prompt:', prompt); // Log the generated prompt

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a translation assistant. Only provide the translation as instructed, without adding extra notes or explanations." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1000,
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const translatedText = response.data.choices[0].message.content.trim();
    console.log('Translated text:', translatedText); // Log the translated text

    res.json({ data: { translations: [{ translatedText }] } });
  } catch (error) {
    console.error('Error translating text with OpenAI:', error);
    console.error('Error details:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to translate text with OpenAI', details: error.response ? error.response.data : error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
