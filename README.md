# Mental Health Chatbot - MERN Stack

A MERN stack (MongoDB, Express.js, React, Node.js) web application designed to provide mental health support through an AI-powered chatbot. It features user authentication, a supportive bot interface, and resources for mental well-being.

## 🚀 Features

*   **AI Chatbot**: Powered by Google's Gemini API for empathetic and helpful conversations.
*   **User Authentication**: Secure Sign Up and Login functionality using JWT (JSON Web Tokens).
*   **Responsive Design**: A beautiful and accessible user interface built with React.
*   **Voice Interaction**: Supports speech-to-text for easier communication (where supported).
*   **Booking System**: (Simulated) functionality to book sessions or appointments.

## 🛠️ Tech Stack

*   **Frontend**: React.js, React Router, CSS
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB
*   **AI Model**: Google Gemini Pro (via `@google/generative-ai`)
*   **Authentication**: JSON Web Token (JWT)

## 📦 Installation & Setup

### Prerequisites

*   Node.js (v14 or higher)
*   MongoDB Account (Atlas)
*   Google Cloud Project with Gemini API Key

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/mental-health-chatbot.git
cd mental-health-chatbot
```

### 2. Backend Setup

1.  Navigate to the `Backend` directory:
    ```bash
    cd Backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `Backend` directory and add your credentials (see `.env.example`):
    ```env
    MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/healthbot
    JWT_SECRET=your_super_secret_jwt_key
    API_KEY=your_google_gemini_api_key
    PORT=4000
    ```
4.  Start the backend server:
    ```bash
    npm start
    ```
    *You should see "Server Running on Port 4000" and "Connected to MongoDB successfully".*

### 3. Frontend Setup

1.  Open a new terminal and navigate to the `chatbot` directory:
    ```bash
    cd chatbot
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `chatbot` directory:
    ```env
    REACT_APP_API_URL=http://localhost:4000
    ```
    *(Note: If deploying, replace this with your deployed backend URL)*
4.  Start the React application:
    ```bash
    npm start
    ```

## 🌍 Deployment

### Deploying to Render.com (Recommended)

**Backend (Web Service):**
1.  Connect your repo to Render.
2.  Root Directory: `Backend`
3.  Build Command: `npm install`
4.  Start Command: `node index.js`
5.  Add Environment Variables (`MONGO_URI`, `API_KEY`, `JWT_SECRET`) in Render settings.

**Frontend (Static Site):**
1.  Connect your repo to Render.
2.  Root Directory: `chatbot`
3.  Build Command: `npm install && npm run build`
4.  Publish Directory: `build`
5.  Add Environment Variable: `REACT_APP_API_URL` (Set to your deployed Backend URL, e.g., `https://my-api.onrender.com` - **no trailing slash**).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
