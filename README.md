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

# Install backend dependencies
npm install
npm run dev:server

# In another terminal, install frontend
cd client
npm install
npm run dev
