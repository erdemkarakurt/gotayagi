const fs = require("fs");
const API_KEY = process.env.GROQ_API_KEY;

if (!fs.existsSync("content")) fs.mkdirSync("content", { recursive: true });

function generateTitle(topic) {
  const patterns = [`${topic} Üzerine Bir Nükte`, `${topic} ve İnsanın Halleri`, `${topic} Hakkında` ];
  return patterns[Math.floor(Math.random() * patterns.length)];
}

async function generateText() {
  if (!API_KEY) process.exit(1);

  const topics = ["soğuyan çay", "kaybolan anahtar", "tek kalan çorap", "boş cüzdan", "durak kaçırmak", "ayakkabı sıkması"];
  const topic = topics[Math.floor(Math.random() * topics.length)];

  const messages = [
    {
      role: "system",
      content: `Sen "Göt Ayağı" sitesinin nüktedan filozofusun. 
      GÖREV: Konuyla ilgili SADECE TEK BİR KISA PARAGRAF (maksimum 20-25 kelime) yaz. 
      TARZ: Ciddi başla, absürt ve komik bitir. 
      YASAK: Maneviyata/ruha dil uzatma, "evren/enerji" gibi kelimeler kullanma. 
      ÖRNEK: "Cüzdanın boşluğu imtihandır lakin asıl dert içine sığdıramadığın market fişleridir. Bir kuru yaprak koy ki parasızlığın bari estetik görünsün."`
    },
    { role: "user", content: `Konu: ${topic}.` }
  ];

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: messages,
        temperature: 0.8,
        max_tokens: 150 // Kısa kesmesi için iyice kısıtladık
      })
    });

    const data = await res.json();
    let content = data?.choices?.[0]?.message?.content?.replace(/"/g, '').trim();

    const payload = {
      date: new Date().toISOString().split("T")[0],
      timestamp: Date.now(),
      topic,
      title: generateTitle(topic),
      text: content
    };

    fs.writeFileSync("data.json", JSON.stringify(payload, null, 2));
    console.log("✅ Kısa nükte hazır.");
  } catch (err) { process.exit(1); }
}
generateText();
