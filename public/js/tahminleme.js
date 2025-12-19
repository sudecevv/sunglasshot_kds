let lineChart = null;
let campaignDataGlobal = [];

// ==================================================
// 🚀 SAYFA YÜKLENİNCE
// ==================================================
document.addEventListener("DOMContentLoaded", () => {
    fetch("http://localhost:3000/api/kampanya-gelirleri")
        .then(res => {
            if (!res.ok) {
                console.error("Sunucu hata kodu:", res.status);
                return res.text().then(text =>
                    console.error("Cevap:", text)
                );
            }
            return res.json();
        })
        .then(data => {
            campaignDataGlobal = data;

            renderPastCampaignTable(data);
            setupPredictionForm();
            setupInfoPanel();

            // 🔥 Sayfa açılınca otomatik tahmin
            renderPrediction();
        })
        .catch(err => console.error("Veri yüklenemedi:", err));
});

// ==================================================
// 📋 GEÇMİŞ KAMPANYA TABLOSU
// ==================================================
function renderPastCampaignTable(data) {
    const tbody = document.querySelector("#past-campaign-table tbody");
    tbody.innerHTML = "";

    data.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.kampanya_ad}</td>
            <td>${item.baslangic} - ${item.bitis}</td>
            <td>${Number(item.toplam_kazanc).toLocaleString("tr-TR")} ₺</td>
        `;
        tbody.appendChild(tr);
    });
}

// ==================================================
// 📊 FORM EVENT
// ==================================================
function setupPredictionForm() {
    const form = document.getElementById("prediction-form");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        renderPrediction();
    });
}

// ==================================================
// 🔮 TAHMİN + KPI + GRAFİK + ÖNERİ
// ==================================================
function renderPrediction() {
    
    const campaignId = document.getElementById("campaign").value;
    const selectedCampaign =
        campaignId === "1" ? "2 al 1 öde" : "3 al 2 öde";

    const campaignData = campaignDataGlobal
        .filter(d => d.kampanya_ad === selectedCampaign)
        .sort((a, b) => new Date(a.baslangic) - new Date(b.baslangic));

    if (campaignData.length < 2) return;

    // =========================
    // 📅 Yıllar & Kazançlar
    // =========================
    const years = campaignData.map(d =>
        new Date(d.baslangic).getFullYear()
    );
    const kazanc = campaignData.map(d =>
        Number(d.toplam_kazanc)
    );

    // =========================
    // 📈 Ortalama büyüme
    // =========================
    const avgGrowth = calculateAvgGrowth(kazanc);
    const predicted =
        kazanc[kazanc.length - 1] * (1 + avgGrowth);

    // =========================
    // 📋 TAHMİN TABLOSU
    // =========================
    document.querySelector("#prediction-table tbody").innerHTML = `
        <tr>
            <td>${selectedCampaign}</td>
            <td>${predicted.toLocaleString("tr-TR", {
                maximumFractionDigits: 2
            })} ₺</td>
        </tr>
    `;

    // =========================
    // 📊 YoY KPI
    // =========================
    const last = kazanc[kazanc.length - 1];
    const prev = kazanc[kazanc.length - 2];
    const yoy = ((last - prev) / prev) * 100;

    const yoyEl = document.getElementById("yoy-change");
    yoyEl.textContent = `% ${yoy.toFixed(1)}`;
    yoyEl.className = yoy >= 0 ? "positive" : "negative";

    // =========================
    // ℹ️ INFO PANEL
    // =========================
    document.getElementById("infoList").innerHTML = `
        <li>${years.length} adet geçmiş kampanya verisi kullanıldı</li>
        <li>Ortalama büyüme oranı: % ${(avgGrowth * 100).toFixed(1)}</li>
        <li>Son baz yıl: ${years[years.length - 1]}</li>
        <li>Basit ortalama artış yöntemi</li>
    `;

    // =========================
    // 📈 GRAFİK
    // =========================
    drawLineChart(years, kazanc, selectedCampaign);

    // =========================
    // ⭐ ÖNERİLEN KAMPANYA
    // =========================
    renderRecommendedCampaign();
}

// ==================================================
// ⭐ ÖNERİLEN KAMPANYA HESABI
// ==================================================
function renderRecommendedCampaign() {
    const predictionA = calculatePrediction("2 al 1 öde");
    const predictionB = calculatePrediction("3 al 2 öde");

    let recommended = "Veri yetersiz";
    let reason = "Öneri oluşturmak için yeterli geçmiş veri yok";

    if (predictionA !== null && predictionB !== null) {
        if (predictionA > predictionB) {
            recommended = "2 al 1 öde";
            reason = "2026 tahmini kazancı daha yüksek";
        } else {
            recommended = "3 al 2 öde";
            reason = "2026 tahmini kazancı daha yüksek";
        }
    }

    document.getElementById("recommended-campaign").textContent = recommended;
    document.getElementById("recommendation-reason").textContent = reason;
}

// ==================================================
// 📈 LINE CHART (Chart.js)
// ==================================================
function drawLineChart(years, kazanc, campaign) {
    const ctx = document
        .getElementById("campaignLineChart")
        .getContext("2d");

    if (lineChart) lineChart.destroy();

    lineChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: years,
            datasets: [{
                label: `${campaign} – Yıllara Göre Gelir`,
                data: kazanc,
                borderWidth: 2,
                tension: 0.3,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true }
            }
        }
    });
}

// ==================================================
// ℹ️ INFO PANEL TOGGLE
// ==================================================
function setupInfoPanel() {
    const btn = document.getElementById("infoBtn");
    if (!btn) return;

    btn.addEventListener("click", () => {
        document
            .getElementById("infoPanel")
            .classList.toggle("hidden");
    });
}

// ==================================================
// 🧮 ORTA BÜYÜME HESABI
// ==================================================
function calculateAvgGrowth(kazanc) {
    let rates = [];
    for (let i = 1; i < kazanc.length; i++) {
        rates.push((kazanc[i] - kazanc[i - 1]) / kazanc[i - 1]);
    }
    return rates.reduce((a, b) => a + b, 0) / rates.length;
}

// ==================================================
// 🔢 TEK KAMPANYA TAHMİNİ
// ==================================================
function calculatePrediction(campaignName) {
    const campaignData = campaignDataGlobal
        .filter(d => d.kampanya_ad === campaignName)
        .sort((a, b) => new Date(a.baslangic) - new Date(b.baslangic));

    if (campaignData.length < 2) return null;

    const kazanc = campaignData.map(d => Number(d.toplam_kazanc));
    const avgGrowth = calculateAvgGrowth(kazanc);

    return kazanc[kazanc.length - 1] * (1 + avgGrowth);
}
