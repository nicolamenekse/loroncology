import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY environment variable is not set!');
  throw new Error('OpenAI API key is missing');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const handleAIError = (error) => {
  console.error('OpenAI API Error:', {
    name: error.name,
    message: error.message,
    status: error.status,
    type: error.type
  });

  if (error.response) {
    console.error('OpenAI API Response Error:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    });
  }

  // API key related errors
  if (error.message.includes('API key')) {
    throw new Error('OpenAI API anahtarı geçersiz veya eksik');
  }

  // Rate limiting errors
  if (error.message.includes('Rate limit')) {
    throw new Error('API istek limiti aşıldı, lütfen biraz bekleyin');
  }

  // Token limit errors
  if (error.message.includes('maximum context length')) {
    throw new Error('Veri boyutu çok büyük, lütfen daha az veri gönderin');
  }

  // Generic error
  throw new Error(`AI servisi hatası: ${error.message}`);
};

export const generatePatientAnalysis = async (patientData) => {
  try {
    console.log('Generating analysis for patient:', patientData._id);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Sen bir veteriner onkoloji uzmanısın. Hasta verilerine göre genel bir analiz yapıp olabilecek tanıları sırala,  Hekime destek amaçlı önemli notlar ver.Bunu yaparken labaratuvar sonuclarının değerlerini tekrar yazmana gerek yok az öz ve nitelikli bir analiz lütfen"
        },
        {
          role: "user",
          content: `Sen bir veteriner onkoloji uzmanısın. Hasta verilerine göre genel bir analiz yapıp olabilecek tanıları sırala,  Hekime destek amaçlı önemli notlar ver.Bunu yaparken labaratuvar sonuclarının değerlerini tekrar yazmana gerek yok az öz ve nitelikli bir analiz lütfen${JSON.stringify(patientData, null, 2)}`
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
    handleAIError(error);
  }
};

export const generateTreatmentSuggestions = async (patientData) => {
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
    handleAIError(error);
  }
};

export const analyzeLaboratoryResults = async (labData) => {
  try {
    console.log('Analyzing laboratory results');

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Sen bir veteriner laboratuvar uzmanısın. Daha önce ki ."
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
    handleAIError(error);
  }
}; 