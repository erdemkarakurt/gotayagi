const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;

// AJAN KONTROLÜ: Şifre GitHub'dan geliyor mu?
if (!apiKey) {
    console.error("🔥 HATA: API Anahtarı BOŞ! GitHub Secrets yanlış ayarlanmış.");
    process.exit(1);
} else {
    console.log(`✅ Şifre algılandı! Uzunluk: ${apiKey.length} karakter. İlk 3 harf: ${apiKey.substring(0, 3)}`);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function main() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = "Bana komik, saçma sapan, mantıksız cümlelerden oluşan, yarı komik bir kişisel gelişim sözü yaz. Sadece sözü ver.";
        
        const result = await model.generateContent(prompt);
        const quote = result.response.text().trim();
        
        fs.writeFileSync('yazi.txt', quote);
        console.log("Yeni saçmalık başarıyla üretildi:", quote);

    } catch (error) {
        console.error("🔥 API Hatası Detayı:", error.message);
        process.exit(1); 
    }
}

main();
