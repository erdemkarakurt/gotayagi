const fs = require("fs");

const API_KEY = process.env.GROQ_API_KEY;

if (!fs.existsSync("content")) fs.mkdirSync("content", { recursive: true });

const historyFile = "content/history.json";
let history = [];
if (fs.existsSync(historyFile)) {
  try {
    history = JSON.parse(fs.readFileSync(historyFile, "utf-8"));
  } catch { history = []; }
}

function generateTitle(topic) {
  const patterns = [
    `${topic}: Nasibin cilvesi mi yoksa bir imtihan mı?`,
    `${topic} ve insanın kendiyle olan bitmeyen davası`,
    `${topic} üzerine bir nükte ve bin bir ibret`,
    `${topic}: Dalgın ruhlar için hayatta kalma rehberi`,
    `${topic} yaparken aniden gelen o küçük uyanış`
  ];
  return patterns[Math.floor(Math.random() * patterns.length)];
}

async function generateText() {
  if (!API_KEY) {
    console.error("🔥 HATA: GROQ_API_KEY eksik!");
    process.exit(1);
  }

  const topics = [
    "soğuyan çay", "kaybolan anahtarlar", "tek kalan çoraplar", 
    "açılmayan kavanoz kapağı", "boş cüzdan", "bayram temizliği", 
    "yol sormak", "pazar sabahı uyanmak", "ayakkabı sıkması",
    "yarım kalan rüyalar", "yanlışlıkla atılan mesajlar", "durak kaçırmak"
  ];
  const topic = topics[Math.floor(Math.random() * topics.length)];

  // 🧠 SİSTEM ROLÜ: Nüktedan ve "Ters Köşe" Yapan Bilge
  const messages = [
    {
      role: "system",
      content: `Sen "Göt Ayağı" sitesinin nüktedan ve hafif çatlak bir filozofusun. 
      Tarzın: Çok ağırbaşlı ve hikmetli bir cümleyle başla; sonra durumu öyle bir 'ters köşe' yap ki absürt ve komik olsun. 
      Kitle: İnançlı ve geleneksel insanlar. 
      Kurallar: Değerlerle asla dalga geçme, insanın kendi sakarlığı ve dünya telaşıyla dalga geç. 
      KESİNLİKLE YASAKLAR: "Evren", "Sır", "Enerji", "Kuantum", "Yıldızlar" gibi ifadeleri asla kullanma. 
      Örnek: "Çayının soğuması nasibinin kesilmesi değil, hayatın sana 'biraz dur da etrafına bak' deme şeklidir. Sen yine de çayı dökme, içine biraz sıcak su ekle; israf da bir nevi nasipsizliktir."`
    },
    {
      role: "user",
      content: `Konu: ${topic}. Bana bugünün 'hikmetli' saçmalığını yaz.`
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
          temperature: 0.95, // Mizahın "beklenmedik" olması için biraz artırdık
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
        
        console.log("✅ Yeni nükte yayında:", content);
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
