const fs = require("fs");

const API_KEY = process.env.GROQ_API_KEY;

if (!fs.existsSync("content")) {
  fs.mkdirSync("content", { recursive: true });
}

const historyFile = "content/history.json";
let history = [];
if (fs.existsSync(historyFile)) {
  try {
    history = JSON.parse(fs.readFileSync(historyFile, "utf-8"));
  } catch {
    history = [];
  }
}

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

async function generateText() {
  if (!API_KEY) {
    console.error("🔥 GROQ_API_KEY eksik!");
    process.exit(1);
  }

  const topics = ["domates soymak", "boş duvara bakmak", "çorap eşleştirmek", "otobüs beklemek", "tavanla konuşmak", "USB takmaya çalışmak", "yoğurt kabına yemek koymak"];
  const topic = topics[Math.floor(Math.random() * topics.length)];

  // PROMPT: Türkçe karakter hassasiyeti eklendi
  const prompt = `
  Sen dünyanın en mantıksız ve absürt kişisel gelişim uzmanısın. 
  Konumuz: ${topic}
  
  GÖREV:
  - Ciddi bir tavsiye ile başla, tamamen alakasız ve saçma bir kavramla bitir.
  - Maksimum 2-3 kısa cümle yaz.
  - Kesinlikle TÜRKÇE karakterleri düzgün kullan (ğ, ş, i, ç, ö, ü).
  - Kelime uydurma, gerçek kelimelerle saçmala.
  - Örnek: "Sabahları erken kalkmak ruhunu dinlendirir çünkü buzdolabının ışığı sadece sen bakmadığında söner."

  Şimdi absürt manifestonu yaz:
  `;

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
          temperature: 1.1, // 1.5 ÇOK YÜKSEK, 1.1 "kontrollü saçmalama" sağlar
          max_tokens: 400,  // Yarım kalmaması için alanı genişlettik
          top_p: 0.9        // Daha tutarlı kelime seçimi
        })
      });

      const data = await res.json();
      let content = data?.choices?.[0]?.message?.content?.replace(/"/g, '').trim();

      if (content && content.length > 10) {
        // Veriyi kaydetme aşaması
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
        
        console.log("✅ Yeni saçmalık yayında:", content);
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
