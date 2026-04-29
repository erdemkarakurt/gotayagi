const fs = require("fs");
const API_KEY = process.env.GROQ_API_KEY;

// 📁 İçerik klasörü kontrolü (Eski kayıtlar için)
if (!fs.existsSync("content")) fs.mkdirSync("content", { recursive: true });

// 🎭 Başlık Üretici: Hem ciddi hem absürt
function generateTitle(topic) {
  const patterns = [
    `${topic}: Nasibin ince bir sitemi mi?`,
    `${topic} ve insanın bitmeyen dünya telaşı`,
    `${topic} üzerine bir nükte ve bin ibret`,
    `${topic}: Küçük dertlerin büyük felsefesi`,
    `${topic}: Dalgın zihinler için uyanış notu`
  ];
  return patterns[Math.floor(Math.random() * patterns.length)];
}

async function generateText() {
  if (!API_KEY) {
    console.error("🔥 HATA: GROQ_API_KEY eksik!");
    process.exit(1);
  }

  // 🍎 Konu Havuzu: İnsanı eşyayla imtihan eden gündelik dertler
  const topics = [
    "soğuyan çay", "kaybolan anahtar", "tek kalan çorap", "boş cüzdan", 
    "durak kaçırmak", "ayakkabı sıkması", "açılmayan kavanoz", 
    "buzdolabı gürültüsü", "yanlışlıkla atılan mesaj", "elektrik kesintisi",
    "pazardan alınan ekşi elma", "yarım kalan uyku", "beklenen otobüs"
  ];
  const topic = topics[Math.floor(Math.random() * topics.length)];

  const messages = [
    {
      role: "system",
      content: `Sen "Göt Ayağı" sitesinin nüktedan, vakur ve hafif çatlak Anadolu filozofusun. 

      GÖREV TANIMI:
      1. Giriş: İnsanın dünyadaki acizliğini veya telaşını anlatan, adeta bir vaaz veriyormuşçasına ÇOK CİDDİ bir cümleyle başla.
      2. Geliş: Cümlenin sonunda konuyu öyle bir "ters köşe" yap ki, sonuç tamamen gündelik, absürt ve komik olsun. 
      3. Hedef: Okuyan "Gerçekten de öyle" desin ama gülmekten de kendini alamasın.

      KESİNLİKLE YASAKLAR:
      - İslam dini değerlerine, ibadetlere ve kutsallara ASLA dil uzatma, şaka konusu yapma.
      - "Evren, enerji, kuantum, ruhun boşluğu" gibi içi boş modern terimleri asla kullanma.
      - Fizik kurallarına aykırı saçmalıklar yapma (Örn: Havlunun altına tuvalet sığmaz).
      - Sadece fiziksel eşyalar ve insanın sakarlıkları üzerinden felsefe yap.

      METİN SINIRI: Maksimum 2 kısa cümle.

      ÖRNEK: "Dünya hayatı bir misafirliktir; lakin insan o misafirlikte bile tek kalan çorabının eşini bulamadığı için ev sahibine küsecek kadar acizdir. Sen yine de o çorabı arama, nasibinde varsa o seni çekmecede değil, ayakkabının içinde bulur."`
    },
    { role: "user", content: `Konu: ${topic}. Bana bugünün manifestosunu yaz.` }
  ];

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: messages,
        temperature: 0.8, // Mantıklı saçmalama seviyesi (0.8 idealdir)
        max_tokens: 200,
        top_p: 1
      })
    });

    const data = await res.json();
    let content = data?.choices?.[0]?.message?.content?.replace(/"/g, '').trim();

    if (content && content.length > 10) {
      const now = new Date();
      const payload = {
        date: now.toISOString().split("T")[0],
        timestamp: now.getTime(),
        topic,
        title: generateTitle(topic),
        text: content
      };

      // Ana veriyi ve geçmişi kaydet
      fs.writeFileSync("data.json", JSON.stringify(payload, null, 2));
      fs.writeFileSync(`content/${payload.timestamp}.json`, JSON.stringify(payload, null, 2));
      
      console.log("✅ Yeni nükte yayında:", content);
    }
  } catch (err) {
    console.error("Hata:", err.message);
    process.exit(1);
  }
}

generateText();
