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

      // ⭐ Varsayılan şube otomatik seçilsin
    if (data.length > 0) {
      branchSelect.value = data[0].sube_id;
    }

    // ⭐ Sayfa açıldığında otomatik aylık kar grafiğini getir
    monthForm.dispatchEvent(new Event("submit"));
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

  /* ==========================================================
        📊 2️⃣ YILLARA GÖRE ŞUBELERİN TOPLAM KARLARI
    ========================================================== */
    const branchYearForm = document.getElementById("branch-sales-form");
    const branchYearSelect = document.getElementById("branch-sales-year");
    const branchCtx = document.getElementById("branchChart").getContext("2d");
    let branchChart;

    branchYearForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const yil = branchYearSelect.value;

        fetch(`http://localhost:3000/api/sube-toplam-kar?yil=${yil}`)
            .then((res) => res.json())
            .then((data) => {
                const labels = data.map(d => d.sube_ad);
                const karlar = data.map(d => d.toplam_kar);

                if (branchChart) branchChart.destroy();

                branchChart = new Chart(branchCtx, {
                    type: "bar",
                    data: {
                        labels: labels,
                        datasets: [{
                            label: `${yil} Yılı Şube Toplam Karları (₺)`,
                            data: karlar,
                            backgroundColor: "rgba(255, 153, 0, 0.4)",
                            borderColor: "rgba(255, 153, 0, 1)",
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { position: "top" },
                            title: {
                                display: true,
                                text: `${yil} Yılı Şube Toplam Karları`
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
            .catch(err => console.error("Şube toplam kar alınamadı:", err));
    });

    // Sayfa açıldığında varsayılan filtreyi çalıştır
    branchYearForm.dispatchEvent(new Event("submit"));

    // -------------------------------  
    //  İLÇE ANALİZ TABLOSUNDAN VERİ OKUMA  
    // -------------------------------  
    function loadDistrictTableData() {
        const rows = document.querySelectorAll(".table-item table tbody tr");
        const districtNames = [];
        const districtScores = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            const ilceAdi = cells[0].innerText.trim();   // 1. sütun: ilçe adı
            const puan = parseFloat(cells[5].innerText.trim()); // 6. sütun: puan

            districtNames.push(ilceAdi);
            districtScores.push(puan);
        });

        return { districtNames, districtScores };
    }

    // -------------------------------  
    //  İLÇELERİN PUAN GRAFİĞİNİ OLUŞTUR  
    // -------------------------------  
    function renderDistrictChart() {
        const { districtNames, districtScores } = loadDistrictTableData();

        const ctx = document.getElementById("districtChart").getContext("2d");

        new Chart(ctx, {
            type: "bar",
            data: {
                labels: districtNames,
                datasets: [{
                    label: "Puan (100 Üzerinden)",
                    data: districtScores,
                    borderWidth: 1,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.3)"
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    // Grafik oluştur
    renderDistrictChart();

});
