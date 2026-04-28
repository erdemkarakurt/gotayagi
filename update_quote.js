const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
    try {
        const prompt = "Bana komik, saçma sapan, mantıksız cümlelerden oluşan, yarı komik bir kişisel gelişim sözü yaz. Başka hiçbir açıklama yapma. Ekranda tam ortada duracak kısa bir manifesto gibi olsun.";
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const quote = response.text.trim();
        fs.writeFileSync('yazi.txt', quote);
        console.log("Yeni saçmalık başarıyla üretildi:", quote);

    } catch (error) {
        console.error("API Hatası:", error);
        process.exit(1); 
    }
}

main();
