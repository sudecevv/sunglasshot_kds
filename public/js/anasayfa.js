document.addEventListener("DOMContentLoaded", () => {

  // --- En çok satış yapan şubeler ---
  const topForm = document.getElementById('top-sales-form');
  const topYearSelect = document.getElementById('top-sales-year');
  const topCtx = document.getElementById('satisGrafik').getContext('2d');
  let topChart; // Chart örneği

  let categoryChartType = "bar"; // bar | pie
  let showAllYears = false;
  let showAllCategoryYears = false;




  const fetchTopSales = (year) => {
    fetch(`http://localhost:3000/api/top-sales?year=${year}`)
      .then(res => res.json())
      .then(data => {
        console.log(`📊 ${year} yılı en çok satış yapan şubeler:`, data);

        const subeAdlari = data.map(item => item.sube_ad);
        const satislar = data.map(item => Number(item.toplam_satis));

        if (topChart) topChart.destroy(); // önceki grafiği temizle

        topChart = new Chart(topCtx, {
          type: 'bar',
          data: {
            labels: subeAdlari,
            datasets: [{
              label: `${year} Yılı Toplam Satış (Adet)`,
              data: satislar,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
          }
        });
      })
      .catch(err => console.error("🚨 En çok satış verisi alınamadı:", err));
  };

  // Sayfa yüklenince varsayılan yıl
  fetchTopSales(topYearSelect.value);

  // Filtreleme butonu
  topForm.addEventListener('submit', (e) => {
    e.preventDefault();
    fetchTopSales(topYearSelect.value);
  });


  const fetchAllYearsSales = () => {
  fetch("http://localhost:3000/api/top-sales-all-years")
    .then(res => res.json())
    .then(data => {

      if (topChart) topChart.destroy();

      const years = [...new Set(data.map(d => d.year))];
      const subeler = [...new Set(data.map(d => d.sube_ad))];

      const datasets = subeler.map(sube => ({
        label: sube,
        data: years.map(y => {
          const kayit = data.find(d => d.year === y && d.sube_ad === sube);
          return kayit ? Number(kayit.toplam_satis) : 0;
        }),
        borderWidth: 1
      }));

      topChart = new Chart(topCtx, {
        type: "bar",
        data: {
          labels: years,
          datasets
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          },
          plugins: {
            title: {
              display: true,
              text: "2022–2025 Yılları Arası Şube Satış Karşılaştırması"
            }
          }
        }
      });
    });
};

document.getElementById("toggleAllYears").addEventListener("click", () => {
  showAllYears = !showAllYears;

  if (showAllYears) {
    fetchAllYearsSales();
    document.getElementById("toggleAllYears").innerText = "Tek Yıla Dön";
  } else {
    fetchTopSales(topYearSelect.value);
    document.getElementById("toggleAllYears").innerText = "Tüm Yılları Göster";
  }
});


// --- Ürün Kategorisine Göre Şube Performansı ---
const categoryForm = document.getElementById('category-performance-form');
const categoryYearSelect = document.getElementById('category-year');
const categoryCtx = document.getElementById('categoryChart').getContext('2d');
let categoryChart;

// 🎨 Sabit renk paleti (görseldeki tonlara uygun)
  const colorPalette = {
    "Çocuk Gözlük": "rgba(127, 255, 212, 0.8)",   // Aqua - açık yeşilimsi mavi
    "Erkek Gözlük": "rgba(255, 105, 97, 0.8)",    // Açık kırmızı
    "Kadın Gözlük": "rgba(130, 120, 255, 0.8)",   // Mor-mavi
    "Unisex": "rgba(238, 130, 238, 0.8)"          // Açık pembe - mor
  };

const fetchCategoryPerformance = (year) => {
  fetch(`http://localhost:3000/api/sube-kategori-performans?year=${year}`)
    .then(res => res.json())
    .then(data => {

      if (categoryChart) categoryChart.destroy();

      // BAR GRAFİK
      if (categoryChartType === "bar") {

        const subeler = [...new Set(data.map(item => item.sube_ad))];
        const kategoriler = [...new Set(data.map(item => item.kategori_ad))];

        const datasets = kategoriler.map(kat => ({
          label: kat,
          data: subeler.map(sube => {
            const kayit = data.find(d => d.sube_ad === sube && d.kategori_ad === kat);
            return kayit ? Number(kayit.toplam_satis) : 0;
          }),
          backgroundColor: colorPalette[kat],
          borderWidth: 1
        }));

        categoryChart = new Chart(categoryCtx, {
          type: 'bar',
          data: { labels: subeler, datasets },
          options: {
            responsive: true,
            scales: {
              x: { stacked: true },
              y: { stacked: true, beginAtZero: true }
            },
            plugins: {
              legend: { position: 'bottom' },
              title: {
                display: true,
                text: `${year} Yılı Ürün Kategorisine Göre Şube Satışları`
              }
            }
          }
        });

      } 
      // PIE GRAFİK
      else {

        const toplamlar = {};
        data.forEach(d => {
          toplamlar[d.kategori_ad] = (toplamlar[d.kategori_ad] || 0) + Number(d.toplam_satis);
        });

        categoryChart = new Chart(categoryCtx, {
          type: 'pie',
          data: {
            labels: Object.keys(toplamlar),
            datasets: [{
              data: Object.values(toplamlar),
              backgroundColor: Object.keys(toplamlar).map(k => colorPalette[k])
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom' },
              title: {
                display: true,
                text: `${year} Yılı Kategori Bazlı Toplam Satış`
              }
            }
          }
        });
      }
    });
};

document.getElementById("toggleCategoryChart").addEventListener("click", () => {
  categoryChartType = categoryChartType === "bar" ? "pie" : "bar";

  document.getElementById("toggleCategoryChart").innerText =
    categoryChartType === "bar" ? "Pasta Grafiğe Geç" : "Sütun Grafiğe Geç";

  fetchCategoryPerformance(categoryYearSelect.value);
});



// Sayfa yüklenince varsayılan yıl için çek
fetchCategoryPerformance(categoryYearSelect.value);

// Filtrele butonu
categoryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  fetchCategoryPerformance(categoryYearSelect.value);
});
});