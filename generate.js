const fs = require("fs");

const API_KEY = process.env.GROQ_API_KEY;

// 🔥 FIX: klasör yoksa oluştur
if (!fs.existsSync("content")) {
  fs.mkdirSync("content", { recursive: true });
}

async function generateText() {
  const topics = [
    "başarı", "tembellik", "zenginlik", "motivasyon",
    "hayatın anlamı", "hiçlik", "çalışmamak", "başarısızlık"
  ];

  const topic = topics[Math.floor(Math.random() * topics.length)];

  const prompt = `
Türkçe absürt kişisel gelişim yazısı yaz.

Kurallar:
- 3-5 cümle
- komik ve mantıksız
- çelişkili
- motivasyon gibi başlayıp saçmalayacak
- konu: ${topic}
`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 1.2
    })
  });

  const data = await res.json();

  const text = data?.choices?.[0]?.message?.content || "Evren sessiz kaldı.";

  const date = new Date().toISOString().split("T")[0];

  const payload = {
    date,
    topic,
    text
  };

  fs.writeFileSync(`content/${date}.json`, JSON.stringify(payload, null, 2));
  fs.writeFileSync("data.json", JSON.stringify(payload, null, 2));
}

generateText();
