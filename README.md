# 🧠 Loroncology – Veterinary Oncology Patient Tracking System

**Loroncology** is a modern, AI-enhanced patient management platform designed specifically for veterinary oncology. Built with the **MERN stack** (MongoDB, Express.js, React, Node.js), this project allows clinicians to register, update, monitor, and analyze patient data in a structured and intelligent environment.

## 🌟 Key Features

- 📝 **Comprehensive Patient Profiles**  
  Anamnesis, physical exam findings, lab test results (hemogram, biochemistry), radiological observations, biopsy info, and more.

- 💾 **Versioned History Tracking**  
  All updates are stored chronologically for traceability and follow-up.

- 🧪 **Integrated Lab Input Modules**  
  Automatic reference range validation for lab values with intelligent parameter input.

- 🤖 **AI-Powered Clinical Assistant**  
  GPT-based analysis of patient data, offering clinical insights, suggested differential diagnoses, and potential follow-up tests.  
  *(Note: All AI suggestions are for support only – final clinical decisions remain with the veterinarian.)*

- 📱 **Responsive UI with Material-UI**  
  Designed for smooth use across desktops, tablets, and mobile devices.

## 🔐 Email Verification

The system uses email verification to ensure user authenticity:

1. After registration, users receive a verification email via SendGrid
2. The verification link is valid for 30 minutes
3. Users can request a new verification email (rate limited)
4. Certain features require email verification

## 🧠 Why AI?

Loroncology doesn’t aim to replace the veterinarian – it aims to **augment their decision-making** with structured summaries and assistant-level insight. By using AI responsibly, this platform aspires to improve case clarity, reduce oversight, and serve as a digital memory for complex oncological cases.

## 🚀 Tech Stack

- **Frontend:** React + Vite + Material-UI  
- **Backend:** Node.js + Express  
- **Database:** MongoDB (Mongoose)  
- **AI Integration:** OpenAI GPT-3.5 / GPT-4o  
- **Deployment:** Render

## 📦 Installation

```bash
git clone https://github.com/nicolamenekse/loroncology.git
cd loroncology

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: A secure random string for JWT signing
# - SENDGRID_API_KEY: Your SendGrid API key
# - EMAIL_FROM: Your verified sender email in SendGrid
# - APP_URL: Your application URL (e.g., http://localhost:3000)

# Start the development server
npm run dev
