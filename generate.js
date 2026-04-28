const fs = require("fs");

const API_KEY = process.env.GROQ_API_KEY;

// 📁 klasör garantisi
if (!fs.existsSync("content")) {
  fs.mkdirSync("content", { recursive: true });
}

const historyFile = "content/history.json";
let history = [];

if (fs.existsSync(historyFile)) {
  try {
    history = JSON.parse(fs.readFileSync(historyFile));
  } catch {
    history = [];
  }
}

// 🔥 slug generator
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// 🔥 viral title
function generateTitle(topic) {
  const patterns = [
    `${topic} hakkında kimsenin bilmediği gerçek`,
    `${topic} yüzünden hayatım değişti`,
    `${topic} aslında tamamen yanlış anlaşılmış`,
    `Uzmanlara göre ${topic} bir illüzyon`,
    `${topic} ve evrenin gizli düzeni`
  ];

  return patterns[Math.floor(Math.random() * patterns.length)];
}

// ❌ duplicate check
function isDuplicate(text) {
  return history.some(h => h.text === text);
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
- komik, mantıksız, çelişkili
- konu: ${topic}
`;

  let text = "";
  let tries = 0;

  while (tries < 3) {
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

    console.log("GROQ RESPONSE:", JSON.stringify(data));

    if (!data?.choices?.[0]?.message?.content) {
      console.log("AI ERROR:", data);
      tries++;
      continue;
    }

    text = data.choices[0].message.content;

    if (!isDuplicate(text)) break;

    tries++;
  }

  const date = new Date().toISOString().split("T")[0];

  const title = generateTitle(topic);
  const slug = slugify(title);

  const payload = {
    date,
    topic,
    title,
    slug,
    text
  };

  fs.writeFileSync(`content/${date}.json`, JSON.stringify(payload, null, 2));
  fs.writeFileSync("data.json", JSON.stringify(payload, null, 2));

  history.push(payload);
  history = history.slice(-30);

  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
}

generateText();
