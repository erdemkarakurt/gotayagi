const fs = require("fs");

const API_KEY = process.env.GROQ_API_KEY;

// 📁 Klasör ve Geçmiş Yönetimi
if (!fs.existsSync("content")) fs.mkdirSync("content", { recursive: true });

const historyFile = "content/history.json";
let history = [];
if (fs.existsSync(historyFile)) {
  try {
    history = JSON.parse(fs.readFileSync(historyFile, "utf-8"));
  } catch { history = []; }
}

// 🔥 Başlık Üretici (İnanç eksenli ve vakur ama absürt)
function generateTitle(topic) {
  const patterns = [
    `${topic}: Nasibin cilvesi mi yoksa sadece bir dalgınlık mı?`,
    `${topic} üzerine bir tevazu denemesi`,
    `${topic} ve sabrın sonundaki o görünmez selam`,
    `${topic} yaparken aniden gelen o küçük ibret`,
    `${topic}: İnsanın kendi acizliğiyle imtihanı`
  ];
  return patterns[Math.floor(Math.random() * patterns.length)];
}

async function generateText() {
  if (!API_KEY) {
    console.error("🔥 HATA: GROQ_API_KEY bulunamadı!");
    process.exit(1);
  }

  // 🍎 Konular (Mutfaktan sokağa, tamamen hayatın içinden)
  const topics = [
    "soğuyan çay", "kaybolan anahtarlar", "pazar sabahı", 
    "eskiyen ayakkabı", "komşunun ikramı", "yağmura yakalanmak", 
    "yarım kalan uyku", "bayram temizliği", "beklenen misafir",
    "kapanmayan bavul", "yol sormak", "pencereden dışarı bakmak"
  ];
  const topic = topics[Math.floor(Math.random() * topics.length)];

  // 🧠 Sistem Rolü: Vakur ve Hikmetli Absürt Filozof
  const messages = [
    {
      role: "system",
      content: `Sen "Göt Ayağı" sitesinin, inançlı ve geleneksel değerlere saygılı, hafif nüktedan bir filozofusun. 
      Tarzın: Derin bir ahlaki giriş yap veya insanın acizliğini hatırlat; metni tamamen alakasız, gündelik ve absürt bir tavsiye ile bitir. 
      Hassasiyet: İnançlı insanlara hitap ediyorsun. Dini değerlerle veya ibadetlerle asla alay etme. 
      Yasaklar: "Evrenin sırrı", "Enerji", "Kuantum", "Yıldızlar" gibi New Age veya seküler klişeleri asla kullanma. 
      Kurallar: Maksimum 2-3 kısa cümle. Türkçe karakterlere dikkat et.`
    },
    {
      role: "user",
      content: `Konu: ${topic}. Bugünün aydınlanmasını yaz.`
    }
  ];

  let tries = 0;
  while (tries < 3) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: messages,
          temperature: 0.8, // Daha oturaklı ve kontrollü bir mizah için.
          max_tokens: 300,
          top_p: 1
        })
      });

      const data = await res.json();
      let content = data?.choices?.[0]?.message?.content?.replace(/"/g, '').trim();

      if (content && content.length > 10) {
        const now = new Date();
        const payload = {
          date: now.toISOString().split("T")[0],
          timestamp: now.getTime(),
          topic,
          title: generateTitle(topic),
          text: content
        };

        fs.writeFileSync(`content/${payload.timestamp}.json`, JSON.stringify(payload, null, 2));
        fs.writeFileSync("data.json", JSON.stringify(payload, null, 2));
        
        history.push(payload);
        fs.writeFileSync(historyFile, JSON.stringify(history.slice(-30), null, 2));
        
        console.log("✅ Yeni içerik:", content);
        return; 
      }
      tries++;
    } catch (err) {
      console.error("Hata:", err.message);
      tries++;
    }
  }
}

generateText();
