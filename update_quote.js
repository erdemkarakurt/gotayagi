const { GoogleGenerativeAI } = require('@google/generative-ai');

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // Hangi modellere iznimiz olduğunu listeliyoruz
        console.log("📡 Mevcut modeller kontrol ediliyor...");
        
        // Bu kısım doğrudan API'den senin anahtarına açık olan modelleri çeker
        // Not: Bazı kütüphane versiyonlarında bu method farklılık gösterebilir
        // O yüzden en basit denemeyi yapıyoruz:
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Merhaba");
        console.log("✅ Bağlantı başarılı!");
    } catch (error) {
        console.error("🔥 HATA DETAYI:");
        console.error("Mesaj:", error.message);
        if (error.message.includes("location")) {
            console.error("🚨 SORUN: Bölgesel kısıtlama! GitHub sunucuları (ABD) üzerinden bu anahtarı kullanamıyorsun.");
        }
        process.exit(1);
    }
}

main();
