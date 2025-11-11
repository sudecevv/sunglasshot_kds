document.addEventListener("DOMContentLoaded", () => {

  // --- En çok satış yapan şubeler ---
  const topForm = document.getElementById('top-sales-form');
  const topYearSelect = document.getElementById('top-sales-year');
  const topCtx = document.getElementById('satisGrafik').getContext('2d');
  let topChart; // Chart örneği

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
      console.log(`📊 ${year} yılı kategori performansı verisi:`, data);

      const subeler = [...new Set(data.map(item => item.sube_ad))];
      const kategoriler = [...new Set(data.map(item => item.kategori_ad))];

      const datasets = kategoriler.map(kat => ({
        label: kat,
        data: subeler.map(sube => {
          const kayit = data.find(d => d.sube_ad === sube && d.kategori_ad === kat);
          return kayit ? Number(kayit.toplam_satis) : 0;
        }),
        backgroundColor: colorPalette[kat] || 'rgba(100,100,100,0.7)',
        borderColor: 'rgba(255,255,255,0.8)',
        borderWidth: 1
      }));

      if (categoryChart) categoryChart.destroy();

      categoryChart = new Chart(categoryCtx, {
        type: 'bar',
        data: {
          labels: subeler,
          datasets: datasets
        },
        options: {
          responsive: true,
          scales: {
            x: { stacked: true,ticks: { color: '#333' } },
            y: { stacked: true, beginAtZero: true ,ticks: { color: '#333' }}
          },
          plugins: {
            title: {
              display: true,
              text: `${year} Yılı Ürün Kategorisine Göre Şube Satışları`,
              font: { size: 18, weight: 'bold' }
            },
              legend: {
                position: 'bottom',
                labels: {
                  font: { size: 13 },
                  color: '#333'
                }
              }
            }
          }
      });
    })
    .catch(err => console.error("🚨 Kategori performansı verisi alınamadı:", err));
};

// Sayfa yüklenince varsayılan yıl için çek
fetchCategoryPerformance(categoryYearSelect.value);

// Filtrele butonu
categoryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  fetchCategoryPerformance(categoryYearSelect.value);
});
});