const fs = require("fs");

const API_KEY = process.env.GROQ_API_KEY;

async function generateText() {
  try {
    if (!API_KEY) {
      throw new Error("GROQ_API_KEY missing");
    }

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

Kurallar:
- Komik ve mantıksız olacak
- Kendi içinde çelişkili olacak
- 3-5 cümle
- Konu: ${topic}
- Emoji yok
- Motivasyon gibi başlayıp saçmalayacak
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
        temperature: 1.3,
        max_tokens: 200
      }),
    });

    const data = await response.json();

    // 🔴 HATA LOG (çok önemli debug)
    if (!data || !data.choices) {
      console.log("API RESPONSE ERROR:", JSON.stringify(data, null, 2));
    }

    const text =
      data?.choices?.[0]?.message?.content?.trim()
      || fallbackText();

    fs.writeFileSync(
      "data.json",
      JSON.stringify(
        {
          date: new Date().toISOString(),
          topic,
          text,
        },
        null,
        2
      )
    );

    console.log("OK - içerik üretildi");
  } catch (err) {
    console.log("ERROR:", err.message);

    fs.writeFileSync(
      "data.json",
      JSON.stringify(
        {
          date: new Date().toISOString(),
          text: fallbackText(),
        },
        null,
        2
      )
    );
  }
}

function fallbackText() {
  const list = [
    "Başarı, hiçbir şey yapmadan çok şey beklemektir. Bugün bunu denemelisin.",
    "Çalışmak seni yorar ama yorgunluk da bir başarı göstergesidir, o yüzden ikisini de yapma.",
    "Hayatını planlama çünkü plansızlık daha planlıdır.",
    "Zaman seni bekler, sen neden onu yakalamaya çalışıyorsun?"
  ];

  return list[Math.floor(Math.random() * list.length)];
}

generateText();
