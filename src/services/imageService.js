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

const convertImageToBase64 = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Görsel base64\'e dönüştürülürken hata:', error);
    throw error;
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

    // Görseli base64'e dönüştür
    const base64Image = await convertImageToBase64(response.data[0].url);
    return base64Image;
  } catch (error) {
    console.error('Görsel oluşturma hatası:', error);
    
    // Kategori bazlı fallback görseller - Geçerli base64 formatında
    const fallbackImages = {
      'Onkoloji': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5WZXRlcmluZXIgT25rb2xvamk8L3RleHQ+Cjwvc3ZnPgo=',
      'Tedavi Yöntemleri': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5UZWRhdmkgWcO2bnRlbWxlcml8L3RleHQ+Cjwvc3ZnPgo=',
      'Hasta Bakımı': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5IYXN0YSBCYWvEsW3EsTwvdGV4dD4KPC9zdmc+Cg==',
      'Araştırmalar': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BcmHDnGxhcm1hPC90ZXh0Pgo8L3N2Zz4K',
      'Genel': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5WZXRlcmluZXIgQmxvZzwvdGV4dD4KPC9zdmc+Cg=='
    };

    // Fallback görseli base64 formatında döndür
    return fallbackImages[category] || fallbackImages['Genel'];
  }
};