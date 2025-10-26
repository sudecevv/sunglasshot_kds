fetch('/api/en-cok-satan-sube')
  .then(res => res.json())
  .then(data => {
    console.log("📊 API'den gelen veri:", data);

    if (!Array.isArray(data)) {
      console.error("⚠️ Beklenen veri formatı dizi değil:", data);
      alert("Veri alınamadı, konsolu kontrol et!");
      return;
    }

    const subeAdlari = data.map(item => item.sube_ad);
    const satislar = data.map(item => item.toplam_satis);

    const ctx = document.getElementById('satisGrafik');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: subeAdlari,
        datasets: [{
          label: 'Toplam Satış (Adet)',
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


