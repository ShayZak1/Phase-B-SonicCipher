const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

const speechToText = async (audioData) => {
  //sdsdfsdgffsdg
  const audio = {
    content: audioData,
  };
  const config = {
    encoding: 'LINEAR16', // Adjust encoding as per your audio format
    sampleRateHertz: 16000, // Adjust sample rate as per your audio
    languageCode: 'en-US', // Adjust language code as needed
  };
  const request = {
    audio: audio,
    config: config,
  };

  try {
    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    return transcription;
  } catch (error) {
    console.error('ERROR:', error);
    throw new Error('Failed to transcribe audio');
  }
};

module.exports = { speechToText };
