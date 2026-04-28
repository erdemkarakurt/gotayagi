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

// 🧠 SAFETY FILTER
function isUnsafe(text) {
  const banned = ["intihar", "ölüm", "şiddet", "kendini", "kan"];
  const lower = text.toLowerCase();
  return banned.some(w => lower.includes(w));
}

async function generateText() {
  if (!API_KEY) throw new Error("GROQ_API_KEY missing!");

  const topics = [
    "başarı", "tembellik", "zenginlik", "motivasyon",
    "hayatın anlamı", "hiçlik", "çalışmamak", "başarısızlık"
  ];

  const topic = topics[Math.floor(Math.random() * topics.length)];

  // 💥 ULTRA ZİHİN KIRICI PROMPT
  const prompt = `
Sen "gotayagi" adlı absürt, komik ve zihin kurcalayan kişisel gelişim evreninin yazarıısın.

AMAÇ:
Okuyucuya mantıklı gibi başlayan ama giderek çelişen ve sonunda paradoks bırakan kısa metin yaz.

ZORUNLU YAPI:
- 4 cümle üret
- 1. cümle mantıklı görünmeli
- 2. cümle hafif çelişmeli
- 3. cümle çelişkiyi derinleştirmeli
- 4. cümle kesinlikle paradoks içermeli

STİL:
- ciddi anlatım + absürt fikir
- komik ama düşündürücü
- “dur bir saniye” etkisi

KISIT:
- şiddet, zarar, ölüm yok
- sadece eğlence ve zihinsel oyun

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

      if (data?.error) {
        console.log("❌ API ERROR:", data.error);
        tries++;
        continue;
      }

      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        console.log("❌ EMPTY RESPONSE:", data);
        tries++;
        continue;
      }

      if (isUnsafe(content)) {
        console.log("❌ UNSAFE CONTENT BLOCKED");
        tries++;
        continue;
      }

      if (isDuplicate(content)) {
        console.log("⚠️ DUPLICATE DETECTED");
        tries++;
        continue;
      }

      text = content.trim();
      break;

    } catch (err) {
      console.log("❌ FETCH ERROR:", err.message);
      tries++;
    }
  }

  if (!text) {
    throw new Error("AI failed after 3 tries");
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

  // 💾 save
  fs.writeFileSync(`content/${date}.json`, JSON.stringify(payload, null, 2));
  fs.writeFileSync("data.json", JSON.stringify(payload, null, 2));

  history.push(payload);
  history = history.slice(-30);

  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
}

generateText();
