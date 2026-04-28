const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("🔥 HATA: API Key gelmedi!");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // En standart isimle çağırıyoruz
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = "Kısa, saçma, komik bir motivasyon sözü yaz. Sadece sözü ver, tırnak işareti olmasın.";
        
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        
        fs.writeFileSync('yazi.txt', text);
        console.log("✅ Üretilen Metin:", text);

    } catch (error) {
        console.error("🔥 Google API Hatası Veriyor:");
        console.error(error.message);
        process.exit(1);
    }
}

main();
