const { GoogleGenerativeAI } = require('@google/generative-ai');

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log("📡 Model test ediliyor...");

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest",
        });

        const result = await model.generateContent("Merhaba");
        console.log("✅ Bağlantı başarılı!");
        console.log(result.response.text());

    } catch (error) {
        console.error("🔥 HATA DETAYI:");
        console.error("Mesaj:", error.message);
        process.exit(1);
    }
}

main();
