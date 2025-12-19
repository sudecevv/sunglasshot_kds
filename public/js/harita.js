document.addEventListener("DOMContentLoaded", () => {

    // ⭐ NÜFUS HARİTASI İÇİN ADAY ŞUBELER
    const adaySubeler = [
    {
        ad: "Konak (Aday)",
        lat: 38.4192,
        lon: 27.1287,
        nufus: 332277
    },
    {
        ad: "Bornova (Aday)",
        lat: 38.4697,
        lon: 27.2211,
        nufus: 445232
    },
    {
        ad: "Bayraklı (Aday)",
        lat: 38.4622,
        lon: 27.1671,
        nufus: 296839
    }
    ];

    // ⭐ SATIŞ HARİTASI İÇİN TEK ÖNERİLEN MAĞAZA
    const onerilenMagaza = {
    ad: "Bayraklı (Önerilen Mağaza)",
    lat: 38.4622,
    lon: 27.1671
    };

    // 🌍 1️⃣ SATIŞ HARİTASI
    const map = L.map('map').setView([38.42, 27.14], 10); // İzmir merkezi
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    fetch("http://localhost:3000/api/satis-harita")
        .then(res => res.json())
        .then(data => {
            const coordinates = []; // 🔸 Şube konumlarını saklayacağız

            data.forEach(sube => {
                let color;
                if (sube.toplam_satis < 20000) color = "green";
                else if (sube.toplam_satis >= 20000 && sube.toplam_satis <= 40000) color = "blue";
                else color = "red";

                // 🔹 Marker oluştur
                const marker = L.circleMarker([sube.lat, sube.lon], {
                    radius: 9,
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.8,
                    weight: 2
                }).addTo(map);

                // 🔹 Popup ekle
                marker.bindPopup(`
                    <b>${sube.sube_ad}</b><br>
                    Toplam Satış: ${sube.toplam_satis.toLocaleString("tr-TR")}
                `);

                coordinates.push([sube.lat, sube.lon]);
            });

            // 🔸 Şubeleri bağlayan kesikli çizgi (turuncu)
            if (coordinates.length > 1) {
                L.polyline(coordinates, {
                    color: "orange",
                    weight: 3,
                    opacity: 0.8,
                    dashArray: "6, 8"
                }).addTo(map);
            }
        })
        .catch(err => console.error("🚨 Satış haritası verisi alınamadı:", err));

    // ⭐ SADECE ÖNERİLEN MAĞAZA – SATIŞ HARİTASI
    const oMarker = L.circleMarker([onerilenMagaza.lat, onerilenMagaza.lon], {
    radius: 12,
    color: "orange",
    fillColor: "orange",
    fillOpacity: 0.9,
    weight: 4
    }).addTo(map);

    oMarker.bindPopup(`
    <b>${onerilenMagaza.ad}</b><br>
    Satış verisi henüz yok<br>
    Karar Destek Sistemi Önerisi
    `);




    // 👥 2️⃣ NÜFUS HARİTASI
    const populationMap = L.map('population-map').setView([38.42, 27.14], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(populationMap);

    fetch("http://localhost:3000/api/nufus-harita")
        .then(res => res.json())
        .then(data => {
            data.forEach(ilce => {
                let color;
                if (ilce.nufus2025 < 100000) color = "green";
                else if (ilce.nufus2025 >= 100000 && ilce.nufus2025 <= 300000) color = "blue";
                else color = "red";

                const marker = L.circleMarker([ilce.lat, ilce.lon], {
                    radius: 9,
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.8,
                    weight: 2
                }).addTo(populationMap);

                marker.bindPopup(`
                    <b>${ilce.ilce_ad}</b><br>
                    Nüfus: ${ilce.nufus2025.toLocaleString("tr-TR")}
                `);
            });
        })
        .catch(err => console.error("🚨 Nüfus haritası verisi alınamadı:", err));

    // ⭐ ADAY ŞUBELER – SADECE NÜFUS HARİTASI
    adaySubeler.forEach(sube => {
    let color;
    if (sube.nufus < 100000) color = "green";
    else if (sube.nufus <= 300000) color = "blue";
    else color = "red";

    const marker = L.circleMarker([sube.lat, sube.lon], {
        radius: 10,
        color: "orange",
        fillColor: color,
        fillOpacity: 0.85,
        weight: 3,
        dashArray: "4"
    }).addTo(populationMap);

    marker.bindPopup(`
        <b>${sube.ad}</b><br>
        Nüfus: ${sube.nufus.toLocaleString("tr-TR")}<br>
        Durum: Aday Lokasyon
    `);
    });




    // 📊 3️⃣ GRAFİK (Şube Satışları)
    fetch("http://localhost:3000/api/satis-harita")
        .then(res => res.json())
        .then(data => {
            const ctx = document.getElementById("districtChart").getContext("2d");

            const labels = data.map(item => item.sube_ad);
            const values = data.map(item => item.toplam_satis);

            // 🎨 Göz alıcı sabit renk paleti
            const backgroundColors = [
                "#ff000040", "#f92b2bff", "#e94c4cff", "#ff000088", "#e91616ff",
                "#f64747ff", "#ea2a2aff", "#e60000d4", "#ff2222e6", "#f50000ff"
            ];

            new Chart(ctx, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Toplam Satışlar",
                        data: values,
                        backgroundColor: backgroundColors.slice(0, values.length),
                        borderColor: "#fff",
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: "Şubelere Göre Satış Performansı",
                            font: { size: 18, weight: "bold" },
                            color: "#1c1c1c"
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: "#1c1c1c",
                                font: { size: 12, weight: "600" }
                            },
                            grid: { display: false }
                        },
                        y: {
                            ticks: {
                                color: "#1c1c1c",
                                font: { size: 12 },
                                beginAtZero: true
                            },
                            grid: { color: "rgba(0,0,0,0.05)" }
                        }
                    }
                }
            });
        })
        .catch(err => console.error("🚨 Grafik verisi alınamadı:", err));


});
