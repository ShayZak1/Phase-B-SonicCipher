
# SonicCipher

SonicCipher is a versatile translation platform that offers both free and premium translation services, including text-to-speech and video translation capabilities. This repository contains the code for both the frontend and backend components of the application.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [System Dependencies](#system-dependencies)
- [Deployment](#deployment)
- [Maintenance](#maintenance)
- [Contact](#contact)

## Installation

### Local Run
To run the project locally, follow these steps:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/ShayZak1/Phase-B-SonicCipher
   ```

2. **Navigate to the Project Directory:**
   ```bash
   cd path/to/your/directory
   ```

3. **Install Frontend Packages:**
   ```bash
   cd frontend
   npm install
   ```

4. **Install Backend Packages:**
   ```bash
   cd ../backend
   npm install
   ```

## Usage

### Running the Client
1. **Navigate to the Frontend Directory:**
   ```bash
   cd frontend
   ```

2. **Start the Client:**
   ```bash
   npm start
   ```
   After running this command, you can navigate to `http://localhost:3000/` in your web browser.

### Running the Server
1. **Navigate to the Backend Directory:**
   ```bash
   cd backend
   ```

2. **Start the Server:**
   ```bash
   node app.js
   ```
   After running this command, the server will be accessible at `http://localhost:5000/`.

### Environment Variables
Create a `.env` file in the frontend directory and add the following line to connect the frontend with the backend:
```plaintext
REACT_APP_BACKEND_URL=https://sonic-cipher-server.vercel.app
```

## Features

### Main Pages and Key Features
- **Home Page:** The gateway to the platform, providing quick access to essential features like starting a translation session or engaging in live video conversations.
- **Translation Options:**
  - **Free Method:** Basic translation service with text input and translation output.
  - **Premium Method:** Enhanced translation with additional features like user specifications, rephrased translations, and personalized profiles.
- **Video Translation:** Real-time peer-to-peer video chat with live translation and captioning.

### Additional Features
- View Translation History
- Copy Translated Text
- Change Read-Aloud Voice (Male/Female)
- Video Translation with Secure Peer-to-Peer Connection

## System Dependencies

### Frontend
The client-side of the application uses the following key libraries:
- **React** (^18.2.0)
- **React DOM** (^18.2.0)
- **React Router DOM** (^6.22.0)
- **Tailwind CSS** (^3.4.1)
- **SweetAlert2** (^11.10.5)
- **heroicons/react** (^2.1.4)
- **preact/compat** (^17.1.2)
- **Axios** (^1.7.2)
- **PeerJS** (^1.3.2)
- **Preact** (^10.23.1)
- **Cobe** (^0.6.3)
- **Web Vitals** (^2.1.4)

### Backend
The server-side relies on:
- **Node.js**
- **google-cloud/speech** (^6.6.1)
- **Axios** (^1.7.2)
- **Body-Parser** (^1.20.2)
- **Dotenv** (^16.4.5)
- **Express** (^4.19.2)
- **Peer** (^1.0.2)
- **WS (WebSocket)** (^8.18.0)
- **Nodemon** (^3.1.4)

## Deployment
The application can also be accessed via the deployed version hosted on Vercel:
- **Frontend:** [SonicCipher (Vercel)](https://sonic-cipher-omega.vercel.app/)
- **Backend:** [SonicCipher Server (Vercel)](https://sonic-cipher-server.vercel.app/)

## Maintenance

### Managing Tools and Subscriptions
- **Google Speech-to-Text API:** Used for converting spoken language into text.
- **Google Translate API:** Provides text translation between selected languages.
- **Google Text-to-Speech API:** Converts translated text into speech.
- **OpenAI API (GPT-4 Model):** Enhances translation quality with advanced natural language processing.
- **PeerJS (WebRTC):** Facilitates peer-to-peer communication during live translation sessions.
- **Gmail Account:** For receiving user messages and feedback.

## Contact
If you have any questions or need support, please reach out via the "Contact Us" option in the application    or by sending an email to [Sonicciphercontact@gmail.com](mailto:Sonicciphercontact@gmail.com). 

---

