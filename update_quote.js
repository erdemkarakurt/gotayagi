const { GoogleGenerativeAI } = require('@google/generative-ai');

async function main() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
        console.log("📡 Model test ediliyor...");

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest", // 🔥 KRİTİK FIX
        });

        const result = await model.generateContent("Saçma ama komik bir söz yaz");
        const text = result.response.text();

        require("fs").writeFileSync("yazi.txt", text);

        console.log("✅ Yazı üretildi:", text);

    } catch (error) {
        console.error("🔥 HATA:", error.message);
        process.exit(1);
    }
}

main();
