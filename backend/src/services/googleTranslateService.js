const axios = require('axios');

const translateText = async (text, targetLanguage) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const url = `https://translation.googleapis.com/language/translate/v2`;

  try {
    const response = await axios.post(url, {
      q: text,
      target: targetLanguage,
      key: apiKey,
    });

    const translatedText = response.data.data.translations[0].translatedText;
    return translatedText;
  } catch (error) {
    console.error('ERROR:', error);
    throw new Error('Failed to translate text');
  }
};

module.exports = { translateText };
