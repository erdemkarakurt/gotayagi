const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;

// Güvenlik ve varlık kontrolü
if (!apiKey) {
    console.error("🔥 HATA: API Anahtarı GitHub Secrets'tan çekilemedi!");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function main() {
    try {
        // En güncel ve stabil Flash model ismini kullanıyoruz
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = "Bana komik, saçma sapan, mantıksız cümlelerden oluşan, yarı komik bir kişisel gelişim sözü yaz. Başka hiçbir açıklama yapma. Ekranda tam ortada duracak kısa bir manifesto gibi olsun.";
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const quote = response.text().trim();
        
        fs.writeFileSync('yazi.txt', quote);
        console.log("✅ Başarıyla yeni saçmalık üretildi:", quote);

    } catch (error) {
        // Eğer 404 hatası devam ederse hatanın detayını buradan göreceğiz
        console.error("🔥 Google API Hatası:", error.message);
        process.exit(1); 
    }
}

main();
