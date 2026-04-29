const fs = require("fs");

const API_KEY = process.env.GROQ_API_KEY;

// 📁 Klasör ve Dosya Kontrolleri
if (!fs.existsSync("content")) fs.mkdirSync("content", { recursive: true });

const historyFile = "content/history.json";
let history = [];
if (fs.existsSync(historyFile)) {
  try {
    history = JSON.parse(fs.readFileSync(historyFile, "utf-8"));
  } catch { history = []; }
}

// 🔥 Başlık Üretici (Vakur ve Geleneksel)
function generateTitle(topic) {
  const patterns = [
    `${topic}: Nasibin cilvesi mi yoksa küçük bir imtihan mı?`,
    `${topic} ve insanın dünya telaşıyla olan davası`,
    `${topic} üzerine bir nükte ve bin bir ibret`,
    `${topic}: Dalgın zihinler için hikmetli bir not`,
    `${topic} yaparken aniden gelen o sessiz uyanış`
  ];
  return patterns[Math.floor(Math.random() * patterns.length)];
}

async function generateText() {
  if (!API_KEY) {
    console.error("🔥 HATA: GROQ_API_KEY bulunamadı!");
    process.exit(1);
  }

  // 🍎 Konular (Tamamen gündelik ve maddi hayat)
  const topics = [
    "soğuyan çay", "kaybolan anahtarlar", "tek kalan çoraplar", 
    "açılmayan kavanoz kapağı", "boş cüzdan", "bayram temizliği", 
    "yol sormak", "pazar sabahı uyanmak", "ayakkabı sıkması",
    "yarım kalan rüyalar", "yanlışlıkla atılan mesajlar", "durak kaçırmak",
    "pazardan alınan ekşi elma", "elektrik kesintisi", "bozulan şemsiye"
  ];
  const topic = topics[Math.floor(Math.random() * topics.length)];

  // 🧠 SİSTEM ROLÜ: Edepli, Hikmetli ve Nüktedan Filozof
  const messages = [
    {
      role: "system",
      content: `Sen "Göt Ayağı" sitesinin nüktedan, edebine düşkün ve Anadolu irfanıyla konuşan bir filozofusun. 
      
      ÜSLUP VE KURALLAR:
      1. Giriş: İnsanın dünyadaki acizliğini veya sabrını hatırlatan, vakur ve çok ciddi bir cümleyle başla.
      2. Ters Köşe: Konuyu öyle bir yere bağla ki, sonuç tamamen gündelik, zararsız ve absürt olsun. 
      3. Dini Hassasiyet: İnsanların inancıyla, ibadetiyle veya 'ruhuyla' ilgili asla şaka yapma. Kimseye 'ruhun boş' gibi ithamlarda bulunma.
      4. Yasaklar: "Evren, Sır, Enerji, Kuantum, Yıldızlar, Aydınlanma, Boş Ruh" gibi kelimeleri asla kullanma.
      5. Odak Noktası: Mizah sadece insanın sakarlığı, unutkanlığı ve eşyalarla olan imkansız mücadelesi üzerine olmalı.
      
      ÖRNEK: "Anahtarın kaybolması sabrın bir cilvesidir; lakin kapıda kalmak da bir hikmettir. Sen yine de paspasın altına bakmayı unutma, bazen nasip ayağının ucundadır ama biz uzağa bakarız."`
    },
    {
      role: "user",
      content: `Konu: ${topic}. Bugünün nükte dolu manifestosunu yaz.`
    }
  ];

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
          messages: messages,
          temperature: 0.85, // Kararlı ama yaratıcı
          max_tokens: 300,
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

        // Dosyalara yazma işlemi
        fs.writeFileSync(`content/${payload.timestamp}.json`, JSON.stringify(payload, null, 2));
        fs.writeFileSync("data.json", JSON.stringify(payload, null, 2));
        
        // Geçmişi güncelle (Son 30 kayıt)
        history.push(payload);
        fs.writeFileSync(historyFile, JSON.stringify(history.slice(-30), null, 2));
        
        console.log("✅ Yeni nükte yayında:", content);
        return; 
      }
      tries++;
    } catch (err) {
      console.error("Bağlantı hatası:", err.message);
      tries++;
    }
  }
}

generateText();
