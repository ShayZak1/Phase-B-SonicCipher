// Frontend/src/components/ContactUs.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import useContactUs from '../../hooks/useContactUs'; // Ensure the correct path to your hook

const ContactUs = () => {
  // Set up form handling with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Use the useContactUs hook to manage state and handle form submission
  const { loading, error, success, sendContactForm } = useContactUs();

  // Function to handle form submission
  const onSubmit = async (data) => {
    // Send form data using the hook
    await sendContactForm(data);
  };

  return (
    <div id="contact-us" className="text-white w-full py-16 px-4">
      <div className="max-w-screen-xl mx-auto grid lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-2xl md:text-4xl sm:text-3xl">
            Having trouble? Need help using our application? We are here to help!
          </h2>
          <p className="text-gray-200 pt-4">
            Feel free to leave us your email and we will contact you with our support agents!
          </p>
        </div>

        <div className="my-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col items-center justify-between w-full sm:flex-row"
          >
            {/* Email Input Field */}
            <input
              className="p-3 w-full rounded-md text-black"
              type="email"
              placeholder="Your Email..."
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && <p className="text-red-500">{errors.email.message}</p>}

            {/* Submit Button */}
            <button
              className="button button-main px-6 md:ml-4 mt-4 sm:mt-0"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
          <p className="mt-4">
            We promise to respond as soon as possible!
          </p>

          {/* Success and Error Messages */}
          {success && <p className="text-green-500 mt-2">Message sent successfully!</p>}
          {error && <p className="text-red-500 mt-2">Failed to send message: {error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
