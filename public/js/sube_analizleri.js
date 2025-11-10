// js/sube_analiz.js
document.addEventListener('DOMContentLoaded', () => {
  // API rota: senin mevcut generic router'ına göre /api/data/sube çalışmalı.
  // Eğer farklıysa (ör. /api/branches) burayı değiştir.
  const BRANCH_API = '/api/data/sube';

  const branchSelect = document.getElementById('top-sales-branch');
  const salesChartCanvas = document.getElementById('salesChart');

  // Chart.js örneği (başlangıçta boş)
  let salesChart;

  // Helper: select'e option ekle
  function addOption(selectEl, value, text) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = text;
    selectEl.appendChild(opt);
  }

  // 1) Şubeleri al ve select'i doldur
  fetch(BRANCH_API)
    .then(res => {
      if (!res.ok) throw new Error(`Network response was not ok (${res.status})`);
      return res.json();
    })
    .then(data => {
      // Beklenen format: [{ sube_id: 1, sube_ad: 'Balçova' }, ...]
      // Eğer veri farklıysa console.log edin ve map kısmını değiştirin.
      console.log('📥 Şube verisi:', data);

      if (!Array.isArray(data) || data.length === 0) {
        // Eğer backend boş dönüyorsa fallback olarak sabit şubeleri ekleyelim
        addOption(branchSelect, 'balcova', 'Balçova');
        addOption(branchSelect, 'karsiyaka', 'Karşıyaka');
        addOption(branchSelect, 'gaziemir', 'Gaziemir');
        return;
      }

      // Boş bırakma seçeneği
      addOption(branchSelect, '', 'Tüm Şubeler (Seçiniz)');

      // Map ve doldurma - farklı field isimleri varsa burayı değiştir.
      data.forEach(item => {
        // Eğer backend 'sube_ad' yerine başka isim kullanıyorsa bunu güncelle
        const id = item.sube_id ?? item.id ?? item.ID ?? item.id_sube ?? item.idSube;
        const name = item.sube_ad ?? item.name ?? item.ad ?? item.subeAdi;
        if (id == null || !name) return;
        addOption(branchSelect, id, name);
      });

      // İsteğe bağlı: ilk seçili ile grafik çek
      // (Burada tüm şubeler için bir fonksiyon çağrısı yapılabilir,
      // örneğin fetchBranchMonthlyProfit(id))
    })
    .catch(err => {
      console.error('🚨 Şube verisi alınamadı:', err);
      // Hemen fallback ekle (kullanıcı görsün)
      addOption(branchSelect, 'balcova', 'Balçova');
      addOption(branchSelect, 'karsiyaka', 'Karşıyaka');
      addOption(branchSelect, 'gaziemir', 'Gaziemir');
    });

  // 2) Şube seçildiğinde çalışacak örnek handler (grafik için)
  branchSelect.addEventListener('change', (e) => {
    const subeId = e.target.value;
    // Eğer boşsa tüm şubeler veya kullanıcı seçmedi demektir
    if (!subeId) {
      // grafik temizle veya tüm veriyi yükle
      if (salesChart) salesChart.destroy();
      return;
    }

    // Örnek API: aylara göre kar getiren bir endpoint olabilir.
    // Bu rota sunucunda yoksa kendine göre düzenle.
    const MONTHLY_API = `/api/monthly-profit?sube_id=${encodeURIComponent(subeId)}&year=2025`;

    fetch(MONTHLY_API)
      .then(res => {
        if (!res.ok) throw new Error(`(${res.status})`);
        return res.json();
      })
      .then(data => {
        // Örnek beklenen data: [{ ay: 'Ocak', toplam_kar: 1234 }, ...]
        const labels = data.map(d => d.ay ?? d.month ?? '—');
        const vals = data.map(d => Number(d.toplam_kar ?? d.kar ?? 0));

        // Chart update/create
        if (salesChart) salesChart.destroy();
        salesChart = new Chart(salesChartCanvas, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Aylık Kar',
              data: vals,
              fill: false,
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
          }
        });

        // resize güvenliği
        setTimeout(() => salesChart.resize(), 50);
      })
      .catch(err => {
        console.error('🚨 Aylık kar verisi alınamadı:', err);
      });
  });

  // Eğer sayfa başka bir js ile chart yükleniyorsa ve select boş kalıyorsa,
  // burada console.log veya debug için bir timeout ile içeriği yazdır:
  setTimeout(() => {
    console.log('select options:', Array.from(branchSelect.options).map(o => ({ value: o.value, text: o.text })));
  }, 1000);
});
