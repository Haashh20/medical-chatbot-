# MedAssist AI 🩺🤖

MedAssist AI is a premium, full-stack virtual healthcare assistant designed to provide intelligent, empathetic, and highly personalized medical guidance. Powered by Google's Gemini 1.5 Flash Large Language Model, MedAssist acts as a virtual triage nurse—capable of assessing symptoms, generating professional medical reports, and providing critical health insights.

![App Preview](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

## ✨ Core Features

* **🧠 Contextual AI Intelligence**: Powered by Google's Gemini AI, the chatbot dynamically adjusts its advice based on the user's saved Medical Profile (Allergies, Chronic Conditions, etc.).
* **📄 Automated PDF Prescriptions**: With a single click, users can generate a beautiful, highly structured "Patient Consultation Report" PDF that automatically strips out conversational AI text and formats their symptoms into a digital prescription.
* **🔐 Secure Authentication Vault**: Features JWT-based user authentication, encrypted MongoDB data storage, and a password-protected "Archived Vault" for hiding sensitive medical inquiries.
* **⚙️ Complete Data Control**: Fully GDPR/HIPAA-compliant data structure. Users have a dedicated Settings page to 1-click export their entire chat history to a JSON file or permanently delete their account and database footprint.
* **🎨 Premium UI/UX**: Designed with a sleek, responsive dark/light mode interface. Features real-time typing indicators, auto-focus chat logic, and hover-to-copy/edit actions exactly like industry-leading LLM interfaces.

## 🛠️ Technology Stack

* **Frontend**: React.js (Vite), CSS3 (Custom Design System), Lucide React (Icons), jsPDF (Client-side PDF generation), React Markdown.
* **Backend**: Node.js, Express.js.
* **Database**: MongoDB Atlas, Mongoose (ODM).
* **AI Integration**: Google Generative AI SDK (`@google/generative-ai`).
* **Security**: JSON Web Tokens (JWT), BcryptJS.

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* MongoDB Atlas Cluster URI
* Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YourUsername/medical-chatbot.git
   cd medical-chatbot
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `/backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
   Run the backend server:
   ```bash
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in the `/frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   Start the Vite development server:
   ```bash
   npm run dev
   ```

## ⚠️ Medical Disclaimer
*MedAssist AI is a hackathon/demonstration project. It utilizes generative artificial intelligence to simulate a medical assistant. It does not replace professional medical advice, diagnosis, or treatment. Always consult a physician for serious health concerns.*
