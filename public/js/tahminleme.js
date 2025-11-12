document.addEventListener("DOMContentLoaded", () => {
    fetch("http://localhost:3000/api/kampanya-gelirleri")
        .then(res => {
            if (!res.ok) {
                console.error("Sunucu hata kodu:", res.status);
                return res.text().then(text => console.error("Cevap (text):", text));
            }
            return res.json();
        })
        .then(data => {
            const tbody = document.querySelector("#past-campaign-table tbody");
            tbody.innerHTML = "";

            data.forEach(item => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${item.kampanya_ad}</td>
                    <td>${item.baslangic} - ${item.bitis}</td>
                    <td>${Number(item.toplam_kazanc).toLocaleString('tr-TR')} ₺</td>
                `;
                tbody.appendChild(tr);
            });
            
            // 🔹 Tahmin formunu aktif hale getir
            setupPredictionForm(data);
        })
        .catch(err => console.error("Veri yüklenemedi:", err));
});

function setupPredictionForm(data) {
    const form = document.getElementById("prediction-form");
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const campaignId = document.getElementById("campaign").value;
        const month = document.getElementById("month").value;

        const selectedCampaign = campaignId === "1" ? "2 al 1 öde" : "3 al 2 öde";

        // 🔹 Seçilen kampanyaya göre geçmiş kazançları al
        const campaignData = data.filter(d => d.kampanya_ad === selectedCampaign);

        if (campaignData.length < 2) {
            alert("Yeterli geçmiş veri bulunamadı!");
            return;
        }

        // 🔹 Tarihleri yıl olarak çıkar
        const years = campaignData.map(d => new Date(d.baslangic).getFullYear());
        const kazanc = campaignData.map(d => Number(d.toplam_kazanc));

        // 🔹 Ortalama artış oranı yöntemiyle 2026 tahmini hesapla
        let growthRates = [];
        for (let i = 1; i < kazanc.length; i++) {
            growthRates.push((kazanc[i] - kazanc[i - 1]) / kazanc[i - 1]);
        }
        const avgGrowth = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
        const predicted = kazanc[kazanc.length - 1] * (1 + avgGrowth);

        // 🔹 Sonucu tabloya yaz
        const tbody = document.querySelector("#prediction-table tbody");
        tbody.innerHTML = `
            <tr>
                <td>${selectedCampaign}</td>
                <td>${predicted.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺</td>
            </tr>
        `;

        console.log(`${selectedCampaign} kampanyası için 2026 tahmini kazanç:`, predicted);
    });

}
