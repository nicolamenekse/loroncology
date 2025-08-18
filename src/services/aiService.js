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

// Fallback API key from environment variable - Backend için process.env kullan
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

// Helper function to format patient data for AI analysis
const formatPatientDataForAI = (patientData) => {
  const {
    tur, yas, cinsiyet, kilo, anamnez,
    radyolojikBulgular, ultrasonografikBulgular, tomografiBulgular,
    patoloji, mikroskopisi, patolojikTeshis,
    hemogram, biyokimya
  } = patientData;

  // Chief complaint (ana şikayet) - anamnez'den çıkar
  const chief = anamnez ? anamnez.substring(0, 100) + (anamnez.length > 100 ? '...' : '') : 'Belirtilmemiş';

  // Physical examination (muayene özeti)
  const pe = [];
  if (radyolojikBulgular) pe.push(`Radyoloji: ${radyolojikBulgular}`);
  if (ultrasonografikBulgular) pe.push(`USG: ${ultrasonografikBulgular}`);
  if (tomografiBulgular) pe.push(`CT: ${tomografiBulgular}`);
  if (patoloji) pe.push(`Patoloji: ${patoloji}`);
  if (mikroskopisi) pe.push(`Mikroskopi: ${mikroskopisi}`);
  if (patolojikTeshis) pe.push(`Patolojik Tanı: ${patolojikTeshis}`);

  // Laboratory results (lab özeti) - sadece anormalleri
  const labs = [];
  if (hemogram) labs.push(`Hemogram: ${hemogram}`);
  if (biyokimya) labs.push(`Biyokimya: ${biyokimya}`);

  // History (anamnez kısa)
  const history = anamnez ? anamnez.substring(0, 200) + (anamnez.length > 200 ? '...' : '') : 'Belirtilmemiş';

  return {
    Species: tur || 'Belirtilmemiş',
    Age: yas ? `${yas} yaş` : 'Belirtilmemiş',
    Sex: cinsiyet || 'Belirtilmemiş',
    Weight: kilo ? `${kilo} kg` : 'Belirtilmemiş',
    Chief: chief,
    PE: pe.length > 0 ? pe.join('; ') : 'Belirtilmemiş',
    Labs: labs.length > 0 ? labs.join('; ') : 'Belirtilmemiş',
    History: history
  };
};

export const generatePatientAnalysis = async (patientData) => {
  if (!isAIServiceAvailable()) {
    throw new Error('AI servisi şu anda kullanılamıyor. Lütfen sistem yöneticinize başvurun.');
  }

  try {
    console.log('Generating analysis for patient:', patientData._id);
    
    const formattedData = formatPatientDataForAI(patientData);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Sen bir Türk veteriner hekimisin. Sadece Türkçe yanıt ver. Kesinlikle İngilizce kelime kullanma. Tüm tıbbi terimleri Türkçe olarak yaz. Sadece geçerli minified JSON çıktısı ver."
        },
        {
          role: "user",
          content: `Hasta Bilgileri:
Tür: ${formattedData.Species}
Yaş: ${formattedData.Age}
Cinsiyet: ${formattedData.Sex}
Kilo: ${formattedData.Weight}
Ana Şikayet: ${formattedData.Chief}
Muayene Bulguları: ${formattedData.PE}
Laboratuvar: ${formattedData.Labs}
Anamnez: ${formattedData.History}

Görev: En olası diferansiyel tanıları ve sonraki testleri belirle. Kesinlikle sadece Türkçe yaz. İngilizce kelime kullanma.
Döndür:
{"differentials":[{"dx":"", "rationale":"", "likelihood":0-1}],
 "tests":[{"name":"", "why":""}],
 "red_flags":["",""]}`
        }
      ],
      temperature: 0.1,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    if (!completion.choices || !completion.choices[0]?.message?.content) {
      throw new Error('OpenAI API geçersiz yanıt döndürdü');
    }

    console.log('Analysis generated successfully');
    const response = completion.choices[0].message.content;
    
    // JSON parse kontrolü
    try {
      const parsedResponse = JSON.parse(response);
      return parsedResponse;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Eğer JSON parse edilemezse, raw response'u döndür
      return { rawResponse: response, error: 'JSON parse edilemedi' };
    }
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
    
    const formattedData = formatPatientDataForAI(patientData);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Sen bir Türk veteriner hekimisin. Sadece Türkçe yanıt ver. Kesinlikle İngilizce kelime kullanma. Tüm tıbbi terimleri Türkçe olarak yaz. Sadece geçerli minified JSON çıktısı ver."
        },
        {
          role: "user",
          content: `Hasta Bilgileri:
Tür: ${formattedData.Species}
Yaş: ${formattedData.Age}
Cinsiyet: ${formattedData.Sex}
Kilo: ${formattedData.Weight}
Ana Şikayet: ${formattedData.Chief}
Muayene Bulguları: ${formattedData.PE}
Laboratuvar: ${formattedData.Labs}
Anamnez: ${formattedData.History}

Görev: Tedavi önerileri oluştur. Kesinlikle sadece Türkçe yaz. İngilizce kelime kullanma.
Döndür:
{"treatments":[{"treatment":"", "rationale":"", "priority":"yüksek/orta/düşük"}],
 "medications":[{"name":"", "dosage":"", "duration":"", "notes":""}],
 "monitoring":["",""],
 "follow_up":"",
 "prognosis":"iyi/orta/kötü"}`
        }
      ],
      temperature: 0.1,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    if (!completion.choices || !completion.choices[0]?.message?.content) {
      throw new Error('OpenAI API geçersiz yanıt döndürdü');
    }

    console.log('Treatment suggestions generated successfully');
    const response = completion.choices[0].message.content;
    
    try {
      const parsedResponse = JSON.parse(response);
      return parsedResponse;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return { rawResponse: response, error: 'JSON parse edilemedi' };
    }
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
          content: "Sen bir Türk veteriner hekimisin. Sadece Türkçe yanıt ver. Kesinlikle İngilizce kelime kullanma. Tüm tıbbi terimleri Türkçe olarak yaz. Sadece geçerli minified JSON çıktısı ver."
        },
        {
          role: "user",
          content: `Laboratuvar Sonuçları:
Hemogram: ${labData.hemogram || 'Belirtilmemiş'}
Biyokimya: ${labData.biyokimya || 'Belirtilmemiş'}

Görev: Laboratuvar sonuçlarını analiz et ve anormallikleri belirle. Kesinlikle sadece Türkçe yaz. İngilizce kelime kullanma.
Döndür:
{"abnormalities":[{"parameter":"", "value":"", "reference_range":"", "significance":""}],
 "interpretation":"",
 "recommendations":[{"action":"", "reason":""}],
 "differential_diagnosis":["",""],
 "next_steps":["",""]}`
        }
      ],
      temperature: 0.1,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    if (!completion.choices || !completion.choices[0]?.message?.content) {
      throw new Error('OpenAI API geçersiz yanıt döndürdü');
    }

    console.log('Lab analysis generated successfully');
    const response = completion.choices[0].message.content;
    
    try {
      const parsedResponse = JSON.parse(response);
      return parsedResponse;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return { rawResponse: response, error: 'JSON parse edilemedi' };
    }
  } catch (error) {
    console.error('OpenAI API Error:', {
      name: error.name,
      message: error.message,
      status: error.status
    });
    throw new Error(`AI laboratuvar analizi oluşturulurken bir hata oluştu: ${error.message}`);
  }
};

// Blog görsel oluşturma fonksiyonu (mevcut)
export const generateBlogImage = async (title, content, category) => {
  if (!isAIServiceAvailable()) {
    throw new Error('AI servisi şu anda kullanılamıyor. Lütfen sistem yöneticinize başvurun.');
  }

  try {
    console.log('Generating blog image for:', title);
    
    const completion = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Veteriner onkoloji blog yazısı için profesyonel görsel oluştur: ${title}. Kategori: ${category}. Stil: tıbbi, profesyonel, temiz tasarım. Türkçe veteriner tıp teması.`,
      n: 1,
      size: "1024x1024",
    });

    if (!completion.data || !completion.data[0]?.url) {
      throw new Error('OpenAI DALL-E API geçersiz yanıt döndürdü');
    }

    console.log('Blog image generated successfully');
    return completion.data[0].url;
  } catch (error) {
    console.error('OpenAI DALL-E API Error:', {
      name: error.name,
      message: error.message,
      status: error.status
    });
    throw new Error(`Blog görseli oluşturulurken bir hata oluştu: ${error.message}`);
  }
};