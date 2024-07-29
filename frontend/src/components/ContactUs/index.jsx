
const ContactUs = () => {
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
          <div className="flex flex-col items-center justify-between w-full sm:flex-row">
            <input className="p-3 w-full rounded-md text-black" type="email" placeholder="Your Email..." />
            <button className="button button-main px-6 md:ml-4">Send</button>
          </div>
          <p className="">
            We promise to respond as soon as possible!
          </p>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
