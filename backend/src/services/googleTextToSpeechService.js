const axios = require('axios');

const textToSpeech = async (text, languageCode) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

  const requestBody = {
    input: { text },
    voice: {
      languageCode,
      ssmlGender: 'NEUTRAL'
    },
    audioConfig: {
      audioEncoding: 'MP3'
    }
  };

  try {
    const response = await axios.post(url, requestBody);
    const audioContent = response.data.audioContent;
    return audioContent;
  } catch (error) {
    console.error('ERROR:', error);
    throw new Error('Failed to synthesize speech');
  }
};

module.exports = { textToSpeech };
