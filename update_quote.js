const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("🔥 HATA: API Key GitHub Secrets'tan alınamadı!");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Denenecek model listesi (En iyiden en garantiye)
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    let success = false;

    for (const modelName of models) {
        try {
            console.log(`📡 Denenen model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            
            const prompt = "Kısa, komik ve saçma bir motivasyon cümlesi yaz. Sadece cümleyi ver.";
            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            
            fs.writeFileSync('yazi.txt', text);
            console.log(`✅ ${modelName} ile başarıyla üretildi:`, text);
            success = true;
            break; // Başarılı olursa döngüden çık
        } catch (error) {
            console.warn(`⚠️ ${modelName} çalışmadı, hata: ${error.message}`);
            continue; // Sıradaki modeli dene
        }
    }

    if (!success) {
        console.error("🔥 HATA: Hiçbir modelle bağlantı kurulamadı. Google projesinde API yetkisi eksik olabilir.");
        process.exit(1);
    }
}

main();
