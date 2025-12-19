document.addEventListener("DOMContentLoaded", () => {

  /* ==========================================================
     GLOBAL DEĞİŞKENLER
  ========================================================== */
  let monthlyChart = null;
  let branchChart = null;

  let monthlyMode = "single"; // single | compare
  let branchChartType = "bar"; // bar | pie

  const API_BASE = "http://localhost:3000/api";

  const AY_LARI = [
    "Ocak","Şubat","Mart","Nisan","Mayıs","Haziran",
    "Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"
  ];

  /* ==========================================================
     📊 1️⃣ İLÇELERİN PUAN GRAFİĞİ
  ========================================================== */
  const districtData = [
    { name: "Karşıyaka", score: 64 },
    { name: "Balçova", score: 60 },
    { name: "Gaziemir", score: 58.5 },
    { name: "Konak", score: 62 },
    { name: "Bornova", score: 61 },
    { name: "Bayraklı", score: 66 }
  ];

  

  const districtCtx = document
    .getElementById("districtChart")
    .getContext("2d");

  new Chart(districtCtx, {
    type: "bar",
    data: {
      labels: districtData.map(d => d.name),
      datasets: [{
        label: "İlçe Uygunluk Puanı",
        data: districtData.map(d => d.score),
        backgroundColor: "rgba(255,103,0,0.6)"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "İlçelere Göre Mağaza Açılabilirlik Skoru"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });

  /* ==========================================================
     📍 2️⃣ ÖNERİLEN MAĞAZA AÇILIŞ İLÇESİ
  ========================================================== */
  const bestDistrict = districtData.reduce((max, d) =>
    d.score > max.score ? d : max
  );

  document.getElementById("recommendedDistrictName").textContent =
    bestDistrict.name;

  document.getElementById("recommendedDistrictScore").textContent =
    `Uygunluk Puanı: ${bestDistrict.score} / 100`;

  /* ==========================================================
     📊 3️⃣ ŞUBELERİN AYLARA GÖRE KARLARI
  ========================================================== */
  const monthForm = document.getElementById("top-sales-form");
  const yearSelect = document.getElementById("top-sales-year");
  const branchSelect = document.getElementById("top-sales-branch");
  const toggleCompareBtn = document.getElementById("toggleMonthlyCompare");
  const monthCtx = document.getElementById("salesChart").getContext("2d");

  // Şubeleri yükle
  fetch(`${API_BASE}/subeler`)
    .then(res => res.json())
    .then(subeler => {
      branchSelect.innerHTML = "";
      subeler.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s.sube_id;
        opt.textContent = s.sube_ad;
        branchSelect.appendChild(opt);
      });

      if (subeler.length) {
        branchSelect.value = subeler[0].sube_id;
        monthForm.dispatchEvent(new Event("submit"));
      }
    });

  // Form submit
  monthForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const yil = yearSelect.value;

    if (monthlyMode === "single") {
      const subeId = branchSelect.value;
      const data = await fetch(
        `${API_BASE}/sube-aylik-kar?yil=${yil}&sube_id=${subeId}`
      ).then(r => r.json());

      renderSingleMonthlyChart(yil, data);
    } else {
      renderCompareMonthlyChart(yil);
    }
  });

  // Tek / karşılaştır
  toggleCompareBtn.addEventListener("click", () => {
    monthlyMode = monthlyMode === "single" ? "compare" : "single";
    toggleCompareBtn.innerText =
      monthlyMode === "single" ? "Şubeleri Karşılaştır" : "Tek Şubeye Dön";

    branchSelect.disabled = monthlyMode === "compare";
    monthForm.dispatchEvent(new Event("submit"));
  });

  function renderSingleMonthlyChart(yil, data) {
    const karlar = new Array(12).fill(0);
    data.forEach(d => karlar[d.ay - 1] = d.kar);

    if (monthlyChart) monthlyChart.destroy();

    monthlyChart = new Chart(monthCtx, {
      type: "bar",
      data: {
        labels: AY_LARI,
        datasets: [{
          label: `${yil} Aylık Kar (₺)`,
          data: karlar,
          backgroundColor: "rgba(255,103,0,0.5)"
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `${yil} Yılı Seçilen Şubenin Aylık Karları`
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: v => v.toLocaleString("tr-TR") + " ₺"
            }
          }
        }
      }
    });
  }

  async function renderCompareMonthlyChart(yil) {
    const subeler = await fetch(`${API_BASE}/subeler`).then(r => r.json());
    const renkler = [
      "rgba(255,99,132,0.6)",
      "rgba(54,162,235,0.6)",
      "rgba(255,206,86,0.6)",
      "rgba(75,192,192,0.6)"
    ];

    const datasets = [];

    for (let i = 0; i < subeler.length; i++) {
      const s = subeler[i];
      const data = await fetch(
        `${API_BASE}/sube-aylik-kar?yil=${yil}&sube_id=${s.sube_id}`
      ).then(r => r.json());

      const karlar = new Array(12).fill(0);
      data.forEach(d => karlar[d.ay - 1] = d.kar);

      datasets.push({
        label: s.sube_ad,
        data: karlar,
        backgroundColor: renkler[i % renkler.length]
      });
    }

    if (monthlyChart) monthlyChart.destroy();

    monthlyChart = new Chart(monthCtx, {
      type: "bar",
      data: { labels: AY_LARI, datasets },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `${yil} Yılı Şubelerin Aylık Kar Karşılaştırması`
          }
        }
      }
    });
  }

  /* ==========================================================
     📊 4️⃣ YILLARA GÖRE ŞUBELERİN TOPLAM KARLARI
  ========================================================== */
  const branchForm = document.getElementById("branch-sales-form");
  const branchYearSelect = document.getElementById("branch-sales-year");
  const branchCtx = document.getElementById("branchChart").getContext("2d");

  branchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const yil = branchYearSelect.value;

    const data = await fetch(
      `${API_BASE}/sube-toplam-kar?yil=${yil}`
    ).then(r => r.json());

    if (branchChart) branchChart.destroy();

    branchChart = new Chart(branchCtx, {
      type: branchChartType,
      data: {
        labels: data.map(d => d.sube_ad),
        datasets: [{
          label: `${yil} Toplam Kar (₺)`,
          data: data.map(d => d.toplam_kar),
          backgroundColor: [
            "rgba(255,99,132,0.6)",
            "rgba(54,162,235,0.6)",
            "rgba(255,206,86,0.6)"
          ]
        }]
      },
      options: { responsive: true }
    });
  });

  document
    .getElementById("toggleBranchChart")
    .addEventListener("click", () => {
      branchChartType = branchChartType === "bar" ? "pie" : "bar";
      branchForm.dispatchEvent(new Event("submit"));
    });

  // İlk yükleme
  branchForm.dispatchEvent(new Event("submit"));
});
