const contactUsRouter = require('./src/routes/ContactUsRouter'); // Use require instead of import
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
app.use('/contact', contactUsRouter);

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

// Backend: text-to-speech route modification
app.post('/text-to-speech', async (req, res) => {
  const { text, languageCode, voice } = req.body;
  const ssmlGender = voice === 'male' ? 'MALE' : 'FEMALE';

  // Log received data
  console.log('Received text:', text);
  console.log('Language code:', languageCode);
  console.log('Requested voice:', voice);
  console.log('SSML Gender used:', ssmlGender);

  try {
    const response = await axios.post(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${TEXT_TO_SPEECH_API_KEY}`, {
      input: { text },
      voice: { languageCode, ssmlGender },
      audioConfig: { audioEncoding: 'MP3' }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error converting text to speech:', error);
    res.status(500).json({ error: 'Failed to convert text to speech', details: error.message });
  }
});


// Assuming this is part of your backend server setup (e.g., Express.js)
app.post('/openai-translate', async (req, res) => {
  const { q, source, target, format, additionalText, tone, formality } = req.body;

  // Check for missing required fields
  if (!q || !source || !target || !format) {
    console.log('Missing required fields'); 
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Build the prompt using the received profile settings
    const prompt = `You are an expert translator specializing in translating text from ${source} to ${target}. Provide a translation that accurately reflects the original meaning with the following specifications:

    - Tone: ${tone || 'neutral'}
    - Formality: ${formality || 'formal'}
    - Additional specifications: ${additionalText || 'none'}

    Now translate the following text:
    "${q}"`;

    console.log('Generated prompt:', prompt); // Log the generated prompt

    // Make the API request to OpenAI using the customized prompt
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a translation assistant. Only provide the translation as instructed, without adding extra notes or explanations.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1000,
    }, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    // Extract the translated text from the API response
    const translatedText = response.data.choices[0].message.content.trim();
    console.log('Translated text:', translatedText); 

    // Send the translated text back to the frontend
    res.json({ data: { translations: [{ translatedText }] } });
  } catch (error) {
    console.error('Error translating text with OpenAI:', error);
    res.status(500).json({ error: 'Failed to translate text with OpenAI', details: error.response ? error.response.data : error.message });
  }
});




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
