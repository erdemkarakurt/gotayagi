const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Stabil kütüphane ile API'ye bağlanıyoruz
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = "Bana komik, saçma sapan, mantıksız cümlelerden oluşan, yarı komik bir kişisel gelişim sözü yaz. Başka hiçbir açıklama yapma. Ekranda tam ortada duracak kısa bir manifesto gibi olsun.";
        
        const result = await model.generateContent(prompt);
        const quote = result.response.text().trim();
        
        fs.writeFileSync('yazi.txt', quote);
        console.log("Yeni saçmalık başarıyla üretildi:", quote);

    } catch (error) {
        console.error("API Hatası:", error);
        process.exit(1); 
    }
}

main();
