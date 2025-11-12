document.addEventListener("DOMContentLoaded", () => {
    const sube1Select = document.getElementById("sube1");
    const sube2Select = document.getElementById("sube2");
    const yearSelect = document.getElementById("campaign-year");
    const filterForm = document.getElementById("campaign-filter-form");

    let campaignChart;

    // 🔹 1️⃣ Şubeleri çek ve dropdownlara ekle
    fetch("http://localhost:3000/api/subeler")
        .then(res => {
            if (!res.ok) throw new Error(`Şube listesi alınamadı: ${res.status}`);
            return res.json();
        })
        .then(subeler => {
            subeler.forEach(sube => {
                const opt1 = new Option(sube.sube_ad, sube.sube_id);
                const opt2 = new Option(sube.sube_ad, sube.sube_id);
                sube1Select.add(opt1);
                sube2Select.add(opt2);
            });
        })
        .catch(err => console.error(err));

    // 🔹 2️⃣ Form submit olunca grafiği güncelle
    filterForm.addEventListener("submit", e => {
        e.preventDefault();

        const yil = yearSelect.value;
        const sube1 = sube1Select.value;
        const sube2 = sube2Select.value;

        if (!yil || !sube1 || !sube2) {
            alert("Lütfen tüm alanları seçin!");
            return;
        }

        fetch(`http://localhost:3000/api/kampanya-performans?yil=${yil}&sube1=${sube1}&sube2=${sube2}`)
            .then(res => {
                if (!res.ok) throw new Error(`Kampanya verisi alınamadı: ${res.status}`);
                return res.json();
            })
            .then(data => {
                const labels = data.map(d => d.kampanya_ad);
                const sube1Values = data.map(d => Number(d.sube1_toplam));
                const sube2Values = data.map(d => Number(d.sube2_toplam));

                const ctx = document.getElementById("campaignComparisonChart").getContext("2d");

                if (campaignChart) {
                    campaignChart.data.labels = labels;
                    campaignChart.data.datasets[0].data = sube1Values;
                    campaignChart.data.datasets[1].data = sube2Values;
                    campaignChart.update();
                } else {
                    campaignChart = new Chart(ctx, {
                        type: "bar",
                        data: {
                            labels,
                            datasets: [
                                { label: "Şube 1", data: sube1Values, backgroundColor: "#FF6700" },
                                { label: "Şube 2", data: sube2Values, backgroundColor: "#FFB84D" }
                            ]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: { position: "top" },
                                title: { display: true, text: `${yil} Yılı Kampanya Kazançları` }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        callback: val => val.toLocaleString("tr-TR") + " ₺"
                                    }
                                }
                            }
                        }
                    });
                }
            })
            .catch(err => console.error(err));
    });
});

function loadKampanyaKarChart() {
  fetch("http://localhost:3000/api/kampanya-karlar")
    .then(res => {
      if (!res.ok) throw new Error("Kampanya karları verisi alınamadı.");
      return res.json();
    })
    .then(data => {
      if (!data || data.length === 0) {
        console.warn("⚠️ Kampanya kar verisi boş geldi");
        return;
      }

      // 📊 Veriyi yıl bazlı gruplandır
      const grouped = {};
      data.forEach(d => {
        const yil = d.yil || "Bilinmiyor";
        if (!grouped[yil]) grouped[yil] = [];
        grouped[yil].push({ kampanya: `${d.kampanya_ad} ${yil}`, kar: Number(d.toplam_kar) });
      });

      const labels = data.map(d => `${d.kampanya_ad} ${d.yil}`);
      const datasets = [{
        label: "Kampanya Karları (TL)",
        data: data.map(d => Number(d.toplam_kar)),
        backgroundColor: "rgba(54, 162, 235, 0.4)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1
      }];

      const ctx = document.getElementById("kampanyaKarChart").getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: { labels, datasets },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Tüm Yıllardaki Kampanya Karları" }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: val => val.toLocaleString("tr-TR") + " ₺"
              }
            },
            x: {
              ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 }
            }
          }
        }
      });
    })
    .catch(err => console.error(err));
}


// Sayfa yüklenince otomatik çalışsın:
document.addEventListener("DOMContentLoaded", loadKampanyaKarChart);
