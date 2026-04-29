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

// 🔥 title generator (FARKINDALIK TEMALI)
function generateTitle(topic) {
  const patterns = [
    `${topic} aslında her gün fark etmeden yaptığın bir şey`,
    `${topic} düşündüğünden daha garip bir sistem olabilir`,
    `${topic} ve farkında olmadan yaşadığın küçük gerçekler`,
    `${topic} üzerine düşününce her şey biraz tuhaflaşıyor`,
    `${topic} sandığın kadar sıradan olmayabilir`
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
    "uyanmak",
    "kahve içmek",
    "yürümek",
    "zaman",
    "telefon",
    "düşünmek",
    "nefes almak",
    "beklemek"
  ];

  const topic = topics[Math.floor(Math.random() * topics.length)];

  // 💥 FARKINDALIK + ABSÜRT + KOMİK PROMPT
const prompt = `
Sen "gotayagi" adlı absürt ve komik farkındalık yazarıısın.

AMAÇ:
İnsanların günlük hayatındaki sıradan şeyleri komik ve düşündürücü şekilde anlatmak.

KURALLAR:
- SADECE 2 ila 3 cümle yaz
- cümleler KISA olacak
- mobil ekranda okunacak şekilde yaz
- uzun paragraf YASAK
- gereksiz açıklama YOK
- komik + hafif felsefi + absürt

STİL:
- günlük bir olayla başla (${topic})
- sonra hafif garipleştir
- sonunda küçük bir “dur bir saniye” hissi bırak

KISIT:
- uzun metin yok
- paragraf yok
- maksimum 3 satır

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

      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        tries++;
        continue;
      }

      if (isUnsafe(content)) {
        tries++;
        continue;
      }

      if (isDuplicate(content)) {
        tries++;
        continue;
      }

      text = content.trim();
      break;

    } catch (err) {
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
