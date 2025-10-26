fetch('/api/en-cok-satan-sube')
  .then(res => res.json())
  .then(data => {
    const subeAdlari = data.map(item => item.sube_adi);
    const satislar = data.map(item => item.toplam_satis);

    new Chart(document.getElementById('satisGrafik'), {
      type: 'bar',
      data: {
        labels: subeAdlari,
        datasets: [{
          label: 'Toplam Satış (TL)',
          data: satislar,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  })
  .catch(err => console.error('Veri alınamadı:', err));
