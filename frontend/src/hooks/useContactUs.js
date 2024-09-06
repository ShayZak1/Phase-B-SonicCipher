// Frontend/src/hooks/useContactUs.js

import { useState } from 'react';
import contactUsApi from '../api/ContactUsApi';

const useContactUs = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const sendContactForm = async (contactData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await contactUsApi.sendContactForm(contactData);
      setSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, sendContactForm };
};

export default useContactUs;
