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
  const { text, ssml, languageCode, voice } = req.body;
  const ssmlGender = voice === 'male' ? 'MALE' : 'FEMALE';

  // Log received data
  console.log('Received text:', text);
  console.log('Received SSML:', ssml);
  console.log('Language code:', languageCode);
  console.log('Requested voice:', voice);
  console.log('SSML Gender used:', ssmlGender);

  try {
    // Determine whether to use SSML or plain text
    const input = ssml ? { ssml } : { text };

    const response = await axios.post(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${TEXT_TO_SPEECH_API_KEY}`, {
      input, // Send either SSML or plain text
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

  // Log the incoming request data to check if specifications are received correctly
  console.log('Received translation request:', {
    q,
    source,
    target,
    format,
    additionalText,
    tone,
    formality,
  });

  if (!q || !source || !target || !format) {
    console.log('Missing required fields');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Combine the received specifications into the translation prompt
  const prompt = `You are an expert translator specializing in translating text from ${source} to ${target}. Please provide a translation that accurately reflects the original meaning with the following specifications:

  - Tone: ${tone || 'neutral'} (ensure the translation maintains a polite, straightforward tone suitable for formal communication).
  - Formality: ${formality || 'formal'} (language should remain professional and respectful, using plural forms when appropriate).
  - Preferred Phrasing Style: When translating instructions or requests, use phrasing that sounds slightly more indirect and polite. For example, prefer "עברו על" instead of "סקור" and similar polite variations over more direct instructions.
  - Additional Context: Avoid overly instructional or commanding language; maintain a respectful tone as if addressing a professional audience.
  - Additional specifications: ${additionalText || 'none'}
  
  Here are some example translations to guide the style:
  1. English: "Please review the attached document." -> Hebrew: "אנא עברו על המסמך המצורף."
  2. English: "Ensure the task is completed by the end of the week." -> Hebrew: "ודאו שהמשימה תושלם עד סוף השבוע."
  
  Now translate the following text:
  "${q}"`;
  

  // Log the generated prompt to verify how the specifications are used
  console.log('Generated prompt with combined specifications:', prompt);

  try {
    // Make the API request to OpenAI using the customized prompt
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a translation assistant. Only provide the translation as instructed, without adding extra notes or explanations.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Log the API response to verify the translation result
    const translatedText = response.data.choices[0].message.content.trim();
    console.log('Translated text:', translatedText);

    // Send the translated text back to the frontend
    res.json({ data: { translations: [{ translatedText }] } });
  } catch (error) {
    // Log error details for troubleshooting
    console.error('Error translating text with OpenAI:', error);
    console.error(
      'Error details:',
      error.response ? error.response.data : error.message
    );
    res
      .status(500)
      .json({
        error: 'Failed to translate text with OpenAI',
        details: error.response ? error.response.data : error.message,
      });
  }
});

app.post('/generate-suggestions', async (req, res) => {
  const { text } = req.body;

  // Log incoming request
  console.log('Generating suggestions for:', text);

  try {
    const prompt = `The following sentence has been translated, but could be rephrased to sound more fluent or engaging for the intended audience. Provide three alternative suggestions that maintain the meaning but adjust the tone and phrasing in the same given text language (dont write numbers and dots before the suggestions only the suggestions them self):

Original: "${text}"

Suggestions:`;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an assistant that provides alternative phrasings for translations, enhancing fluency and alignment with audience expectations in the same given language.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 150,
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Extract suggestions from the response
    const suggestions = response.data.choices[0].message.content.trim().split('\n');

    // Log suggestions
    console.log('Generated suggestions:', suggestions);

    res.json({ suggestions });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ error: 'Failed to generate suggestions', details: error.message });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});