const fs = require("fs");

// API anahtarını GitHub Secrets'tan GROQ_API_KEY olarak eklediğinden emin ol
const API_KEY = process.env.GROQ_API_KEY;

// 📁 Klasör garantisi
if (!fs.existsSync("content")) {
  fs.mkdirSync("content", { recursive: true });
}

// 📦 Geçmiş kaydı (Aynı şeyleri tekrar etmemek için)
const historyFile = "content/history.json";
let history = [];
if (fs.existsSync(historyFile)) {
  try {
    history = JSON.parse(fs.readFileSync(historyFile, "utf-8"));
  } catch {
    history = [];
  }
}

// 🔥 URL dostu isim üretici
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// 🔥 Absürt Başlık Üretici
function generateTitle(topic) {
  const patterns = [
    `${topic} ve kuantum evrenindeki terliksiz gezi rehberi`,
    `${topic} yaparken aniden gelen o mantıksız aydınlanma`,
    `${topic} aslında bir simülasyon hatası mı?`,
    `${topic} üzerine düşünmek beyni nasıl karbonatlaştırır?`,
    `${topic}: Ruhun vites kolunu bulma sanatı`
  ];
  return patterns[Math.floor(Math.random() * patterns.length)];
}

// ❌ Tekrar kontrolü
function isDuplicate(text) {
  return history.some(h => h.text === text);
}

// 🧠 Filtre (Sistemci önlemi)
function isUnsafe(text) {
  const banned = ["intihar", "ölüm", "şiddet", "kan"];
  const lower = text.toLowerCase();
  return banned.some(w => lower.includes(w));
}

async function generateText() {
  if (!API_KEY) {
    console.error("🔥 GROQ_API_KEY eksik!");
    process.exit(1);
  }

  const topics = ["domates soymak", "boş duvara bakmak", "çorap eşleştirmek", "otobüs beklemek", "tavanla konuşmak", "USB takmaya çalışmak"];
  const topic = topics[Math.floor(Math.random() * topics.length)];

  // 💥 ABSÜRT PROMPT: Burayı özellikle "mantıksızlık" üzerine kurguladım
  const prompt = `
  Sen dünyanın en mantıksız kişisel gelişim uzmanısın. 
  Konumuz: ${topic}
  
  GÖREV:
  - Birbirinden tamamen alakasız iki kavramı birleştir.
  - Önce çok ciddi bir tavsiye veriyormuş gibi başla, sonra cümleyi saçmalaştır.
  - Cümleler "yarı komik" ve "ne alakası var şimdi" dedirtecek türde olmalı.
  - Maksimum 2 kısa cümle.
  - Örnek: "Sabahları erken kalkmak ruhunu dinlendirir çünkü buzdolabının ışığı sadece sen bakmadığında söner. Ayakkabılarını ters giy ki evren seni takip edemesin."

  Şimdi en saçma manifestonu yaz:
  `;

  let text = "";
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
          messages: [{ role: "user", content: prompt }],
          temperature: 1.5, // Yaratıcılığı (ve saçmalamayı) tavana vurdurduk
          max_tokens: 100
        })
      });

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content?.replace(/"/g, ''); // Tırnakları temizle

      if (content && !isUnsafe(content) && !isDuplicate(content)) {
        text = content.trim();
        break;
      }
      tries++;
    } catch (err) {
      console.error("Bağlantı hatası:", err.message);
      tries++;
    }
  }

  if (!text) {
    console.error("AI içerik üretemedi.");
    process.exit(1);
  }

  const now = new Date();
  const payload = {
    date: now.toISOString().split("T")[0],
    timestamp: now.getTime(),
    topic,
    title: generateTitle(topic),
    text
  };

  // 💾 Dosyaları kaydet
  fs.writeFileSync(`content/${payload.timestamp}.json`, JSON.stringify(payload, null, 2));
  fs.writeFileSync("data.json", JSON.stringify(payload, null, 2));

  // 📚 Geçmişi güncelle (Son 30 kayıt)
  history.push(payload);
  fs.writeFileSync(historyFile, JSON.stringify(history.slice(-30), null, 2));

  console.log("✅ Yeni saçmalık yayında:", text);
}

generateText();
