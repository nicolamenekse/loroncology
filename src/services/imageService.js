import OpenAI from 'openai';

// OpenAI API anahtarını al
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('OpenAI API anahtarı bulunamadı! Lütfen .env dosyasında VITE_OPENAI_API_KEY olduğundan emin olun.');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Veteriner onkolojisi için özel prompt şablonları
const PROMPT_TEMPLATES = {
  'Onkoloji': 'professional photograph of a modern veterinary clinic, caring veterinarian with pet, advanced medical equipment, gentle examination, clean and bright environment',
  'Tedavi Yöntemleri': 'modern veterinary treatment room, caring veterinarian helping animal patient, state-of-the-art equipment, clean and professional setting',
  'Hasta Bakımı': 'heartwarming scene of veterinarian caring for pet, gentle interaction, comfortable clinic environment, soft lighting, professional medical setting',
  'Araştırmalar': 'modern veterinary laboratory setting, professional medical research environment, scientific equipment, clean workspace, bright lighting',
  'Genel': 'welcoming veterinary clinic entrance, professional medical staff, modern facility, caring atmosphere, clean environment'
};

export const generateImagePrompt = async (title, content, category) => {
  try {
    // Başlık ve içerikten anahtar kelimeleri çıkar
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Sen bir veteriner uzmanısın. Verilen başlık ve içerikten, görsel oluşturmak için en önemli 2-3 GENEL veterinerlik terimini İngilizce olarak belirle (örn: veterinary care, animal health, pet wellness). Hastalık isimleri, tıbbi terimler veya tedavi yöntemleri KULLANMA. Sadece genel ve pozitif terimleri virgülle ayırarak dön."
        },
        {
          role: "user",
          content: `Başlık: ${title}\nİçerik: ${content.slice(0, 300)}...`
        }
      ],
      temperature: 0.7,
      max_tokens: 50
    });

    const keywords = completion.choices[0].message.content.trim();
    console.log('Generated keywords:', keywords);

    // Kategori için uygun şablonu seç ve anahtar kelimeleri yerleştir
    const template = PROMPT_TEMPLATES[category] || PROMPT_TEMPLATES['Genel'];
    const prompt = template.replace('[subject]', keywords);

    console.log('Final prompt:', prompt);
    return prompt;
  } catch (error) {
    console.error('Prompt oluşturma hatası:', error);
    return 'professional photograph of veterinary clinic, modern medical setting, soft lighting, caring atmosphere';
  }
};

export const generateBlogImage = async (title, content, category) => {
  try {
    if (!title || !content || !category) {
      throw new Error('Görsel oluşturmak için başlık, içerik ve kategori gerekli');
    }

    // Önce GPT ile prompt oluştur
    const imagePrompt = await generateImagePrompt(title, content, category);
    console.log('Generated prompt:', imagePrompt);

    // DALL-E ile görsel oluştur
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1792x1024",
      quality: "standard",
      style: "natural"
    });

    if (!response.data || !response.data[0] || !response.data[0].url) {
      throw new Error('DALL-E geçerli bir görsel URL\'si döndürmedi');
    }

    return response.data[0].url;
  } catch (error) {
    console.error('Görsel oluşturma hatası:', error);
    
    // Kategori bazlı fallback görseller - Genel veterinerlik görselleri
    const fallbackImages = {
      'Onkoloji': '/images/fallback/oncology.jpg',
      'Tedavi Yöntemleri': '/images/fallback/treatment.jpg',
      'Hasta Bakımı': '/images/fallback/patient-care.jpg',
      'Araştırmalar': '/images/fallback/research.jpg',
      'Genel': '/images/fallback/general.jpg'
    };

    return fallbackImages[category] || fallbackImages['Genel'];
  }
};