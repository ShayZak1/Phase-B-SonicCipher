// Frontend/src/api/ContactUsApi.js

import axios from 'axios'; // Import Axios
import { config } from '../config.js'; // Use named import for config

const { apiBaseUrl } = config; // Retrieve the base URL from your config

class ContactUsApi {
  // Function to send the contact form data to the backend
  async sendContactForm(contactData) {
    try {
      // Make a POST request to the /contact endpoint of your backend
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/contact`, contactData);
      return response.data; // Return the response data
    } catch (error) {
      console.error('Error sending contact form:', error); // Log any errors
      throw error; // Throw the error to be handled by the calling function
    }
  }
}

// Export an instance of the ContactUsApi class
const contactUsApi = new ContactUsApi();
export default contactUsApi;
