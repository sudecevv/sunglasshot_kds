document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     🔹 ELEMENTLER
  =============================== */
  const sube1Select = document.getElementById("sube1");
  const sube2Select = document.getElementById("sube2");
  const yearSelect = document.getElementById("campaign-year");
  const filterForm = document.getElementById("campaign-filter-form");
  const kampanyaSelect = document.getElementById("kampanyaSelect");

  const comparisonCtx =
    document.getElementById("campaignComparisonChart").getContext("2d");
  const etkiCtx =
    document.getElementById("kampanyaEtkisiChart").getContext("2d");

  let campaignChart = null;
  let etkiChart = null;

  /* ===============================
     🔹 ŞUBE DROPDOWN
  =============================== */
  fetch("http://localhost:3000/api/subeler")
    .then(res => res.json())
    .then(subeler => {

      subeler.forEach(s => {
        sube1Select.add(new Option(s.sube_ad, s.sube_id));
        sube2Select.add(new Option(s.sube_ad, s.sube_id));
      });

      if (subeler.length >= 2) {
        sube1Select.value = subeler[0].sube_id;
        sube2Select.value = subeler[1].sube_id;
      }

      filterForm.dispatchEvent(new Event("submit"));
    });

  /* ===============================
     🔹 KAMPANYA KARŞILAŞTIRMA
  =============================== */
  filterForm.addEventListener("submit", e => {
    e.preventDefault();

    fetch(
      `http://localhost:3000/api/kampanya-performans?yil=${yearSelect.value}&sube1=${sube1Select.value}&sube2=${sube2Select.value}`
    )
      .then(res => res.json())
      .then(data => {

        if (campaignChart) campaignChart.destroy();

        campaignChart = new Chart(comparisonCtx, {
          type: "bar",
          data: {
            labels: data.map(d => d.kampanya_ad),
            datasets: [
              {
                label: "Şube 1",
                data: data.map(d => Number(d.sube1_toplam)),
                backgroundColor: "rgba(157, 72, 232, 1)"
              },
              {
                label: "Şube 2",
                data: data.map(d => Number(d.sube2_toplam)),
                backgroundColor: "rgba(238, 130, 238, 0.8)"
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: `${yearSelect.value} Kampanya Performans Karşılaştırması`
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
      });
  });

  /* ===============================
     🔹 KAMPANYA LİSTESİ
  =============================== */
  fetch("http://localhost:3000/api/kampanya-listesi")
    .then(res => res.json())
    .then(data => {

      kampanyaSelect.innerHTML = "";

      data.forEach(k => {
        const text =
          `${k.kampanya_ad} (${new Date(k.baslangic_tarihi).getFullYear()})`;
        kampanyaSelect.add(new Option(text, k.kampanya_id));
      });

      // ✅ İlk kampanya otomatik yüklensin
      if (data.length > 0) {
        const firstId = data[0].kampanya_id;
        loadKampanyaEtkisi(firstId);
        loadKampanyaKPI(firstId);
      }
    });

  kampanyaSelect.addEventListener("change", e => {
    const id = e.target.value;
    loadKampanyaEtkisi(id);
    loadKampanyaKPI(id);
  });

  /* ===============================
     🔹 KAMPANYA ETKİSİ GRAFİĞİ
  =============================== */
  function loadKampanyaEtkisi(id) {
    fetch(`http://localhost:3000/api/kampanya-oncesi-sonrasi?kampanya_id=${id}`)
      .then(res => res.json())
      .then(d => {

        if (etkiChart) etkiChart.destroy();

        const once = Number(d.once_satis);
        const sonra = Number(d.kampanya_satis);

        const lift =
          once > 0 ? (((sonra - once) / once) * 100).toFixed(1) : 0;

        const baslangic =
          new Date(d.baslangic_tarihi).toLocaleDateString("tr-TR");
        const bitis =
          new Date(d.bitis_tarihi).toLocaleDateString("tr-TR");

        etkiChart = new Chart(etkiCtx, {
          type: "bar",
          data: {
            labels: [
              "Öncesi (−30 gün)",
              `Kampanya (${baslangic} – ${bitis})`
            ],
            datasets: [{
              data: [once, sonra],
              backgroundColor: [
                "rgba(130, 120, 255, 0.8)",
                "rgba(238, 130, 238, 0.8)"
              ],
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              title: {
                display: true,
                text: `${d.kampanya_ad} | Satış Etkisi %${lift}`
              }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
      });
  }

});

/* ===============================
   🔹 KPI ALANI
=============================== */
function loadKampanyaKPI(kampanyaId) {
  fetch(`http://localhost:3000/api/kampanya-kpi?kampanya_id=${kampanyaId}`)
    .then(res => res.json())
    .then(d => {

      const once = Number(d.once_satis);
      const sonra = Number(d.kampanya_satis);
      const ciro = Number(d.kampanya_ciro);

      const artis =
        once > 0 ? (((sonra - once) / once) * 100).toFixed(1) : 0;

      document.getElementById("kpi-artis").innerText = `%${artis}`;
      document.getElementById("kpi-adet").innerText =
        sonra.toLocaleString("tr-TR");
      document.getElementById("kpi-ciro").innerText =
        ciro.toLocaleString("tr-TR") + " ₺";
    });
}

// Sayfa yüklenince otomatik çalışsın:
document.addEventListener("DOMContentLoaded", loadKampanyaKarChart);
