import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Initialize dotenv
try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  dotenv.config({ path: path.join(__dirname, '../../.env') });
} catch (error) {
  console.log('Environment setup warning:', error.message);
}

// Fallback API key from environment variable
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.RENDER_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('⚠️ OpenAI API key is missing! AI features will be disabled.');
  console.error('Please set OPENAI_API_KEY in your environment variables.');
}

// Initialize OpenAI with error handling
let openai;
try {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });
} catch (error) {
  console.error('OpenAI initialization error:', error.message);
}

// Helper function to check if AI service is available
const isAIServiceAvailable = () => {
  return !!OPENAI_API_KEY && !!openai;
};

export const generatePatientAnalysis = async (patientData) => {
  if (!isAIServiceAvailable()) {
    throw new Error('AI servisi şu anda kullanılamıyor. Lütfen sistem yöneticinize başvurun.');
  }

  try {
    console.log('Generating analysis for patient:', patientData._id);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Sen bir veteriner onkoloji uzmanısın. Hasta verilerini analiz edip, detaylı bir rapor oluşturacaksın."
        },
        {
          role: "user",
          content: `Lütfen bu hasta verilerini analiz et ve bir rapor oluştur: ${JSON.stringify(patientData, null, 2)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    if (!completion.choices || !completion.choices[0]?.message?.content) {
      throw new Error('OpenAI API geçersiz yanıt döndürdü');
    }

    console.log('Analysis generated successfully');
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', {
      name: error.name,
      message: error.message,
      status: error.status
    });
    throw new Error(`AI analizi oluşturulurken bir hata oluştu: ${error.message}`);
  }
};

export const generateTreatmentSuggestions = async (patientData) => {
  if (!isAIServiceAvailable()) {
    throw new Error('AI servisi şu anda kullanılamıyor. Lütfen sistem yöneticinize başvurun.');
  }

  try {
    console.log('Generating treatment suggestions for patient:', patientData._id);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Sen bir veteriner onkoloji uzmanısın. Hasta verilerine göre tedavi önerileri sunacaksın."
        },
        {
          role: "user",
          content: `Bu hasta için tedavi önerileri oluştur: ${JSON.stringify(patientData, null, 2)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    if (!completion.choices || !completion.choices[0]?.message?.content) {
      throw new Error('OpenAI API geçersiz yanıt döndürdü');
    }

    console.log('Treatment suggestions generated successfully');
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', {
      name: error.name,
      message: error.message,
      status: error.status
    });
    throw new Error(`AI tedavi önerisi oluşturulurken bir hata oluştu: ${error.message}`);
  }
};

export const analyzeLaboratoryResults = async (labData) => {
  if (!isAIServiceAvailable()) {
    throw new Error('AI servisi şu anda kullanılamıyor. Lütfen sistem yöneticinize başvurun.');
  }

  try {
    console.log('Analyzing laboratory results');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Sen bir veteriner laboratuvar uzmanısın. Laboratuvar sonuçlarını analiz edip, anormallikler ve öneriler sunacaksın."
        },
        {
          role: "user",
          content: `Bu laboratuvar sonuçlarını analiz et: ${JSON.stringify(labData, null, 2)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    if (!completion.choices || !completion.choices[0]?.message?.content) {
      throw new Error('OpenAI API geçersiz yanıt döndürdü');
    }

    console.log('Lab analysis generated successfully');
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', {
      name: error.name,
      message: error.message,
      status: error.status
    });
    throw new Error(`AI laboratuvar analizi oluşturulurken bir hata oluştu: ${error.message}`);
  }
};