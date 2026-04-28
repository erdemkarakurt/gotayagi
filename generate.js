const fs = require("fs");

const API_KEY = process.env.GROQ_API_KEY;

async function generateText() {
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

  const prompt = `
Türkçe absürt kişisel gelişim yazısı yaz.
- Komik ve mantıksız
- Çelişkili
- 3-5 cümle
- Konu: ${topic}
- Emoji yok
`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 1.2,
    }),
  });

  const data = await response.json();

  const text = data.choices?.[0]?.message?.content || "Bugün sistem boş kaldı.";

  fs.writeFileSync(
    "data.json",
    JSON.stringify(
      {
        date: new Date().toISOString(),
        text: text,
      },
      null,
      2
    )
  );
}

generateText();
