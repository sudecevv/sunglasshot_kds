document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================================
     📊 1️⃣ ŞUBELERİN AYLIK KARLARI GRAFİĞİ
  ========================================================== */
  const monthForm = document.getElementById("top-sales-form");
  const monthYearSelect = document.getElementById("top-sales-year");
  const branchSelect = document.getElementById("top-sales-branch");
  const monthCtx = document.getElementById("salesChart").getContext("2d");
  let monthlyChart;

  // 🔸 Şubeleri dropdown’a yükle
  fetch("http://localhost:3000/api/subeler")
    .then((res) => res.json())
    .then((data) => {
      data.forEach((sube) => {
        const opt = document.createElement("option");
        opt.value = sube.sube_id;
        opt.textContent = sube.sube_ad;
        branchSelect.appendChild(opt);
      });
    })
    .catch((err) => console.error("Şubeler alınamadı:", err));

  // 🔸 Form gönderildiğinde aylık karları getir
  monthForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const yil = monthYearSelect.value;
    const subeId = branchSelect.value;

    if (!subeId) {
      alert("Lütfen bir şube seçin.");
      return;
    }

    fetch(`http://localhost:3000/api/sube-aylik-kar?yil=${yil}&sube_id=${subeId}`)
      .then((res) => res.json())
      .then((data) => {
        const aylar = [
          "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
          "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
        ];

        const karlar = new Array(12).fill(0);
        data.forEach((d) => (karlar[d.ay - 1] = d.kar));

        if (monthlyChart) monthlyChart.destroy();

        monthlyChart = new Chart(monthCtx, {
          type: "bar",
          data: {
            labels: aylar,
            datasets: [{
              label: `${yil} Aylık Kar (₺)`,
              data: karlar,
              backgroundColor: "rgba(255, 103, 0, 0.4)",
              borderColor: "rgba(255, 103, 0, 1)",
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: "top" },
              title: {
                display: true,
                text: `Seçilen Şubenin ${yil} Yılına Ait Aylık Karları`
              }
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
      })
      .catch((err) => console.error("Aylık karlar alınamadı:", err));
  });
});
