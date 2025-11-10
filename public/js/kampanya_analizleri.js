document.addEventListener('DOMContentLoaded', () => {
  // Backend base adresi (geliştirme: portu doğru ver)
  const API_BASE = 'http://localhost:3000/api';

  // Elemanlar
  const cmpForm = document.getElementById('cmp-filter-form');
  const cmpYear = document.getElementById('cmp-year');
  const cmpCanvas = document.getElementById('cmpChart');

  const profitForm = document.getElementById('camp-profit-filter');
  const profitYear = document.getElementById('profit-year');
  const profitCanvas = document.getElementById('profitChart');

  let cmpChart, profitChart;

  // Formatlayıcı (para)
  const formatTL = (v) => new Intl.NumberFormat('tr-TR', { style:'currency', currency:'TRY', maximumFractionDigits:0 }).format(v);

  // 1) Kampanya karşılaştırma (örnek: kampanya bazlı toplam_kar)
  const loadCampaignProfits = (year) => {
    fetch(`${API_BASE}/campaign-profits?year=${year}`)
      .then(r => { if(!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => {
        const labels = data.map(d => d.kampanya_ad);
        const vals = data.map(d => Number(d.toplam_kar) || 0);

        if (cmpChart) cmpChart.destroy();
        cmpChart = new Chart(cmpCanvas, {
          type: 'bar',
          data: { labels, datasets: [{ label: `${year} Toplam Kazanç (TL)`, data: vals }] },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: { callbacks: { label: ctx => formatTL(ctx.parsed.y) } },
              legend: { display: false }
            },
            scales: { y: { beginAtZero:true, ticks:{ callback: val => formatTL(val) } } }
          }
        });
        setTimeout(() => cmpChart.resize(), 30);
      })
      .catch(err => { console.error('Kampanya verisi alınamadı', err); });
  };

  // 2) Kampanyaların karları (örnek: tüm kampanyaların yıllık sütun grafiği)
  const loadProfitOverview = (year) => {
    fetch(`${API_BASE}/campaign-profits?year=${year}`)
      .then(r => { if(!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => {
        const labels = data.map(d => d.kampanya_ad);
        const vals = data.map(d => Number(d.toplam_kar) || 0);

        if (profitChart) profitChart.destroy();
        profitChart = new Chart(profitCanvas, {
          type: 'bar',
          data: { labels, datasets: [{
            label: 'Kampanya Karları (TL)', data: vals, backgroundColor: 'rgba(54,162,235,0.45)', borderColor:'rgba(54,162,235,1)', borderWidth:1
          }]},
          options: {
            responsive:true,
            maintainAspectRatio:false,
            plugins: {
              tooltip: { callbacks: { label: ctx => formatTL(ctx.parsed.y) } }
            },
            scales: { y:{ beginAtZero:true, ticks:{ callback: val => formatTL(val) } } }
          }
        });
        setTimeout(() => profitChart.resize(), 30);
      })
      .catch(err => { console.error('Profit overview alınamadı', err); });
  };

  // init
  loadCampaignProfits(cmpYear.value);
  loadProfitOverview(profitYear.value);

  // eventler
  cmpForm.addEventListener('submit', e => { e.preventDefault(); loadCampaignProfits(cmpYear.value); });
  profitForm.addEventListener('submit', e => { e.preventDefault(); loadProfitOverview(profitYear.value); });

  // autosize on container change
  const ro = new ResizeObserver(() => { if(cmpChart) cmpChart.resize(); if(profitChart) profitChart.resize(); });
  ro.observe(document.querySelector('.cards'));
});
