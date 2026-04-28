const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("🔥 HATA: API Key GitHub'dan gelmiyor!");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // En garanti model ismi budur. "v1beta" yerine kütüphane bunu otomatik çözer.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = "Kısa, komik ve saçma bir motivasyon cümlesi yaz. Sadece cümleyi ver.";
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        
        fs.writeFileSync('yazi.txt', text);
        console.log("✅ Başarılı! Üretilen Metin:", text);

    } catch (error) {
        console.error("🔥 Google API Hatası:");
        console.error(error.message);
        // Eğer hala 404 alıyorsak, Google hesabında bir kısıtlama var demektir.
        process.exit(1);
    }
}

main();
