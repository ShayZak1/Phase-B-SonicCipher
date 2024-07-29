const axios = require('axios');

const openAITranslate = async (text, targetLanguage) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const url = 'https://api.openai.com/v1/engines/davinci-codex/completions';

  const requestBody = {
    prompt: `Translate the following text to ${targetLanguage}: ${text}`,
    max_tokens: 100,
    n: 1,
    stop: null,
    temperature: 0.7,
  };

  try {
    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const translatedText = response.data.choices[0].text.trim();
    return translatedText;
  } catch (error) {
    console.error('ERROR:', error);
    throw new Error('Failed to translate text with OpenAI');
  }
};

module.exports = { openAITranslate };
