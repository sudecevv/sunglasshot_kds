document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('top-sales-form');
  const yearSelect = document.getElementById('top-sales-year');
  const ctx = document.getElementById('satisGrafik');

  let chart; // Chart.js örneğini tutacağız

  // 📌 Grafik verisini çeken fonksiyon
  const fetchData = (year) => {
    fetch(`http://localhost:3000/api/en-cok-satan-sube?year=${year}`)
      .then(res => res.json())
      .then(data => {
        console.log(`📊 ${year} yılı verisi:`, data);

        const subeAdlari = data.map(item => item.sube_ad);
        const satislar = data.map(item => item.toplam_satis);

        if (chart) chart.destroy(); // Önceki grafiği temizle

        chart = new Chart(ctx, {
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
      .catch(err => console.error("🚨 Veri alınamadı:", err));
  };

  // Sayfa yüklendiğinde varsayılan yıl (ör: 2025)
  fetchData(yearSelect.value);

  // 📌 Filtreleme butonu
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const selectedYear = yearSelect.value;
    fetchData(selectedYear);
  });
});