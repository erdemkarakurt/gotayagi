const fs = require("fs");

const API_KEY = process.env.GROQ_API_KEY;

// 📁 klasör garantisi
if (!fs.existsSync("content")) {
  fs.mkdirSync("content", { recursive: true });
}

// 📦 history
const historyFile = "content/history.json";
let history = [];

if (fs.existsSync(historyFile)) {
  try {
    history = JSON.parse(fs.readFileSync(historyFile, "utf-8"));
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

// 🔥 title generator
function generateTitle(topic) {
  const patterns = [
    `${topic} hakkında kimsenin fark etmediği gerçek`,
    `${topic} düşündüğünden daha karmaşık olabilir`,
    `${topic} aslında yanlış sorulmuş bir soru`,
    `${topic} ve mantığın kısa devresi`,
    `${topic} üzerine konuşurken yanlışlıkla doğruyu bulmak`
  ];

  return patterns[Math.floor(Math.random() * patterns.length)];
}

// ❌ duplicate check
function isDuplicate(text) {
  return history.some(h => h.text === text);
}

// 🧠 safety filter
function isUnsafe(text) {
  const banned = ["intihar", "ölüm", "şiddet", "kendini", "kan"];
  const lower = text.toLowerCase();
  return banned.some(w => lower.includes(w));
}

async function generateText() {
  if (!API_KEY) throw new Error("GROQ_API_KEY missing!");

  const topics = [
    "başarı",
    "tembellik",
    "zenginlik",
    "motivasyon",
    "hayatın anlamı",
    "hiçlik",
    "çalışmamak",
    "başarısızlık"
  ];

  const topic = topics[Math.floor(Math.random() * topics.length)];

  // 💥 ZİHİN KURCALAYAN PROMPT
  const prompt = `
Sen "gotayagi" adlı absürt ve zihin kurcalayan kişisel gelişim evreninin yazarıısın.

Görev:
Mantıklı gibi başlayıp giderek çelişen ve sonunda paradoks bırakan 4 cümlelik kısa metin yaz.

Kurallar:
- 1. cümle mantıklı görünmeli
- 2. cümle hafif çelişmeli
- 3. cümle çelişkiyi derinleştirmeli
- 4. cümle paradoks içermeli
- komik ama düşündürücü olmalı
- ciddi anlatım + absürt fikir dengesi
- sadece eğlence amaçlı

Konu: ${topic}

Şimdi yaz:
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
          temperature: 1.35
        })
      });

      const data = await res.json();

      console.log("GROQ RESPONSE:", JSON.stringify(data, null, 2));

      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        tries++;
        continue;
      }

      if (isUnsafe(content)) {
        console.log("❌ UNSAFE CONTENT BLOCKED");
        tries++;
        continue;
      }

      if (isDuplicate(content)) {
        console.log("⚠️ DUPLICATE");
        tries++;
        continue;
      }

      text = content.trim();
      break;

    } catch (err) {
      console.log("❌ ERROR:", err.message);
      tries++;
    }
  }

  if (!text) throw new Error("AI failed");

  // ⏱ TIME SYSTEM
  const now = new Date();
  const timestamp = now.getTime();
  const date = now.toISOString().split("T")[0];

  const title = generateTitle(topic);
  const slug = slugify(title);

  const payload = {
    date,
    timestamp,
    topic,
    title,
    slug,
    text
  };

  // 💾 unique content file
  fs.writeFileSync(
    `content/${timestamp}.json`,
    JSON.stringify(payload, null, 2)
  );

  // 🌐 always latest content
  fs.writeFileSync(
    "data.json",
    JSON.stringify(payload, null, 2)
  );

  // 📚 history update
  history.push(payload);
  history = history.slice(-30);

  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
}

generateText();
