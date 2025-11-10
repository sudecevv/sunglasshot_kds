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



  // --- En az satış yapan şubeler ---
  const lowForm = document.getElementById('lowest-sales-form');
  const lowYearSelect = document.getElementById('lowest-sales-year');
  const lowCtx = document.getElementById('branchChart').getContext('2d');
  let lowChart;

  const fetchLowestSales = (year) => {
    fetch(`http://localhost:3000/api/lowest-sales?year=${year}`)
      .then(res => res.json())
      .then(data => {
        console.log(`📉 ${year} yılı en az satış yapan şubeler:`, data);

        const subeAdlari = data.map(item => item.sube_ad);
        const satislar = data.map(item => Number(item.toplam_satis));

        if (lowChart) lowChart.destroy();

        lowChart = new Chart(lowCtx, {
          type: 'bar',
          data: {
            labels: subeAdlari,
            datasets: [{
              label: `${year} Yılı En Az Satış (Adet)`,
              data: satislar,
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
          }
        });
      })
      .catch(err => console.error("🚨 En az satış verisi alınamadı:", err));
  };

  fetchLowestSales(lowYearSelect.value);

  lowForm.addEventListener('submit', (e) => {
    e.preventDefault();
    fetchLowestSales(lowYearSelect.value);
  });

});
